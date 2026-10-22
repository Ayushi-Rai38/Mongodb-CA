"""
database.py – PyMongo client, collection references, schema validators, and indexes.
"""

import os
from pymongo import MongoClient, ASCENDING, TEXT
from pymongo.errors import CollectionInvalid
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "pawpal_db")

client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

# ──────────────────────────────────────────────
# $jsonSchema validators
# ──────────────────────────────────────────────

PET_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["name", "species", "breed", "age", "gender", "status", "location"],
        "properties": {
            "name":        {"bsonType": "string", "minLength": 1},
            "species":     {"bsonType": "string", "enum": ["dog", "cat", "rabbit", "bird"]},
            "breed":       {"bsonType": "string", "minLength": 1},
            "age":         {"bsonType": ["int", "double"], "minimum": 0},
            "gender":      {"bsonType": "string", "enum": ["male", "female"]},
            "vaccinated":  {"bsonType": "bool"},
            "status":      {"bsonType": "string", "enum": ["available", "pending", "adopted"]},
            "location":    {"bsonType": "string", "minLength": 1},
            "description": {"bsonType": "string"},
            "image_url":   {"bsonType": "string"},
        },
    }
}

APPLICATION_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["pet_id", "applicant_name", "applicant_email", "applicant_phone",
                     "home_type", "status"],
        "properties": {
            "pet_id":           {"bsonType": "objectId"},
            "applicant_name":   {"bsonType": "string", "minLength": 1},
            "applicant_email":  {"bsonType": "string", "minLength": 5},
            "applicant_phone":  {"bsonType": "string", "minLength": 7},
            "home_type":        {"bsonType": "string",
                                 "enum": ["apartment", "house", "condo", "farm", "other"]},
            "has_yard":         {"bsonType": "bool"},
            "other_pets":       {"bsonType": "string"},
            "experience":       {"bsonType": "string"},
            "message":          {"bsonType": "string"},
            "status":           {"bsonType": "string",
                                 "enum": ["pending", "approved", "rejected"]},
        },
    }
}


def _create_or_modify_collection(name: str, validator: dict):
    """Create collection with validator, or apply validator to existing one."""
    try:
        db.create_collection(name, validator=validator)
    except CollectionInvalid:
        # Collection already exists – update validator without destroying data
        db.command(
            "collMod", name,
            validator=validator,
            validationLevel="moderate",   # Don't reject existing docs that pre-date schema
            validationAction="error",
        )


def init_db():
    """Idempotently initialise collections, validators, and indexes."""
    _create_or_modify_collection("pets", PET_VALIDATOR)
    _create_or_modify_collection("adoption_applications", APPLICATION_VALIDATOR)

    # ── Pets indexes ──────────────────────────────
    pets_col = db["pets"]
    existing = {idx["name"] for idx in pets_col.list_indexes()}

    if "text_search" not in existing:
        pets_col.create_index(
            [("name", TEXT), ("breed", TEXT), ("description", TEXT)],
            name="text_search",
        )
    if "species_idx" not in existing:
        pets_col.create_index([("species", ASCENDING)], name="species_idx")
    if "status_idx" not in existing:
        pets_col.create_index([("status", ASCENDING)], name="status_idx")
    if "location_idx" not in existing:
        pets_col.create_index([("location", ASCENDING)], name="location_idx")

    # ── Applications indexes ───────────────────────
    apps_col = db["adoption_applications"]
    existing = {idx["name"] for idx in apps_col.list_indexes()}

    if "pet_email_unique" not in existing:
        apps_col.create_index(
            [("pet_id", ASCENDING), ("applicant_email", ASCENDING)],
            unique=True,
            name="pet_email_unique",
        )
    if "email_idx" not in existing:
        apps_col.create_index([("applicant_email", ASCENDING)], name="email_idx")
    if "status_idx" not in existing:
        apps_col.create_index([("status", ASCENDING)], name="status_idx")


# Collections (call init_db on startup)
pets_collection = db["pets"]
applications_collection = db["adoption_applications"]
