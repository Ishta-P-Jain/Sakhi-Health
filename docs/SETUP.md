# Setup, integration & deployment

## Local development
| | Command | URL |
|---|---|---|
| Backend | `cd backend && uvicorn app.main:app --reload --port 8000` | http://localhost:8000/docs |
| Frontend | `cd frontend && npm run dev` | http://localhost:5173 |

Vite proxies `/api` → `localhost:8000`, so no CORS setup is needed locally. Without `ANTHROPIC_API_KEY` the
backend still runs: emergency messages work, other chat questions return 503 and the UI falls back to the
original canned replies (header chip shows "Offline").

Tests: `cd backend && pytest` (32 tests: safety layer, chat endpoint, finder parsing). Frontend: `npm run build && npm run lint`.

## Integration notes for the team
- Member 1: the assistant page now renders `<ChatPanel>`; chat state comes from `useChat()` in `App.jsx`. The home-page question box still works (it calls `sendChatMessage`). A new `/finder` route + nav item was added. New strings live next to the features (`features/*/strings.js`), not in the big `translations` object.
- Member 2: register routers in `backend/app/main.py` (marked block). Reuse `app/config.py` for env vars.
- The "Find care" page can later link to doctor appointments; the assistant prompt already tells users about it.

## Deploy
**Backend → Render** (`render.yaml` at repo root)
1. New → Blueprint → select the repo. Set `ANTHROPIC_API_KEY`, `CORS_ORIGINS` (your frontend URL), `GEOCODER_USER_AGENT`.
2. Check `https://<api>.onrender.com/api/ping` returns `llm_configured: true`.

**Frontend → Vercel** (root directory `frontend`)
1. Env var `VITE_API_URL=https://<api>.onrender.com`. Build `npm run build`, output `dist`.
2. `vercel.json` rewrites all paths to `index.html` (needed for `/finder`, `/assistant` deep links). Netlify uses `public/_redirects`.
3. Add the Vercel URL to the backend's `CORS_ORIGINS` and redeploy the backend.

Notes: Render's free tier sleeps when idle — open `/api/ping` a minute before the demo. Browser geolocation and microphone
need **HTTPS** (Vercel/Render give you that; `localhost` is also allowed).

## Troubleshooting
| Symptom | Cause / fix |
|---|---|
| Chat chip says Offline | Backend asleep/down, or `VITE_API_URL` wrong, or CORS_ORIGINS missing the frontend URL |
| `llm_configured:false` | `ANTHROPIC_API_KEY` not set on the server |
| No mic button | Browser lacks Web Speech API (use Chrome/Edge/Android Chrome) |
| Mic works but reply isn't spoken | No voice installed for that language on the device — install it in OS settings, test on the demo phone |
| Finder shows 0 results | OSM has little data there — try a larger radius or a city centre; check demo location in advance |
| Location blocked | Browser site settings → allow location; or use the town/pincode search |
