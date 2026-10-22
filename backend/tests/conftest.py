"""
conftest.py – pytest fixtures with a separate test database.
All tests run against pawpal_test_db so real data is never touched.
"""

import os
import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient

# Point to test database BEFORE importing the app
os.environ["DATABASE_NAME"] = "pawpal_test_db"
os.environ["ADMIN_SECRET_KEY"] = "test_admin_key"

# Now import after env is set
import database as db_module
from main import app

ADMIN_HEADERS = {"X-Admin-Key": "test_admin_key"}


@pytest.fixture(scope="session", autouse=True)
def test_db():
    """Drop test DB before and after the full test session."""
    mongo = MongoClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    mongo.drop_database("pawpal_test_db")
    db_module.init_db()
    yield mongo["pawpal_test_db"]
    mongo.drop_database("pawpal_test_db")
    mongo.close()


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def admin_headers():
    return ADMIN_HEADERS


SAMPLE_PET = {
    "name": "TestDog",
    "species": "dog",
    "breed": "Mixed",
    "age": 2,
    "gender": "male",
    "vaccinated": True,
    "status": "available",
    "location": "Test City, TC",
    "description": "A test dog.",
    "image_url": "https://example.com/dog.jpg",
    "good_with_kids": True,
    "good_with_pets": True,
}
