"""
seed.py – Idempotent seeder for pawpal_db.
Run: python seed.py

Rules:
  - Uses update_one(filter, $setOnInsert, upsert=True) so reruns never
    create duplicates and never overwrite real user data.
  - Identifies seed pets by a unique "seed_key" field.
  - Demo applications reference seed pet IDs and use unique (pet_id, email) index.
"""

import os
import sys
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from pymongo.errors import BulkWriteError
from bson import ObjectId

load_dotenv()

MONGODB_URL   = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "pawpal_db")

client = MongoClient(MONGODB_URL)
db     = client[DATABASE_NAME]

pets_col = db["pets"]
apps_col = db["adoption_applications"]

# ──────────────────────────────────────────────
# Seed data – 28 pets
# ──────────────────────────────────────────────

SEED_PETS = [
    # DOGS
    {
        "seed_key": "dog_001", "name": "Buddy", "species": "dog", "breed": "Golden Retriever",
        "age": 3, "gender": "male", "vaccinated": True, "status": "available",
        "location": "Austin, TX", "color": "Golden",
        "description": "Buddy is a cheerful Golden Retriever who loves fetch, swimming, and cuddles. He is great with kids and other dogs.",
        "image_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
        "weight_kg": 32, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "dog_002", "name": "Luna", "species": "dog", "breed": "Siberian Husky",
        "age": 2, "gender": "female", "vaccinated": True, "status": "available",
        "location": "Denver, CO", "color": "Grey & White",
        "description": "Luna is an energetic Husky who loves outdoor adventures and long runs. She needs an active family.",
        "image_url": "https://images.unsplash.com/photo-1617895153857-82fe0c82b836?w=600&q=80",
        "weight_kg": 24, "good_with_kids": True, "good_with_pets": False,
    },
    {
        "seed_key": "dog_003", "name": "Max", "species": "dog", "breed": "German Shepherd",
        "age": 4, "gender": "male", "vaccinated": True, "status": "available",
        "location": "Chicago, IL", "color": "Black & Tan",
        "description": "Max is a loyal and intelligent German Shepherd. He is protective, well-trained, and very affectionate.",
        "image_url": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&q=80",
        "weight_kg": 36, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "dog_004", "name": "Daisy", "species": "dog", "breed": "Beagle",
        "age": 1, "gender": "female", "vaccinated": True, "status": "available",
        "location": "Nashville, TN", "color": "Tricolor",
        "description": "Daisy is a curious and friendly Beagle puppy. She loves sniffing everything and playing with toys.",
        "image_url": "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&q=80",
        "weight_kg": 10, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "dog_005", "name": "Charlie", "species": "dog", "breed": "Labrador Retriever",
        "age": 5, "gender": "male", "vaccinated": True, "status": "adopted",
        "location": "Seattle, WA", "color": "Black",
        "description": "Charlie is a gentle and calm Labrador who loves everyone he meets. Excellent therapy dog candidate.",
        "image_url": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80",
        "weight_kg": 30, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "dog_006", "name": "Rocky", "species": "dog", "breed": "Bulldog",
        "age": 3, "gender": "male", "vaccinated": False, "status": "available",
        "location": "Miami, FL", "color": "Brindle",
        "description": "Rocky is a laid-back Bulldog who loves napping on the couch and short walks. Perfect apartment dog.",
        "image_url": "https://images.unsplash.com/photo-1575425186775-b8de9a427e67?w=600&q=80",
        "weight_kg": 25, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "dog_007", "name": "Bella", "species": "dog", "breed": "Poodle",
        "age": 2, "gender": "female", "vaccinated": True, "status": "available",
        "location": "Portland, OR", "color": "White",
        "description": "Bella is a smart and hypoallergenic Poodle who picks up tricks instantly. Loves agility training.",
        "image_url": "https://images.unsplash.com/photo-1514984879728-be0aff75a6e8?w=600&q=80",
        "weight_kg": 8, "good_with_kids": True, "good_with_pets": True,
    },
    # CATS
    {
        "seed_key": "cat_001", "name": "Whiskers", "species": "cat", "breed": "Domestic Shorthair",
        "age": 4, "gender": "male", "vaccinated": True, "status": "available",
        "location": "Boston, MA", "color": "Orange Tabby",
        "description": "Whiskers is a sociable tabby who loves to be the center of attention. He will sit on your laptop if you're not careful.",
        "image_url": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
        "weight_kg": 4.5, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "cat_002", "name": "Shadow", "species": "cat", "breed": "Maine Coon",
        "age": 3, "gender": "female", "vaccinated": True, "status": "available",
        "location": "New York, NY", "color": "Dark Brown",
        "description": "Shadow is a majestic Maine Coon with a silky coat and dog-like loyalty. She follows her favourite humans everywhere.",
        "image_url": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80",
        "weight_kg": 6.2, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "cat_003", "name": "Mittens", "species": "cat", "breed": "Persian",
        "age": 5, "gender": "female", "vaccinated": True, "status": "pending",
        "location": "Los Angeles, CA", "color": "Cream",
        "description": "Mittens is a regal Persian who enjoys peaceful environments and gentle petting. Ideal for calm households.",
        "image_url": "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=600&q=80",
        "weight_kg": 4.0, "good_with_kids": False, "good_with_pets": False,
    },
    {
        "seed_key": "cat_004", "name": "Simba", "species": "cat", "breed": "Bengal",
        "age": 2, "gender": "male", "vaccinated": True, "status": "available",
        "location": "Phoenix, AZ", "color": "Spotted Brown",
        "description": "Simba is a wild-looking Bengal with a playful personality. He needs lots of stimulation and interactive toys.",
        "image_url": "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600&q=80",
        "weight_kg": 5.0, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "cat_005", "name": "Luna Cat", "species": "cat", "breed": "Siamese",
        "age": 1, "gender": "female", "vaccinated": False, "status": "available",
        "location": "San Francisco, CA", "color": "Seal Point",
        "description": "Luna is a talkative Siamese kitten with striking blue eyes. She bonds intensely with one person.",
        "image_url": "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=600&q=80",
        "weight_kg": 2.8, "good_with_kids": True, "good_with_pets": False,
    },
    {
        "seed_key": "cat_006", "name": "Oliver", "species": "cat", "breed": "British Shorthair",
        "age": 6, "gender": "male", "vaccinated": True, "status": "adopted",
        "location": "Houston, TX", "color": "Blue-Grey",
        "description": "Oliver is a calm and independent British Shorthair who appreciates his own space but also enjoys evening cuddles.",
        "image_url": "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&q=80",
        "weight_kg": 5.5, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "cat_007", "name": "Nala", "species": "cat", "breed": "Ragdoll",
        "age": 3, "gender": "female", "vaccinated": True, "status": "available",
        "location": "Philadelphia, PA", "color": "Bicolor",
        "description": "Nala goes limp when picked up – she's the ultimate lap cat. She's gentle, quiet, and great with children.",
        "image_url": "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&q=80",
        "weight_kg": 5.8, "good_with_kids": True, "good_with_pets": True,
    },
    # RABBITS
    {
        "seed_key": "rabbit_001", "name": "Thumper", "species": "rabbit", "breed": "Holland Lop",
        "age": 2, "gender": "male", "vaccinated": True, "status": "available",
        "location": "Columbus, OH", "color": "Grey",
        "description": "Thumper is a lop-eared bunny who loves to binky around the living room and munch on leafy greens.",
        "image_url": "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&q=80",
        "weight_kg": 1.8, "good_with_kids": True, "good_with_pets": False,
    },
    {
        "seed_key": "rabbit_002", "name": "Hazel", "species": "rabbit", "breed": "Lionhead",
        "age": 1, "gender": "female", "vaccinated": True, "status": "available",
        "location": "Indianapolis, IN", "color": "White",
        "description": "Hazel is a fluffy Lionhead with a magnificent mane. She is gentle and loves being held.",
        "image_url": "https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=600&q=80",
        "weight_kg": 1.4, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "rabbit_003", "name": "Cinnamon", "species": "rabbit", "breed": "Mini Rex",
        "age": 3, "gender": "female", "vaccinated": False, "status": "available",
        "location": "Charlotte, NC", "color": "Cinnamon Brown",
        "description": "Cinnamon has the softest velvet-like fur you'll ever touch. She's calm and perfect for first-time rabbit owners.",
        "image_url": "https://images.unsplash.com/photo-1504018695769-4f8ede6c54a0?w=600&q=80",
        "weight_kg": 1.6, "good_with_kids": True, "good_with_pets": False,
    },
    {
        "seed_key": "rabbit_004", "name": "Biscuit", "species": "rabbit", "breed": "Dutch",
        "age": 2, "gender": "male", "vaccinated": True, "status": "adopted",
        "location": "Memphis, TN", "color": "Black & White",
        "description": "Biscuit is a classic Dutch rabbit with a friendly and curious personality. He loves exploring cardboard tunnels.",
        "image_url": "https://images.unsplash.com/photo-1559214369-a6b1d7919865?w=600&q=80",
        "weight_kg": 2.1, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "rabbit_005", "name": "Pepper", "species": "rabbit", "breed": "Flemish Giant",
        "age": 4, "gender": "male", "vaccinated": True, "status": "available",
        "location": "Louisville, KY", "color": "Steel Grey",
        "description": "Pepper is a gentle giant – a Flemish Giant rabbit who is surprisingly calm and loves lounging with his humans.",
        "image_url": "https://images.unsplash.com/photo-1520302630591-fd1a8adadba9?w=600&q=80",
        "weight_kg": 5.4, "good_with_kids": True, "good_with_pets": True,
    },
    # BIRDS
    {
        "seed_key": "bird_001", "name": "Rio", "species": "bird", "breed": "Blue & Gold Macaw",
        "age": 5, "gender": "male", "vaccinated": True, "status": "available",
        "location": "Orlando, FL", "color": "Blue & Yellow",
        "description": "Rio is a vibrant Macaw with an impressive vocabulary. He loves music and dancing. Not suitable for small apartments.",
        "image_url": "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80",
        "weight_kg": 0.9, "good_with_kids": False, "good_with_pets": False,
    },
    {
        "seed_key": "bird_002", "name": "Kiwi", "species": "bird", "breed": "Green Cheek Conure",
        "age": 2, "gender": "female", "vaccinated": True, "status": "available",
        "location": "Tampa, FL", "color": "Green & Red",
        "description": "Kiwi is a cuddly conure who loves snuggling under your chin. She is quieter than most parrots.",
        "image_url": "https://images.unsplash.com/photo-1516598540642-e8f40a09d939?w=600&q=80",
        "weight_kg": 0.07, "good_with_kids": True, "good_with_pets": False,
    },
    {
        "seed_key": "bird_003", "name": "Tweety", "species": "bird", "breed": "Canary",
        "age": 1, "gender": "male", "vaccinated": False, "status": "available",
        "location": "Atlanta, GA", "color": "Yellow",
        "description": "Tweety fills any room with beautiful song. He is low-maintenance and perfect for those who enjoy avian companionship.",
        "image_url": "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=600&q=80",
        "weight_kg": 0.02, "good_with_kids": True, "good_with_pets": False,
    },
    {
        "seed_key": "bird_004", "name": "Polly", "species": "bird", "breed": "African Grey Parrot",
        "age": 7, "gender": "female", "vaccinated": True, "status": "available",
        "location": "Dallas, TX", "color": "Grey & Red",
        "description": "Polly is an exceptionally intelligent African Grey who can hold conversations. She needs mental stimulation daily.",
        "image_url": "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=600&q=80",
        "weight_kg": 0.45, "good_with_kids": False, "good_with_pets": False,
    },
    {
        "seed_key": "bird_005", "name": "Mango", "species": "bird", "breed": "Cockatiel",
        "age": 3, "gender": "male", "vaccinated": True, "status": "adopted",
        "location": "San Antonio, TX", "color": "Yellow & Grey",
        "description": "Mango is a sweet Cockatiel who loves whistling tunes and sitting on shoulders. Great first bird for beginners.",
        "image_url": "https://images.unsplash.com/photo-1591198936750-16d8e15edc9b?w=600&q=80",
        "weight_kg": 0.09, "good_with_kids": True, "good_with_pets": False,
    },
    # Extra dogs to ensure >25 total
    {
        "seed_key": "dog_008", "name": "Cooper", "species": "dog", "breed": "Dachshund",
        "age": 4, "gender": "male", "vaccinated": True, "status": "available",
        "location": "Minneapolis, MN", "color": "Red",
        "description": "Cooper is a bold little Dachshund with a huge personality. He's brave, playful, and loves digging.",
        "image_url": "https://images.unsplash.com/photo-1616247547882-607f0ea8c25e?w=600&q=80",
        "weight_kg": 8, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "dog_009", "name": "Sadie", "species": "dog", "breed": "Border Collie",
        "age": 2, "gender": "female", "vaccinated": True, "status": "available",
        "location": "Salt Lake City, UT", "color": "Black & White",
        "description": "Sadie is one of the smartest dogs you'll ever meet. She needs a job to do and thrives with active owners.",
        "image_url": "https://images.unsplash.com/photo-1503256207526-0d5523f39d15?w=600&q=80",
        "weight_kg": 18, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "dog_010", "name": "Zeus", "species": "dog", "breed": "Great Dane",
        "age": 3, "gender": "male", "vaccinated": True, "status": "available",
        "location": "Kansas City, MO", "color": "Fawn",
        "description": "Zeus is a gentle giant Great Dane who thinks he's a lap dog. He loves kids and is surprisingly calm indoors.",
        "image_url": "https://images.unsplash.com/photo-1611003229196-a8a5ecb8024e?w=600&q=80",
        "weight_kg": 72, "good_with_kids": True, "good_with_pets": True,
    },
    {
        "seed_key": "cat_008", "name": "Cleo", "species": "cat", "breed": "Abyssinian",
        "age": 2, "gender": "female", "vaccinated": True, "status": "available",
        "location": "Richmond, VA", "color": "Ruddy",
        "description": "Cleo is an active Abyssinian who acts more like a monkey than a cat. She climbs everything and never stops moving.",
        "image_url": "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&q=80",
        "weight_kg": 3.8, "good_with_kids": True, "good_with_pets": True,
    },
]


