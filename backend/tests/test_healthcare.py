from fastapi.testclient import TestClient

from app.main import app
from app.services import healthcare_finder as f

client = TestClient(app)

ELEMENTS = [
    {"type": "node", "id": 1, "lat": 12.9141, "lon": 74.8560,
     "tags": {"amenity": "hospital", "name": "City Hospital", "emergency": "yes", "phone": "+91 824 111111",
              "addr:street": "MG Road", "addr:city": "Mangaluru"}},
    {"type": "way", "id": 2, "center": {"lat": 12.9200, "lon": 74.8600},
     "tags": {"amenity": "pharmacy"}},
    {"type": "node", "id": 3, "lat": 12.9300, "lon": 74.8700, "tags": {"healthcare": "laboratory", "name": "Lab X"}},
    {"type": "node", "id": 4, "lat": 12.9, "lon": 74.8, "tags": {"amenity": "bench"}},
    {"type": "relation", "id": 5, "tags": {"amenity": "clinic"}},  # no coords -> skipped
]


def test_parse_sorts_classifies_and_skips():
    res = f.parse_elements(ELEMENTS, 12.9141, 74.8560)
    assert [x.id for x in res] == ["node/1", "way/2", "node/3"]
    assert res[0].distance_km == 0 and res[0].emergency and res[0].address == "MG Road, Mangaluru"
    assert res[1].name is None and res[1].type == "pharmacy"
    assert res[2].type == "lab"


def test_query_contains_types_and_radius():
    q = f.build_query(12.9, 74.8, 5000, ("hospital", "pharmacy"))
    assert 'amenity"="hospital"' in q and "around:5000,12.9,74.8" in q and "clinic" not in q


def test_haversine_known_distance():
    assert abs(f.haversine_km(12.9141, 74.8560, 12.9141, 74.9560) - 10.86) < 0.2


def test_nearby_endpoint(monkeypatch):
    async def fake(lat, lng, radius_km, types):
        return f.parse_elements(ELEMENTS, lat, lng)
    monkeypatch.setattr(f, "nearby", fake)
    r = client.get("/api/healthcare/nearby", params={"lat": 12.9141, "lng": 74.856, "types": "hospital,bogus"})
    assert r.status_code == 200 and r.json()["count"] == 3
    assert client.get("/api/healthcare/nearby", params={"lat": 99, "lng": 0}).status_code == 422
    assert client.get("/api/healthcare/nearby", params={"lat": 1, "lng": 1, "types": "bogus"}).status_code == 422


def test_upstream_failure_is_502(monkeypatch):
    async def down(*a, **k):
        raise f.UpstreamError("x")
    monkeypatch.setattr(f, "nearby", down)
    assert client.get("/api/healthcare/nearby", params={"lat": 1, "lng": 1}).status_code == 502


def test_geocode_endpoint(monkeypatch):
    async def ok(q):
        return {"lat": 12.87, "lng": 74.84, "display_name": "Mangaluru"} if q == "575001" else None
    monkeypatch.setattr(f, "geocode", ok)
    assert client.get("/api/healthcare/geocode", params={"q": "575001"}).json()["display_name"] == "Mangaluru"
    assert client.get("/api/healthcare/geocode", params={"q": "nowhere"}).status_code == 404
