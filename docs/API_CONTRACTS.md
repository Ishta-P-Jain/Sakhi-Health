# API contracts

Base path `/api`. JSON in, JSON out. Language codes: `en hi kn ta te bn`.
Member 2: add your endpoints (health profile, symptoms, reminders, reports) at the bottom in the same format.

## GET /api/ping
`200 {"status":"ok","llm_configured":true}` — use as the health check and to warm up a sleeping server.

## POST /api/chat  (AI assistant)
Request
```json
{ "message": "मुझे हर समय थकान रहती है", "language": "hi",
  "history": [ {"role":"assistant","text":"..."}, {"role":"user","text":"..."} ] }
```
- `message` 1–1000 chars. `history` ≤ 20 turns (server uses the last 10). `language` = UI language (the model replies in the language the user actually wrote).

Response `200`
```json
{ "reply": "…", "language": "hi", "source": "llm", "safety_category": null }
```
- `source: "safety"` → a fixed emergency message (no model call); `safety_category` is `medical | selfharm | abuse`. The UI shows these in an urgent style.

Errors: `422` invalid body · `429` rate limited (default 20/min/IP) · `503` assistant unavailable (frontend falls back to offline canned replies).

## GET /api/healthcare/nearby
Query: `lat`, `lng` (required) · `radius_km` 1–25 (default 5) · `types` comma list of `hospital,clinic,pharmacy,lab` (default all)

Response `200`
```json
{ "center": {"lat":12.91,"lng":74.85}, "radius_km": 5, "count": 2, "source": "openstreetmap",
  "attribution": "© OpenStreetMap contributors",
  "facilities": [ { "id":"node/123","type":"hospital","name":"City Hospital","lat":12.92,"lng":74.86,
      "distance_km":1.2,"address":"MG Road, Mangaluru","phone":"+91 …","opening_hours":"24/7","emergency":true } ] }
```
`name`, `address`, `phone`, `opening_hours` may be `null` (OSM data is incomplete). Sorted by distance. Errors: `422`, `502` map data unavailable (frontend then queries OpenStreetMap directly).

## GET /api/healthcare/geocode?q=575001
`200 {"lat":12.87,"lng":74.84,"display_name":"…"}` · `404` place not found · `502` geocoder unavailable.

---
## Member 2 endpoints
_(add here)_