def upsert_pets():
    """Upsert seed pets by seed_key. Never overwrites real user data."""
    now = datetime.utcnow()
    operations = []
    for pet in SEED_PETS:
        key = pet.pop("seed_key")
        operations.append(
            UpdateOne(
                {"seed_key": key},
                {
                    "$setOnInsert": {**pet, "seed_key": key,
                                     "created_at": now, "updated_at": now},
                },
                upsert=True,
            )
        )
    result = pets_col.bulk_write(operations, ordered=False)
    return result.upserted_count, result.matched_count


def upsert_applications(pet_map: dict):
    """Upsert a handful of demo adoption applications."""
    now = datetime.utcnow()

    # Build demo apps referencing specific pets
    demos = []
    species_keys = {
        "buddy":   "dog_001",
        "luna":    "dog_002",
        "whiskers":"cat_001",
        "shadow":  "cat_002",
        "mittens": "cat_003",
        "thumper": "rabbit_001",
        "rio":     "bird_001",
    }

    app_templates = [
        {
            "seed_app_key": "app_001",
            "pet_seed_key": "dog_001",
            "applicant_name": "Alice Johnson", "applicant_email": "alice@example.com",
            "applicant_phone": "512-555-0101", "home_type": "house", "has_yard": True,
            "other_pets": "None", "experience": "Had dogs growing up, very comfortable with large breeds.",
            "message": "Buddy looks absolutely wonderful! Our family would love to give him a great home.",
            "status": "approved",
            "applied_at": now - timedelta(days=30),
        },
        {
            "seed_app_key": "app_002",
            "pet_seed_key": "dog_002",
            "applicant_name": "Bob Smith", "applicant_email": "bob@example.com",
            "applicant_phone": "720-555-0102", "home_type": "house", "has_yard": True,
            "other_pets": "One cat (indoor)", "experience": "10 years with huskies, avid runner.",
            "message": "I run marathons and would give Luna the outdoor life she deserves!",
            "status": "pending",
            "applied_at": now - timedelta(days=10),
        },
        {
            "seed_app_key": "app_003",
            "pet_seed_key": "cat_002",
            "applicant_name": "Carol White", "applicant_email": "carol@example.com",
            "applicant_phone": "212-555-0103", "home_type": "apartment", "has_yard": False,
            "other_pets": "None", "experience": "Owned cats for 15 years.",
            "message": "Shadow's description sounds perfect for my NYC apartment lifestyle.",
            "status": "pending",
            "applied_at": now - timedelta(days=5),
        },
        {
            "seed_app_key": "app_004",
            "pet_seed_key": "cat_003",
            "applicant_name": "David Lee", "applicant_email": "david@example.com",
            "applicant_phone": "323-555-0104", "home_type": "condo", "has_yard": False,
            "other_pets": "None", "experience": "Owned Persians before, know their grooming needs.",
            "message": "I work from home and can give Mittens all the attention she needs.",
            "status": "approved",
            "applied_at": now - timedelta(days=20),
        },
        {
            "seed_app_key": "app_005",
            "pet_seed_key": "rabbit_001",
            "applicant_name": "Eve Martinez", "applicant_email": "eve@example.com",
            "applicant_phone": "614-555-0105", "home_type": "house", "has_yard": True,
            "other_pets": "None", "experience": "First-time rabbit owner but thoroughly researched.",
            "message": "My daughter loves Thumper's pictures and we have a rabbit-proofed room ready.",
            "status": "rejected",
            "applied_at": now - timedelta(days=15),
        },
        {
            "seed_app_key": "app_006",
            "pet_seed_key": "bird_001",
            "applicant_name": "Frank Garcia", "applicant_email": "frank@example.com",
            "applicant_phone": "407-555-0106", "home_type": "house", "has_yard": True,
            "other_pets": "None", "experience": "Owned parrots for 12 years, large aviary setup.",
            "message": "I have the space and experience to properly care for a Macaw like Rio.",
            "status": "pending",
            "applied_at": now - timedelta(days=3),
        },
        {
            "seed_app_key": "app_007",
            "pet_seed_key": "dog_003",
            "applicant_name": "Grace Kim", "applicant_email": "grace@example.com",
            "applicant_phone": "312-555-0107", "home_type": "house", "has_yard": True,
            "other_pets": "One dog (friendly mix)", "experience": "K9 trainer, 8 years experience.",
            "message": "Max would excel with professional training and I have a large yard.",
            "status": "pending",
            "applied_at": now - timedelta(days=7),
        },
    ]

    operations = []
    skipped = 0
    for tmpl in app_templates:
        key        = tmpl.pop("seed_app_key")
        pet_sk     = tmpl.pop("pet_seed_key")
        pet_doc    = pets_col.find_one({"seed_key": pet_sk}, {"_id": 1})
        if not pet_doc:
            skipped += 1
            continue
        pet_oid = pet_doc["_id"]
        operations.append(
            UpdateOne(
                {"seed_app_key": key},
                {
                    "$setOnInsert": {
                        **tmpl,
                        "seed_app_key": key,
                        "pet_id": pet_oid,
                        "admin_note": None,
                        "updated_at": tmpl["applied_at"],
                    }
                },
                upsert=True,
            )
        )

    if not operations:
        return 0, 0, skipped

    try:
        result = apps_col.bulk_write(operations, ordered=False)
        return result.upserted_count, result.matched_count, skipped
    except BulkWriteError as e:
        # Duplicate key errors from unique index are expected on reruns
        inserted = e.details.get("nInserted", 0)
        return inserted, len(operations) - inserted, skipped


