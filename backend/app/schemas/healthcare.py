from typing import Literal

from pydantic import BaseModel

FacilityType = Literal["hospital", "clinic", "pharmacy", "lab"]


class Facility(BaseModel):
    id: str
    type: FacilityType
    name: str | None = None
    lat: float
    lng: float
    distance_km: float
    address: str | None = None
    phone: str | None = None
    opening_hours: str | None = None
    emergency: bool = False


class LatLng(BaseModel):
    lat: float
    lng: float


class NearbyResponse(BaseModel):
    center: LatLng
    radius_km: float
    count: int
    facilities: list[Facility]
    source: str = "openstreetmap"
    attribution: str = "© OpenStreetMap contributors"


class GeocodeResponse(BaseModel):
    lat: float
    lng: float
    display_name: str
