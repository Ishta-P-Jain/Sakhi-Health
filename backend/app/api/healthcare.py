from fastapi import APIRouter, HTTPException, Query

from app.schemas.healthcare import GeocodeResponse, LatLng, NearbyResponse
from app.services import healthcare_finder as finder

router = APIRouter(prefix="/healthcare", tags=["healthcare"])


@router.get("/nearby", response_model=NearbyResponse)
async def nearby(
    lat: float = Query(ge=-90, le=90),
    lng: float = Query(ge=-180, le=180),
    radius_km: float = Query(5, ge=1, le=25),
    types: str = Query("hospital,clinic,pharmacy,lab", description="comma-separated"),
) -> NearbyResponse:
    wanted = tuple(t for t in dict.fromkeys(s.strip() for s in types.split(",")) if t in finder.ALL_TYPES)
    if not wanted:
        raise HTTPException(status_code=422, detail="no valid types")
    try:
        facilities = await finder.nearby(lat, lng, radius_km, wanted)
    except finder.UpstreamError:
        raise HTTPException(status_code=502, detail="map_data_unavailable")
    return NearbyResponse(
        center=LatLng(lat=lat, lng=lng),
        radius_km=radius_km,
        count=len(facilities),
        facilities=facilities,
    )


@router.get("/geocode", response_model=GeocodeResponse)
async def geocode(q: str = Query(min_length=2, max_length=120)) -> GeocodeResponse:
    try:
        res = await finder.geocode(q)
    except finder.UpstreamError:
        raise HTTPException(status_code=502, detail="geocoder_unavailable")
    if not res:
        raise HTTPException(status_code=404, detail="place_not_found")
    return GeocodeResponse(**res)