def ensure_indexes():
    """Ensure minimal indexes exist (idempotent)."""
    from pymongo import ASCENDING, TEXT
    from pymongo.errors import OperationFailure

    existing_pet_idx = {idx["name"] for idx in pets_col.list_indexes()}
    existing_app_idx = {idx["name"] for idx in apps_col.list_indexes()}

    if "text_search" not in existing_pet_idx:
        try:
            pets_col.create_index(
                [("name", TEXT), ("breed", TEXT), ("description", TEXT)],
                name="text_search",
            )
        except OperationFailure:
            pass

    if "pet_email_unique" not in existing_app_idx:
        try:
            apps_col.create_index(
                [("pet_id", ASCENDING), ("applicant_email", ASCENDING)],
                unique=True, name="pet_email_unique",
            )
        except OperationFailure:
            pass


def main():
    print("=" * 55)
    print("  PawPal Seed Script")
    print("=" * 55)

    ensure_indexes()
    print("✓ Indexes verified")

    inserted_pets, matched_pets = upsert_pets()
    total_pets = pets_col.count_documents({})
    print(f"✓ Pets  — inserted: {inserted_pets}, already-existing: {matched_pets}, total in DB: {total_pets}")

    if total_pets < 25:
        print(f"⚠  WARNING: Only {total_pets} pets in DB. Expected ≥25.")
        sys.exit(1)

    # Build pet map for application seeding
    pet_map = {d["seed_key"]: d["_id"] for d in pets_col.find({"seed_key": {"$exists": True}})}
    ins_apps, match_apps, skipped = upsert_applications(pet_map)
    total_apps = apps_col.count_documents({})
    print(f"✓ Apps  — inserted: {ins_apps}, already-existing: {match_apps}, skipped(no pet): {skipped}, total in DB: {total_apps}")

    print("\n✅ Seeding complete!")
    print(f"   Database : {DATABASE_NAME}")
    print(f"   Pets     : {total_pets}")
    print(f"   Apps     : {total_apps}")
    print("=" * 55)


if __name__ == "__main__":
    main()
