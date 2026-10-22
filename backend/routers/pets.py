"""
routers/pets.py – CRUD + search/filter/sort/pagination for pets.
"""

import math
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends, status
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING

from database import pets_collection
from models import PetCreate, PetUpdate, PetResponse, PaginatedPets
from auth import require_admin
from utils import doc_to_dict, oid

router = APIRouter(prefix="/api/pets", tags=["Pets"])


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _build_filter(
    search: Optional[str],
    species: Optional[str],
    gender: Optional[str],
    status: Optional[str],
    vaccinated: Optional[bool],
    location: Optional[str],
    age_min: Optional[float],
    age_max: Optional[float],
) -> dict:
    query: dict = {}

    if search:
        query["$text"] = {"$search": search}

    if species:
        query["species"] = species.lower()

    if gender:
        query["gender"] = gender.lower()

    if status:
        query["status"] = status.lower()

    if vaccinated is not None:
        query["vaccinated"] = vaccinated

    if location:
        query["location"] = {"$regex": location, "$options": "i"}

    age_filter: dict = {}
    if age_min is not None:
        age_filter["$gte"] = age_min
    if age_max is not None:
        age_filter["$lte"] = age_max
    if age_filter:
        query["age"] = age_filter

    return query


def _sort_key(sort_by: str, sort_dir: str):
    direction = ASCENDING if sort_dir == "asc" else DESCENDING
    allowed = {"name", "age", "created_at", "species", "breed", "status"}
    field = sort_by if sort_by in allowed else "created_at"
    return [(field, direction)]


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@router.get("", response_model=PaginatedPets)
def list_pets(
    search:    Optional[str]   = Query(None),
    species:   Optional[str]   = Query(None),
    gender:    Optional[str]   = Query(None),
    pet_status: Optional[str]  = Query(None, alias="status"),
    vaccinated: Optional[bool] = Query(None),
    location:  Optional[str]   = Query(None),
    age_min:   Optional[float] = Query(None, ge=0),
    age_max:   Optional[float] = Query(None, le=30),
    sort_by:   str             = Query("created_at"),
    sort_dir:  str             = Query("desc"),
    page:      int             = Query(1, ge=1),
    per_page:  int             = Query(12, ge=1, le=100),
):
    flt = _build_filter(search, species, gender, pet_status, vaccinated, location, age_min, age_max)
    total = pets_collection.count_documents(flt)
    skip = (page - 1) * per_page
    sort = _sort_key(sort_by, sort_dir)

    cursor = pets_collection.find(flt).sort(sort).skip(skip).limit(per_page)
    docs = [doc_to_dict(d) for d in cursor]

    return {
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "pages":    math.ceil(total / per_page) if total else 0,
        "data":     docs,
    }


@router.get("/{pet_id}", response_model=PetResponse)
def get_pet(pet_id: str):
    try:
        _id = oid(pet_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid pet ID format")

    doc = pets_collection.find_one({"_id": _id})
    if not doc:
        raise HTTPException(status_code=404, detail="Pet not found")
    return doc_to_dict(doc)


@router.post("", response_model=PetResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def create_pet(payload: PetCreate):
    now = datetime.utcnow()
    data = payload.model_dump()
    data["created_at"] = now
    data["updated_at"] = now
    result = pets_collection.insert_one(data)
    doc = pets_collection.find_one({"_id": result.inserted_id})
    return doc_to_dict(doc)


@router.put("/{pet_id}", response_model=PetResponse,
            dependencies=[Depends(require_admin)])
def update_pet(pet_id: str, payload: PetUpdate):
    try:
        _id = oid(pet_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid pet ID format")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.utcnow()
    result = pets_collection.update_one({"_id": _id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pet not found")

    doc = pets_collection.find_one({"_id": _id})
    return doc_to_dict(doc)


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_pet(pet_id: str):
    try:
        _id = oid(pet_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid pet ID format")

    result = pets_collection.delete_one({"_id": _id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pet not found")
