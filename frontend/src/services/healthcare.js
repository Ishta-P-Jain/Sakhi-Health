// Healthcare finder data. Tries our FastAPI backend first; if it is down or blocked,
// falls back to calling OpenStreetMap's public APIs straight from the browser so the
// demo still works. Both paths return the same facility shape.
import { request } from './api'

export const FACILITY_TYPES = ['hospital', 'clinic', 'pharmacy', 'lab']

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
const CLAUSES = {
  hospital: ['nwr["amenity"="hospital"]'],
  clinic: ['nwr["amenity"~"^(clinic|doctors)$"]'],
  pharmacy: ['nwr["amenity"="pharmacy"]'],
  lab: ['nwr["healthcare"="laboratory"]'],
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const rad = (d) => (d * Math.PI) / 180
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(a))
}

function classify(tags) {
  if (tags.amenity === 'hospital') return 'hospital'
  if (tags.amenity === 'clinic' || tags.amenity === 'doctors') return 'clinic'
  if (tags.amenity === 'pharmacy') return 'pharmacy'
  if (tags.healthcare === 'laboratory') return 'lab'
  return null
}

function parseOverpass(elements, lat, lng) {
  const byId = new Map()
  for (const el of elements) {
    const tags = el.tags || {}
    const type = classify(tags)
    const flat = el.lat ?? el.center?.lat
    const flng = el.lon ?? el.center?.lon
    if (!type || flat == null || flng == null) continue
    const addr = ['addr:housename', 'addr:housenumber', 'addr:street', 'addr:suburb', 'addr:city', 'addr:postcode']
      .map((k) => (tags[k] || '').trim())
      .filter(Boolean)
      .join(', ')
    const id = `${el.type}/${el.id}`
    byId.set(id, {
      id,
      type,
      name: (tags.name || tags['name:en'] || '').trim() || null,
      lat: flat,
      lng: flng,
      distance_km: Math.round(haversineKm(lat, lng, flat, flng) * 100) / 100,
      address: addr || null,
      phone: (tags.phone || tags['contact:phone'] || '').trim() || null,
      opening_hours: (tags.opening_hours || '').trim() || null,
      emergency: tags.emergency === 'yes',
    })
  }
  return [...byId.values()].sort((a, b) => a.distance_km - b.distance_km)
}

async function overpassDirect(lat, lng, radiusKm, types) {
  const around = `(around:${Math.round(radiusKm * 1000)},${lat},${lng})`
  const body = types.flatMap((t) => CLAUSES[t].map((c) => `${c}${around};`)).join('')
  const query = `[out:json][timeout:25];(${body});out center 150;`
  let lastErr
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(30000),
      })
      if (!res.ok) throw new Error(`overpass ${res.status}`)
      const json = await res.json()
      return parseOverpass(json.elements || [], lat, lng)
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

export async function fetchNearby({ lat, lng, radiusKm = 5, types = FACILITY_TYPES }) {
  try {
    const qs = new URLSearchParams({ lat, lng, radius_km: radiusKm, types: types.join(',') })
    const data = await request(`/api/healthcare/nearby?${qs}`, { timeoutMs: 40000 })
    return data.facilities
  } catch {
    return overpassDirect(lat, lng, radiusKm, types)
  }
}

export async function geocodePlace(q) {
  const query = q.trim()
  try {
    return await request(`/api/healthcare/geocode?q=${encodeURIComponent(query)}`, { timeoutMs: 20000 })
  } catch (err) {
    if (err.status === 404) return null // genuinely not found; don't retry elsewhere
    const params = new URLSearchParams({ q: query, format: 'json', limit: '1', countrycodes: 'in' })
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error('geocoder unavailable')
    const rows = await res.json()
    if (!rows.length) return null
    return { lat: Number(rows[0].lat), lng: Number(rows[0].lon), display_name: rows[0].display_name }
  }
}
