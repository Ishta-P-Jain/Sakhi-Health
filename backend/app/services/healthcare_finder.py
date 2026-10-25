"""Nearby healthcare lookup using the free bed.live directory with OSM fallbacks.

No API key or paid service is required. The bed.live endpoint is tried first
because the public Overpass endpoints may be unreachable on some networks.
Facility capacity/status fields are intentionally not exposed here: directory
records do not establish real-time bed availability or whether a facility is open.
Geocoding continues to use public Nominatim.
"""
import logging
import math
import time
from typing import Any

import httpx

from app.config import settings
from app.schemas.healthcare import Facility

log = logging.getLogger(__name__)

BED_LIVE_URL = "https://bed.live/api/v1/nearest"
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

TYPE_QUERIES: dict[str, list[str]] = {
    "hospital": ['nwr["amenity"="hospital"]'],
    "clinic": ['nwr["amenity"~"^(clinic|doctors)$"]'],
    "pharmacy": ['nwr["amenity"="pharmacy"]'],
    "lab": ['nwr["healthcare"="laboratory"]'],
}
ALL_TYPES = tuple(TYPE_QUERIES)
_CACHE: dict[tuple, tuple[float, Any]] = {}
_TTL = 600


class UpstreamError(Exception):
    """Raised when public healthcare/geocoding services cannot be reached."""


def _cache_get(key: tuple) -> Any | None:
    hit = _CACHE.get(key)
    if hit and time.monotonic() - hit[0] < _TTL:
        return hit[1]
    if hit:
        _CACHE.pop(key, None)
    return None


