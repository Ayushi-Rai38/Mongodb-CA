"""
test_applications.py – Tests for adoption application workflows.
"""

import pytest
from tests.conftest import SAMPLE_PET


@pytest.fixture(scope="module")
def available_pet_id(client, admin_headers):
    resp = client.post("/api/pets", json=SAMPLE_PET, headers=admin_headers)
    assert resp.status_code == 201
    return resp.json()["id"]


@pytest.fixture(scope="module")
def adopted_pet_id(client, admin_headers):
    pet = {**SAMPLE_PET, "name": "AdoptedPet", "status": "adopted"}
    resp = client.post("/api/pets", json=pet, headers=admin_headers)
    assert resp.status_code == 201
    return resp.json()["id"]


def make_application(pet_id, email="applicant@example.com"):
    return {
        "pet_id": pet_id,
        "applicant_name": "Test User",
        "applicant_email": email,
        "applicant_phone": "555-0100",
        "home_type": "house",
        "has_yard": True,
        "other_pets": "None",
        "experience": "Some experience",
        "message": "I would love this pet!",
    }


class TestApplications:
    def test_submit_application(self, client, available_pet_id):
        resp = client.post("/api/applications", json=make_application(available_pet_id))
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "pending"
        assert data["pet_id"] == available_pet_id

    def test_duplicate_application_rejected(self, client, available_pet_id):
        # same email + same pet → duplicate
        resp = client.post("/api/applications", json=make_application(available_pet_id))
        assert resp.status_code == 409

    def test_apply_for_adopted_pet(self, client, adopted_pet_id):
        resp = client.post("/api/applications", json=make_application(adopted_pet_id))
        assert resp.status_code == 409

    def test_my_applications(self, client, available_pet_id):
        resp = client.get("/api/applications/my/applicant@example.com")
        assert resp.status_code == 200
        apps = resp.json()
        assert len(apps) >= 1
        assert all(a["applicant_email"] == "applicant@example.com" for a in apps)

    def test_list_all_requires_admin(self, client):
        resp = client.get("/api/applications")
        assert resp.status_code in (401, 422)

    def test_list_all_admin(self, client, admin_headers):
        resp = client.get("/api/applications", headers=admin_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_approve_application(self, client, admin_headers, available_pet_id):
        # Get the pending application
        apps = client.get("/api/applications", headers=admin_headers).json()
        pending = [a for a in apps if a["pet_id"] == available_pet_id and a["status"] == "pending"]
        assert len(pending) >= 1
        app_id = pending[0]["id"]

        resp = client.put(
            f"/api/applications/{app_id}/status",
            json={"status": "approved"},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "approved"

        # Pet should now be adopted
        pet = client.get(f"/api/pets/{available_pet_id}").json()
        assert pet["status"] == "adopted"

    def test_cannot_approve_already_processed(self, client, admin_headers, available_pet_id):
        apps = client.get("/api/applications", headers=admin_headers).json()
        approved = [a for a in apps if a["pet_id"] == available_pet_id and a["status"] == "approved"]
        assert len(approved) >= 1
        app_id = approved[0]["id"]

        resp = client.put(
            f"/api/applications/{app_id}/status",
            json={"status": "rejected"},
            headers=admin_headers,
        )
        assert resp.status_code == 409

    def test_reject_application(self, client, admin_headers):
        # Create a new available pet and application
        new_pet = client.post("/api/pets", json=SAMPLE_PET, headers=admin_headers).json()
        pet_id = new_pet["id"]
        client.post("/api/applications", json=make_application(pet_id, "reject_test@example.com"))

        apps = client.get("/api/applications", headers=admin_headers).json()
        pending = [a for a in apps if a["pet_id"] == pet_id and a["status"] == "pending"]
        assert len(pending) >= 1
        app_id = pending[0]["id"]

        resp = client.put(
            f"/api/applications/{app_id}/status",
            json={"status": "rejected", "admin_note": "Not a good fit"},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "rejected"

        # Pet should be restored to available (only application was rejected)
        pet = client.get(f"/api/pets/{pet_id}").json()
        assert pet["status"] == "available"
