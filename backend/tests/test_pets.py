"""
test_pets.py – CRUD tests for the /api/pets endpoints.
"""

import pytest
from tests.conftest import SAMPLE_PET


@pytest.fixture(scope="module")
def created_pet_id(client, admin_headers):
    """Create a pet once and return its ID for subsequent tests."""
    resp = client.post("/api/pets", json=SAMPLE_PET, headers=admin_headers)
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


class TestPetCRUD:
    def test_create_pet_requires_admin(self, client):
        resp = client.post("/api/pets", json=SAMPLE_PET)
        assert resp.status_code == 422 or resp.status_code == 401  # missing header

    def test_create_pet_success(self, client, admin_headers):
        resp = client.post("/api/pets", json=SAMPLE_PET, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == SAMPLE_PET["name"]
        assert data["species"] == SAMPLE_PET["species"]
        assert "id" in data

    def test_get_pet(self, client, created_pet_id):
        resp = client.get(f"/api/pets/{created_pet_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == created_pet_id

    def test_list_pets(self, client):
        resp = client.get("/api/pets")
        assert resp.status_code == 200
        body = resp.json()
        assert "data" in body
        assert "total" in body
        assert body["total"] >= 1

    def test_list_pets_filter_species(self, client):
        resp = client.get("/api/pets?species=dog")
        assert resp.status_code == 200
        for pet in resp.json()["data"]:
            assert pet["species"] == "dog"

    def test_list_pets_filter_status(self, client):
        resp = client.get("/api/pets?status=available")
        assert resp.status_code == 200
        for pet in resp.json()["data"]:
            assert pet["status"] == "available"

    def test_list_pets_pagination(self, client):
        resp = client.get("/api/pets?page=1&per_page=1")
        assert resp.status_code == 200
        body = resp.json()
        assert len(body["data"]) <= 1
        assert body["per_page"] == 1

    def test_update_pet(self, client, admin_headers, created_pet_id):
        resp = client.put(
            f"/api/pets/{created_pet_id}",
            json={"name": "UpdatedDog", "age": 5},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "UpdatedDog"
        assert resp.json()["age"] == 5

    def test_update_pet_requires_admin(self, client, created_pet_id):
        resp = client.put(f"/api/pets/{created_pet_id}", json={"name": "Hacked"})
        assert resp.status_code in (401, 422)

    def test_update_nonexistent_pet(self, client, admin_headers):
        fake_id = "a" * 24
        resp = client.put(f"/api/pets/{fake_id}", json={"name": "X"}, headers=admin_headers)
        assert resp.status_code == 404

    def test_delete_pet_requires_admin(self, client, created_pet_id):
        resp = client.delete(f"/api/pets/{created_pet_id}")
        assert resp.status_code in (401, 422)

    def test_delete_pet(self, client, admin_headers, created_pet_id):
        resp = client.delete(f"/api/pets/{created_pet_id}", headers=admin_headers)
        assert resp.status_code == 204

    def test_get_deleted_pet(self, client, created_pet_id):
        resp = client.get(f"/api/pets/{created_pet_id}")
        assert resp.status_code == 404

    def test_invalid_pet_id(self, client):
        resp = client.get("/api/pets/not_a_valid_id")
        assert resp.status_code == 400
