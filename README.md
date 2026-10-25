# Sakhi — Women's Healthcare Companion

A multilingual women's health platform for rural and urban women: an AI health assistant (text + voice),
a nearby healthcare finder, health tracking, doctor-verified education and medical-report uploads.
Sakhi supports healthcare decisions; it does not replace doctors or give diagnoses.

## Structure
```
frontend/   React 19 + Vite + react-router (Member 1: main UI · Member 3: chatbot + finder)
backend/    FastAPI (Member 2: core APIs & persistence · Member 3: AI + healthcare finder)
docs/       API contracts, setup & deployment guide, demo script
```

## Quick start
```bash
# backend  (terminal 1)
cd backend && python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env        # add ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000

# frontend (terminal 2)
cd frontend && npm install && npm run dev      # http://localhost:5173  (proxies /api -> :8000)
```
Details, deployment and troubleshooting: [docs/SETUP.md](docs/SETUP.md).

## Features (Member 3 scope)
- **Multilingual assistant** — English, हिन्दी, ಕನ್ನಡ, தமிழ், తెలుగు, বাংলা; voice in/out via the browser; curated knowledge base; fixed emergency/self-harm/abuse responses that bypass the model; offline fallback.
- **Healthcare finder** — hospitals, clinics, labs, pharmacies from OpenStreetMap; GPS or town/pincode search; map + list; directions and call links.

## Docs
[API contracts](docs/API_CONTRACTS.md) · [Setup & deploy](docs/SETUP.md) · [Demo script & test checklist](docs/DEMO_SCRIPT.md)
