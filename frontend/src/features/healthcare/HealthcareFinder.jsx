import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FinderMap from './FinderMap'
import { finderStrings } from './strings'
import { FACILITY_TYPES, fetchNearby, geocodePlace } from '../../services/healthcare'
import './healthcare.css'

const RADII = [2, 5, 10, 20]
const fill = (text, vars) => Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), text)
const firstPhone = (p) => (p ? p.split(/[;,/]/)[0].trim() : '')

export default function HealthcareFinder({ language }) {
  const s = finderStrings[language] || finderStrings.English
  const [status, setStatus] = useState('idle') // idle | locating | loading | ready | error
  const [errorKey, setErrorKey] = useState('')
  const [origin, setOrigin] = useState(null) // { lat, lng, label }
  const [facilities, setFacilities] = useState([])
  const [filter, setFilter] = useState('all')
  const [radius, setRadius] = useState(5)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const reqId = useRef(0)

  const fail = (key) => {
    setErrorKey(key)
    setStatus('error')
  }

  const load = useCallback(async (point, radiusKm) => {
    const id = ++reqId.current
    setStatus('loading')
    setErrorKey('')
    setSelectedId(null)
    try {
      const list = await fetchNearby({ lat: point.lat, lng: point.lng, radiusKm })
      if (id !== reqId.current) return
      setFacilities(list)
      setStatus('ready')
    } catch {
      if (id !== reqId.current) return
      setErrorKey('error')
      setStatus('error')
    }
  }, [])

  const locateMe = () => {
    if (!navigator.geolocation) return fail('unsupported')
    setStatus('locating')
    setErrorKey('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: null }
        setOrigin(point)
        load(point, radius)
      },
      (err) => fail(err.code === 1 ? 'denied' : 'error'),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    )
  }

  const onSearch = async (event) => {
    event.preventDefault()
    const q = query.trim()
    if (q.length < 2) return
    setStatus('locating')
    setErrorKey('')
    try {
      const place = await geocodePlace(q)
      if (!place) return fail('notFound')
      const point = { lat: place.lat, lng: place.lng, label: place.display_name.split(',').slice(0, 2).join(',').trim() }
      setOrigin(point)
      load(point, radius)
    } catch {
      fail('error')
    }
  }

  const changeRadius = (r) => {
    setRadius(r)
    if (origin) load(origin, r)
  }

  const labelFor = useCallback(
    (f) => f.name || fill(s.unnamed, { type: s[f.type] }),
    [s],
  )

  const counts = useMemo(() => {
    const c = { all: facilities.length }
    for (const t of FACILITY_TYPES) c[t] = facilities.filter((f) => f.type === t).length
    return c
  }, [facilities])
  const visible = useMemo(
    () => (filter === 'all' ? facilities : facilities.filter((f) => f.type === filter)),
    [facilities, filter],
  )

  useEffect(() => {
    if (selectedId) document.getElementById(`fx-${selectedId}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedId])

  const busy = status === 'locating' || status === 'loading'
  let message = s.empty
  if (status === 'locating') message = s.locating
  else if (status === 'loading') message = s.loading
  else if (status === 'error') message = s[errorKey] || s.error
  else if (status === 'ready')
    message = visible.length
      ? `${fill(s.found, { n: visible.length, r: radius })} · ${origin?.label ? fill(s.nearPlace, { place: origin.label }) : s.nearYou}`
      : s.none

  return (
    <section className="section fx-section" id="finder">
      <div className="section-heading">
        <div>
          <span className="section-kicker">{s.kicker}</span>
          <h2>{s.title}</h2>
          <p>{s.intro}</p>
        </div>
        <span className="heading-flower">✿</span>
      </div>

      <div className="fx-emergency" role="note">
        <span aria-hidden="true">⚠</span> {s.emergencyBanner} <a href="tel:108">108</a> · <a href="tel:112">112</a>
      </div>

      <div className="fx-layout">
        <div className="fx-side">
          <div className="fx-controls">
            <button type="button" className="button-primary fx-locate" onClick={locateMe} disabled={busy}>
              ◎ {s.useLocation}
            </button>

            <form className="fx-search" onSubmit={onSearch}>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={s.searchPlaceholder}
                aria-label={s.searchPlaceholder}
              />
              <button type="submit" className="button-secondary" disabled={busy || query.trim().length < 2}>
                {s.search}
              </button>
            </form>

            <div className="fx-row" role="group" aria-label={s.radius}>
              <span className="fx-label">{s.radius}</span>
              {RADII.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`fx-chip${radius === r ? ' on' : ''}`}
                  aria-pressed={radius === r}
                  onClick={() => changeRadius(r)}
                >
                  {r} km
                </button>
              ))}
            </div>

            <div className="fx-row" role="group" aria-label={s.title}>
              {['all', ...FACILITY_TYPES].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`fx-chip${filter === t ? ' on' : ''}`}
                  aria-pressed={filter === t}
                  onClick={() => setFilter(t)}
                >
                  {t === 'all' ? s.filterAll : s[t]}
                  {status === 'ready' && <span className="fx-count">{counts[t]}</span>}
                </button>
              ))}
            </div>
          </div>

          <p className={`fx-status${status === 'error' ? ' err' : ''}`} role="status" aria-live="polite">
            {message}
            {status === 'error' && errorKey === 'error' && origin && (
              <button type="button" className="fx-retry" onClick={() => load(origin, radius)}>
                {s.retry}
              </button>
            )}
          </p>

          <ul className="fx-list">
            {visible.map((f) => {
              const phone = firstPhone(f.phone)
              const tel = phone.replace(/[^\d+]/g, '')
              return (
                <li
                  key={f.id}
                  id={`fx-${f.id}`}
                  className={`fx-card${selectedId === f.id ? ' sel' : ''}`}
                >
                  <button type="button" className="fx-card-main" onClick={() => setSelectedId(f.id)}>
                    <span className="fx-dot" data-type={f.type} aria-hidden="true" />
                    <span className="fx-card-body">
                      <strong>{labelFor(f)}</strong>
                      <span className="fx-meta">
                        {s[f.type]} · {f.distance_km.toFixed(1)} km
                        {f.emergency && <em className="fx-badge">{s.emergency}</em>}
                      </span>
                      {f.address && <span className="fx-addr">{f.address}</span>}
                      {f.opening_hours && <span className="fx-addr">{s.hours}: {f.opening_hours}</span>}
                    </span>
                  </button>
                  <div className="fx-actions">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.directions} ↗
                    </a>
                    {tel && <a href={`tel:${tel}`}>{s.call} · {phone}</a>}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="fx-mapwrap">
          <FinderMap
            center={origin}
            facilities={visible}
            selectedId={selectedId}
            onSelect={setSelectedId}
            labelFor={labelFor}
          />
        </div>
      </div>

      <p className="content-note">{s.dataNote}</p>
    </section>
  )
}
