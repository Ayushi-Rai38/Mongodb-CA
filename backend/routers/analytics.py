"""
routers/analytics.py – All statistics powered by MongoDB aggregation pipelines.
"""

from datetime import datetime, timedelta
from fastapi import APIRouter

from database import pets_collection, applications_collection

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
def get_summary():
    """Total, available, pending, and adopted pet counts + application counts."""
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    pet_by_status = {doc["_id"]: doc["count"]
                     for doc in pets_collection.aggregate(pipeline)}

    app_pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    app_by_status = {doc["_id"]: doc["count"]
                     for doc in applications_collection.aggregate(app_pipeline)}

    return {
        "total_pets":         sum(pet_by_status.values()),
        "available_pets":     pet_by_status.get("available", 0),
        "pending_pets":       pet_by_status.get("pending", 0),
        "adopted_pets":       pet_by_status.get("adopted", 0),
        "total_applications": sum(app_by_status.values()),
        "pending_applications":  app_by_status.get("pending", 0),
        "approved_applications": app_by_status.get("approved", 0),
        "rejected_applications": app_by_status.get("rejected", 0),
    }


@router.get("/by-species")
def pets_by_species():
    """Pet count grouped by species."""
    pipeline = [
        {"$group": {"_id": "$species", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    return [{"species": d["_id"], "count": d["count"]}
            for d in pets_collection.aggregate(pipeline)]


@router.get("/applications-by-status")
def applications_by_status():
    """Application count grouped by status."""
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    return [{"status": d["_id"], "count": d["count"]}
            for d in applications_collection.aggregate(pipeline)]


@router.get("/monthly-trends")
def monthly_trends(months: int = 6):
    """Application counts grouped by month for the last N months."""
    start = datetime.utcnow() - timedelta(days=months * 30)
    pipeline = [
        {"$match": {"applied_at": {"$gte": start}}},
        {
            "$group": {
                "_id": {
                    "year":  {"$year": "$applied_at"},
                    "month": {"$month": "$applied_at"},
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {
            "$project": {
                "_id": 0,
                "month": {
                    "$concat": [
                        {"$toString": "$_id.year"}, "-",
                        {"$cond": [
                            {"$lt": ["$_id.month", 10]},
                            {"$concat": ["0", {"$toString": "$_id.month"}]},
                            {"$toString": "$_id.month"},
                        ]},
                    ]
                },
                "count": 1,
            }
        },
    ]
    return list(applications_collection.aggregate(pipeline))


@router.get("/avg-age-by-species")
def avg_age_by_species():
    """Average pet age grouped by species."""
    pipeline = [
        {"$group": {
            "_id": "$species",
            "avg_age": {"$avg": "$age"},
            "count":   {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
        {"$project": {
            "_id": 0,
            "species": "$_id",
            "avg_age": {"$round": ["$avg_age", 1]},
            "count": 1,
        }},
    ]
    return list(pets_collection.aggregate(pipeline))


@router.get("/top-applied-pets")
def top_applied_pets(limit: int = 5):
    """Most frequently applied-for pets."""
    pipeline = [
        {"$group": {"_id": "$pet_id", "application_count": {"$sum": 1}}},
        {"$sort": {"application_count": -1}},
        {"$limit": limit},
        {
            "$lookup": {
                "from": "pets",
                "localField": "_id",
                "foreignField": "_id",
                "as": "pet",
            }
        },
        {"$unwind": {"path": "$pet", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 0,
                "pet_id":           {"$toString": "$_id"},
                "application_count": 1,
                "pet_name":   "$pet.name",
                "pet_species": "$pet.species",
                "pet_image":  "$pet.image_url",
            }
        },
    ]
    return list(applications_collection.aggregate(pipeline))


@router.get("/adoption-rate")
def adoption_rate():
    """Adoption success rate = adopted / total pets * 100."""
    total   = pets_collection.count_documents({})
    adopted = pets_collection.count_documents({"status": "adopted"})
    rate = round((adopted / total * 100), 1) if total else 0
    return {
        "total_pets":   total,
        "adopted_pets": adopted,
        "rate_percent": rate,
    }


@router.get("/species-status-breakdown")
def species_status_breakdown():
    """Matrix of (species, status) counts for stacked charts."""
    pipeline = [
        {"$group": {
            "_id": {"species": "$species", "status": "$status"},
            "count": {"$sum": 1},
        }},
        {"$project": {
            "_id": 0,
            "species": "$_id.species",
            "status":  "$_id.status",
            "count":   1,
        }},
        {"$sort": {"species": 1, "status": 1}},
    ]
    return list(pets_collection.aggregate(pipeline))
