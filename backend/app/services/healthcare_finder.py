"""Nearby healthcare lookup via OpenStreetMap (Overpass) + Nominatim geocoding.
No API keys needed. Results are cached briefly to be polite to the public servers."""
import math
import time

import httpx

from app.config import settings
from app.schemas.healthcare import Facility

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

TYPE_QUERIES: dict[str, list[str]] = {
    "hospital": ['nwr["amenity"="hospital"]'],
    "clinic": ['nwr["amenity"~"^(clinic|doctors)$"]'],
    "pharmacy": ['nwr["amenity"="pharmacy"]'],
    "lab": ['nwr["healthcare"="laboratory"]'],
}
ALL_TYPES = tuple(TYPE_QUERIES)

_CACHE: dict[tuple, tuple[float, object]] = {}
_TTL = 600  # seconds


class UpstreamError(Exception):
    pass


def _cache_get(key):
    hit = _CACHE.get(key)
    if hit and time.monotonic() - hit[0] < _TTL:
        return hit[1]
    return None


def _cache_put(key, value):
    if len(_CACHE) > 300:
        _CACHE.clear()
    _CACHE[key] = (time.monotonic(), value)


def haversine_km(lat1, lng1, lat2, lng2) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def build_query(lat: float, lng: float, radius_m: int, types: tuple[str, ...]) -> str:
    parts = [
        f"{clause}(around:{radius_m},{lat},{lng});"
        for t in types
        for clause in TYPE_QUERIES[t]
    ]
    return f"[out:json][timeout:25];({''.join(parts)});out center 150;"


def _classify(tags: dict) -> str | None:
    amenity = tags.get("amenity")
    if amenity == "hospital":
        return "hospital"
    if amenity in ("clinic", "doctors"):
        return "clinic"
    if amenity == "pharmacy":
        return "pharmacy"
    if tags.get("healthcare") == "laboratory":
        return "lab"
    return None


def _address(tags: dict) -> str | None:
    keys = ["addr:housename", "addr:housenumber", "addr:street", "addr:suburb",
            "addr:city", "addr:postcode"]
    bits = [tags[k].strip() for k in keys if tags.get(k, "").strip()]
    return ", ".join(bits) or None


def parse_elements(elements: list[dict], lat: float, lng: float) -> list[Facility]:
    out: dict[str, Facility] = {}
    for el in elements:
        tags = el.get("tags") or {}
        ftype = _classify(tags)
        if not ftype:
            continue
        flat = el.get("lat") if el.get("lat") is not None else (el.get("center") or {}).get("lat")
        flng = el.get("lon") if el.get("lon") is not None else (el.get("center") or {}).get("lon")
        if flat is None or flng is None:
            continue
        fid = f"{el.get('type', 'x')}/{el.get('id')}"
        out[fid] = Facility(
            id=fid,
            type=ftype,
            name=(tags.get("name") or tags.get("name:en") or "").strip() or None,
            lat=flat,
            lng=flng,
            distance_km=round(haversine_km(lat, lng, flat, flng), 2),
            address=_address(tags),
            phone=(tags.get("phone") or tags.get("contact:phone") or "").strip() or None,
            opening_hours=(tags.get("opening_hours") or "").strip() or None,
            emergency=tags.get("emergency") == "yes",
        )
    return sorted(out.values(), key=lambda f: f.distance_km)


async def nearby(lat: float, lng: float, radius_km: float, types: tuple[str, ...]) -> list[Facility]:
    key = ("nearby", round(lat, 3), round(lng, 3), radius_km, types)
    cached = _cache_get(key)
    if cached is not None:
        return cached
    query = build_query(lat, lng, int(radius_km * 1000), types)
    last_err: Exception | None = None
    async with httpx.AsyncClient(timeout=30, headers={"User-Agent": settings.geocoder_user_agent}) as client:
        for url in OVERPASS_URLS:
            try:
                r = await client.post(url, data={"data": query})
                r.raise_for_status()
                result = parse_elements(r.json().get("elements", []), lat, lng)
                _cache_put(key, result)
                return result
            except (httpx.HTTPError, ValueError) as exc:
                last_err = exc
    raise UpstreamError(f"overpass unavailable: {last_err}")


async def geocode(q: str) -> dict | None:
    q = q.strip()
    key = ("geo", q.lower())
    cached = _cache_get(key)
    if cached is not None:
        return cached or None
    params = {"q": q, "format": "json", "limit": 1, "countrycodes": settings.geocode_country}
    try:
        async with httpx.AsyncClient(timeout=15, headers={"User-Agent": settings.geocoder_user_agent}) as client:
            r = await client.get(NOMINATIM_URL, params=params)
            r.raise_for_status()
            rows = r.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise UpstreamError(f"geocoder unavailable: {exc}") from exc
    if not rows:
        _cache_put(key, {})
        return None
    res = {"lat": float(rows[0]["lat"]), "lng": float(rows[0]["lon"]),
           "display_name": rows[0].get("display_name", q)}
    _cache_put(key, res)
    return res
