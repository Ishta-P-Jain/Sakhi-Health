# Demo script (≈ 3 minutes) & test checklist

## Story: "Lakshmi, 45, homemaker — tired all the time"
1. **Home** — "Sakhi is built for women who put their family's health first." Switch language to **ಕನ್ನಡ** (or हिन्दी) to show the whole UI changes.
2. **Assistant** — tap the mic, say in her language: *"I feel tired all the time."* Sakhi answers in simple words, lists common causes (iron, thyroid, vitamins) and says to see a doctor. Tap **Listen** to hear it read aloud.
3. **Safety** — type *"chest pain and can't breathe"*: show the urgent card with 108/112 — "no AI guessing here, this is a fixed safety response."
4. **Find care** — tap **Use my location** → nearby clinics, labs, pharmacies on the map. Filter to *Lab*, tap **Directions**. Mention a doctor can order the tests.
5. **Close** — tracker + education videos (Members 1 & 2), then the vision line: "from lack of awareness to timely, continuous care."

## 30 minutes before
- [ ] Open `https://<api>/api/ping` (wakes Render) → `llm_configured: true`
- [ ] Open the live frontend on the **demo device**, on the **demo network**
- [ ] Mic + speaker + location permissions granted; one voice question tested in each demo language
- [ ] Finder returns results at the demo location (and the fallback pincode)
- [ ] Phone hotspot ready; screen recording of the full flow saved as a backup

## Test matrix (tick before demo)
| Area | Check | ✓ |
|---|---|---|
| Chat | Reply arrives in each of the 6 languages | |
| Chat | Reply in language the user *types* (e.g. Hindi while UI is English) | |
| Chat | Clear chat, switch language, greeting re-localises | |
| Chat | Backend stopped → "Offline" chip + canned answer + 108/112 note | |
| Safety | Emergency, self-harm, abuse phrases show urgent card, no model call | |
| Voice | Mic fills and sends; denied-permission message shows | |
| Voice | Listen/Stop works per message | |
| Finder | GPS path, pincode path, radius, filters, marker ↔ list selection | |
| Finder | Location denied → clear message, search still works | |
| Finder | Directions opens Google Maps; Call opens dialer | |
| Mobile | Chat, finder (map above list), nav fit a 375 px screen | |
| Deep links | Refresh on `/finder` and `/assistant` on the live site | |

## Likely judge questions
- *Is it safe?* Red-flag messages bypass the model; the model is told never to diagnose or name drugs; every answer points to a doctor; knowledge base is doctor-reviewable (`backend/app/services/knowledge_base.py`).
- *Where does facility data come from?* OpenStreetMap — free, no key; incomplete in places, hence the "call ahead" note. Next step: a verified hospital/lab directory or Google Places.
- *Privacy?* The server doesn't store chat messages or log their content; the key never reaches the browser.