def _cache_put(key: tuple, value: Any) -> None:
    if len(_CACHE) > 300:
        _CACHE.clear()
    _CACHE[key] = (time.monotonic(), value)


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return great-circle distance in kilometres."""
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    a = min(1.0, max(0.0, a))
    return 2 * r * math.asin(math.sqrt(a))


def build_query(lat: float, lng: float, radius_m: int, types: tuple[str, ...]) -> str:
    """Build an Overpass QL query for the requested facility types."""
    invalid = set(types) - set(ALL_TYPES)
    if invalid:
        raise ValueError(f"Unsupported healthcare types: {', '.join(sorted(invalid))}")
    if radius_m <= 0:
        raise ValueError("radius_m must be greater than zero")
    parts = [
        f"{clause}(around:{radius_m},{lat},{lng});"
        for facility_type in types
        for clause in TYPE_QUERIES[facility_type]
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
    keys = [
        "addr:housename", "addr:housenumber", "addr:street",
        "addr:suburb", "addr:city", "addr:postcode",
    ]
    bits = [str(tags[k]).strip() for k in keys if tags.get(k) is not None and str(tags[k]).strip()]
    return ", ".join(bits) or None


def parse_elements(elements: list[dict], lat: float, lng: float) -> list[Facility]:
    """Convert Overpass elements into Facility records, nearest first."""
    out: dict[str, Facility] = {}
    for el in elements:
        tags = el.get("tags") or {}
        ftype = _classify(tags)
        if not ftype:
            continue
        center = el.get("center") or {}
        flat = el.get("lat") if el.get("lat") is not None else center.get("lat")
        flng = el.get("lon") if el.get("lon") is not None else center.get("lon")
        if flat is None or flng is None:
            continue
        try:
            flat, flng = float(flat), float(flng)
        except (TypeError, ValueError):
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
    return sorted(out.values(), key=lambda facility: facility.distance_km)


def _headers() -> dict[str, str]:
    user_agent = getattr(settings, "geocoder_user_agent", None) or "SakhiHealth/0.1 (healthcare finder)"
    return {"User-Agent": user_agent, "Accept": "application/json"}


def _bed_live_type(row: dict) -> str | None:
    """Map explicit API source/type metadata to our supported facility types."""
    raw_type = str(row.get("facility_type") or "").strip().lower()
    source = str(row.get("source") or "").strip().lower()
    combined = f"{raw_type} {source}"
    if "hospital" in combined:
        return "hospital"
    if "pharmacy" in combined or "chemist" in combined:
        return "pharmacy"
    if "laboratory" in combined or "diagnostic" in combined or "lab" in raw_type:
        return "lab"
    if "clinic" in combined or "health_center" in combined or "health centre" in combined or "healthcenter" in combined or "doctor" in combined or "primary_health" in combined or "subcenter" in combined:
        return "clinic"
    return None


def parse_bed_live(payload: Any, lat: float, lng: float, radius_km: float,
                   types: tuple[str, ...]) -> list[Facility]:
    """Convert bed.live's nearest-facility response to our existing schema.

    The API can return results outside the requested radius, so distance is
    recalculated from coordinates and records beyond radius_km are discarded.
    """
    if isinstance(payload, dict):
        rows = payload.get("facilities")
        if rows is None:
            rows = payload.get("results")
        if rows is None:
            rows = payload.get("data")
    elif isinstance(payload, list):
        rows = payload
    else:
        rows = None
    if not isinstance(rows, list):
        raise ValueError("Unexpected bed.live response format")

    wanted = set(types)
    out: dict[str, Facility] = {}
    for row in rows:
        if not isinstance(row, dict):
            continue
        try:
            flat, flng = float(row["lat"]), float(row["lng"])
        except (KeyError, TypeError, ValueError):
            continue
        distance = haversine_km(lat, lng, flat, flng)
        if distance > radius_km:
            continue
        ftype = _bed_live_type(row)
        # Do not guess a type when the provider supplies no usable type/source.
        if ftype not in wanted:
            continue
        fid = str(row.get("facility_id") or row.get("id") or row.get("source_url") or f"bed-live/{flat:.6f}/{flng:.6f}")
        source_url = row.get("source_url") or row.get("sourceUrl")
        address = row.get("address")
        if not address:
            address_parts = [row.get("city"), row.get("state")]
            address = ", ".join(str(part).strip() for part in address_parts if part and str(part).strip()) or None
        phone = row.get("phone")
        out[fid] = Facility(
            id=fid,
            type=ftype,
            name=(str(row.get("name") or "").strip() or None),
            lat=flat,
            lng=flng,
            distance_km=round(distance, 2),
            address=(str(address).strip() or None) if address else None,
            phone=(str(phone).strip() or None) if phone else None,
            opening_hours=(str(row.get("opening_hours") or row.get("openingHours") or "").strip() or None),
            emergency=False,
        )
    return sorted(out.values(), key=lambda facility: facility.distance_km)


async def _nearby_bed_live(lat: float, lng: float, radius_km: float,
                           types: tuple[str, ...]) -> list[Facility]:
    timeout = httpx.Timeout(connect=8.0, read=20.0, write=10.0, pool=5.0)
    async with httpx.AsyncClient(timeout=timeout, headers=_headers(), follow_redirects=True) as client:
        response = await client.get(BED_LIVE_URL, params={"lat": lat, "lng": lng, "limit": 100})
        response.raise_for_status()
        return parse_bed_live(response.json(), lat, lng, radius_km, types)


async def _nearby_overpass(lat: float, lng: float, radius_km: float,
                           types: tuple[str, ...]) -> list[Facility]:
    query = build_query(lat, lng, int(radius_km * 1000), types)
    errors: list[str] = []
    timeout = httpx.Timeout(connect=8.0, read=35.0, write=15.0, pool=8.0)
    async with httpx.AsyncClient(timeout=timeout, headers=_headers(), follow_redirects=True) as client:
        for url in OVERPASS_URLS:
            try:
                response = await client.post(url, data={"data": query})
                response.raise_for_status()
                payload = response.json()
                if not isinstance(payload, dict) or not isinstance(payload.get("elements", []), list):
                    raise ValueError("Unexpected Overpass response format")
                facilities = parse_elements(payload.get("elements", []), lat, lng)
                return [facility for facility in facilities if facility.distance_km <= radius_km]
            except (httpx.HTTPError, ValueError) as exc:
                detail = f"{url}: {type(exc).__name__}: {exc}"
                errors.append(detail)
                log.warning("Overpass endpoint failed: %s", detail)
    raise UpstreamError("All Overpass endpoints failed. " + " | ".join(errors))


async def nearby(lat: float, lng: float, radius_km: float,
                 types: tuple[str, ...]) -> list[Facility]:
    """Find nearby facilities; try bed.live first, then public Overpass servers."""
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        raise ValueError("Invalid latitude or longitude")
    if not (0 < radius_km <= 25):
        raise ValueError("radius_km must be greater than 0 and at most 25")
    if not types or any(t not in ALL_TYPES for t in types):
        raise ValueError("At least one supported healthcare type is required")

    normalized_types = tuple(dict.fromkeys(types))
    key = ("nearby", round(lat, 3), round(lng, 3), radius_km, normalized_types)
    cached = _cache_get(key)
    if cached is not None:
        return cached

    errors: list[str] = []
    try:
        result = await _nearby_bed_live(lat, lng, radius_km, normalized_types)
        # Empty results are valid: don't make unnecessary requests to Overpass.
        _cache_put(key, result)
        return result
    except (httpx.HTTPError, ValueError, TypeError, KeyError) as exc:
        detail = f"bed.live: {type(exc).__name__}: {exc}"
        errors.append(detail)
        log.warning("bed.live healthcare lookup failed: %s", detail)

    try:
        result = await _nearby_overpass(lat, lng, radius_km, normalized_types)
        _cache_put(key, result)
        return result
    except UpstreamError as exc:
        errors.append(str(exc))
        raise UpstreamError("All healthcare data sources failed. " + " | ".join(errors)) from exc


async def geocode(q: str) -> dict | None:
    """Resolve a place/postcode using public Nominatim."""
    q = q.strip()
    if len(q) < 2:
        return None
    key = ("geo", q.lower())
    cached = _cache_get(key)
    if cached is not None:
        return cached or None

    params = {
        "q": q,
        "format": "jsonv2",
        "limit": 1,
        "countrycodes": getattr(settings, "geocode_country", "in"),
    }
    timeout = httpx.Timeout(connect=8.0, read=15.0, write=10.0, pool=5.0)
    try:
        async with httpx.AsyncClient(timeout=timeout, headers=_headers(), follow_redirects=True) as client:
            response = await client.get(NOMINATIM_URL, params=params)
            response.raise_for_status()
            rows = response.json()
            if not isinstance(rows, list):
                raise ValueError("Unexpected Nominatim response format")
    except (httpx.HTTPError, ValueError) as exc:
        log.warning("Nominatim geocoding failed for query %r: %s", q, exc)
        raise UpstreamError(f"Geocoder unavailable: {type(exc).__name__}") from exc

    if not rows:
        _cache_put(key, {})
        return None
    try:
        result = {
            "lat": float(rows[0]["lat"]),
            "lng": float(rows[0]["lon"]),
            "display_name": rows[0].get("display_name", q),
        }
    except (KeyError, TypeError, ValueError) as exc:
        log.warning("Nominatim returned malformed coordinates for query %r", q)
        raise UpstreamError("Geocoder returned malformed coordinates") from exc
    _cache_put(key, result)
    return result
