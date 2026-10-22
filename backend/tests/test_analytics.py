"""
test_analytics.py – Analytics endpoint shape tests.
"""

import pytest


class TestAnalytics:
    def test_summary(self, client):
        resp = client.get("/api/analytics/summary")
        assert resp.status_code == 200
        data = resp.json()
        for key in ("total_pets", "available_pets", "pending_pets", "adopted_pets",
                    "total_applications", "pending_applications"):
            assert key in data, f"Missing key: {key}"
        assert data["total_pets"] >= 0

    def test_by_species(self, client):
        resp = client.get("/api/analytics/by-species")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        for item in data:
            assert "species" in item
            assert "count" in item

    def test_applications_by_status(self, client):
        resp = client.get("/api/analytics/applications-by-status")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_monthly_trends(self, client):
        resp = client.get("/api/analytics/monthly-trends")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_avg_age_by_species(self, client):
        resp = client.get("/api/analytics/avg-age-by-species")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        for item in data:
            assert "species" in item
            assert "avg_age" in item

    def test_top_applied_pets(self, client):
        resp = client.get("/api/analytics/top-applied-pets")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_adoption_rate(self, client):
        resp = client.get("/api/analytics/adoption-rate")
        assert resp.status_code == 200
        data = resp.json()
        assert "rate_percent" in data
        assert 0 <= data["rate_percent"] <= 100

    def test_species_status_breakdown(self, client):
        resp = client.get("/api/analytics/species-status-breakdown")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
