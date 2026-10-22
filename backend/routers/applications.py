"""
routers/applications.py – Adoption application endpoints.

Concurrency note:
  MongoDB 4.x standalone does not support multi-document transactions.
  We simulate atomicity for the "approve" flow with a conditional update
  (find_one_and_update with filter on status=="available") so we never
  accidentally adopt an already-adopted pet.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends, status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from database import pets_collection, applications_collection
from models import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse
from auth import require_admin
from utils import doc_to_dict, oid

router = APIRouter(prefix="/api/applications", tags=["Applications"])


def _enrich(doc: dict) -> dict:
    """Attach pet_name and pet_image to an application document."""
    d = doc_to_dict(doc)
    try:
        pet = pets_collection.find_one({"_id": ObjectId(d["pet_id"])},
                                       {"name": 1, "image_url": 1})
        if pet:
            d["pet_name"]  = pet.get("name", "")
            d["pet_image"] = pet.get("image_url", "")
    except Exception:
        pass
    return d


# ──────────────────────────────────────────────
# Public routes
# ──────────────────────────────────────────────

@router.post("", response_model=ApplicationResponse, status_code=201)
def submit_application(payload: ApplicationCreate):
    """Submit a new adoption application. Prevents duplicates."""
    try:
        pet_oid = oid(payload.pet_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid pet_id")

    pet = pets_collection.find_one({"_id": pet_oid})
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    if pet["status"] == "adopted":
        raise HTTPException(status_code=409, detail="This pet has already been adopted")

    now = datetime.utcnow()
    data = payload.model_dump()
    data["pet_id"]    = pet_oid          # store as ObjectId
    data["status"]    = "pending"
    data["applied_at"] = now
    data["updated_at"] = now
    data["admin_note"] = None

    try:
        result = applications_collection.insert_one(data)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="You have already submitted an application for this pet",
        )

    # Mark pet as "pending" if it's still available
    pets_collection.update_one(
        {"_id": pet_oid, "status": "available"},
        {"$set": {"status": "pending", "updated_at": now}},
    )

    doc = applications_collection.find_one({"_id": result.inserted_id})
    return _enrich(doc)


@router.get("/my/{email}", response_model=list[ApplicationResponse])
def get_my_applications(email: str):
    """Retrieve all applications for a given applicant email."""
    cursor = applications_collection.find(
        {"applicant_email": {"$regex": f"^{email}$", "$options": "i"}}
    ).sort("applied_at", -1)
    return [_enrich(d) for d in cursor]


# ──────────────────────────────────────────────
# Admin routes
# ──────────────────────────────────────────────

@router.get("", response_model=list[ApplicationResponse],
            dependencies=[Depends(require_admin)])
def list_all_applications(
    app_status: Optional[str] = Query(None, alias="status"),
    page:       int           = Query(1, ge=1),
    per_page:   int           = Query(50, ge=1, le=200),
):
    flt = {}
    if app_status:
        flt["status"] = app_status
    skip = (page - 1) * per_page
    cursor = applications_collection.find(flt).sort("applied_at", -1).skip(skip).limit(per_page)
    return [_enrich(d) for d in cursor]


@router.put("/{app_id}/status", response_model=ApplicationResponse,
            dependencies=[Depends(require_admin)])
def update_application_status(app_id: str, payload: ApplicationStatusUpdate):
    """
    Approve or reject an application.
    - Approve  → mark pet as 'adopted'; reject all other pending apps for same pet.
    - Reject   → if no other pending apps remain, restore pet to 'available'.
    """
    try:
        _id = oid(app_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application ID")

    app = applications_collection.find_one({"_id": _id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app["status"] != "pending":
        raise HTTPException(status_code=409,
                            detail="Only pending applications can be updated")

    now = datetime.utcnow()
    pet_oid = app["pet_id"]

    if payload.status.value == "approved":
        # Atomically adopt only if pet is still pending/available
        pet = pets_collection.find_one_and_update(
            {"_id": pet_oid, "status": {"$in": ["available", "pending"]}},
            {"$set": {"status": "adopted", "updated_at": now}},
        )
        if not pet:
            raise HTTPException(
                status_code=409,
                detail="Pet is no longer available for adoption",
            )
        # Reject all other pending applications for same pet
        applications_collection.update_many(
            {"pet_id": pet_oid, "_id": {"$ne": _id}, "status": "pending"},
            {"$set": {"status": "rejected",
                      "admin_note": "Another application was approved.",
                      "updated_at": now}},
        )

    elif payload.status.value == "rejected":
        # Count remaining pending applications after this one is rejected
        remaining = applications_collection.count_documents(
            {"pet_id": pet_oid, "_id": {"$ne": _id}, "status": "pending"}
        )
        if remaining == 0:
            # Restore pet to available
            pets_collection.update_one(
                {"_id": pet_oid, "status": {"$in": ["pending", "adopted"]}},
                {"$set": {"status": "available", "updated_at": now}},
            )

    applications_collection.update_one(
        {"_id": _id},
        {"$set": {
            "status":     payload.status.value,
            "admin_note": payload.admin_note,
            "updated_at": now,
        }},
    )

    doc = applications_collection.find_one({"_id": _id})
    return _enrich(doc)
