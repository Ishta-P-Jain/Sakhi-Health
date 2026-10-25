import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const COLORS = { hospital: '#9c3d5e', clinic: '#b87c9e', pharmacy: '#5f9577', lab: '#7b6cb0' }
const LETTERS = { hospital: 'H', clinic: '+', pharmacy: 'Rx', lab: 'L' }

// divIcon avoids Leaflet's default marker PNGs, which break under bundlers.
// The HTML is built only from constants above (never from OSM data).
const pinIcon = (type, selected) =>
  L.divIcon({
    className: 'fx-pin-wrap',
    html: `<span class="fx-pin${selected ? ' sel' : ''}" style="--pin:${COLORS[type]}">${LETTERS[type]}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  })

// OSM names are user-generated: build popup content with textContent, never innerHTML.
function popupEl(title, sub) {
  const box = document.createElement('div')
  const b = document.createElement('strong')
  b.textContent = title
  const p = document.createElement('div')
  p.textContent = sub
  box.append(b, p)
  return box
}

export default function FinderMap({ center, facilities, selectedId, onSelect, labelFor }) {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const markersRef = useRef(new Map())
  const onSelectRef = useRef(onSelect)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // create the map once
  useEffect(() => {
    const map = L.map(elRef.current, { scrollWheelZoom: false }).setView([20.59, 78.96], 5)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(elRef.current)
    const markers = markersRef.current
    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      markers.clear()
    }
  }, [])

  // redraw markers when results change
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()
    markersRef.current.clear()
    const pts = []
    if (center) {
      L.circleMarker([center.lat, center.lng], {
        radius: 8, color: '#fff', weight: 3, fillColor: '#2f6fed', fillOpacity: 1,
      }).addTo(layer)
      pts.push([center.lat, center.lng])
    }
    for (const f of facilities) {
      const name = labelFor(f)
      const m = L.marker([f.lat, f.lng], { icon: pinIcon(f.type, false), title: name })
      m.bindPopup(popupEl(name, `${f.distance_km.toFixed(1)} km`))
      m.on('click', () => onSelectRef.current?.(f.id))
      m.addTo(layer)
      markersRef.current.set(f.id, { marker: m, type: f.type })
      pts.push([f.lat, f.lng])
    }
    if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30], maxZoom: 15 })
    else if (pts.length === 1) map.setView(pts[0], 14)
  }, [center, facilities, labelFor])

  // highlight the selected facility
  useEffect(() => {
    for (const [id, { marker, type }] of markersRef.current) marker.setIcon(pinIcon(type, id === selectedId))
    const sel = markersRef.current.get(selectedId)
    if (sel && mapRef.current) {
      mapRef.current.panTo(sel.marker.getLatLng())
      sel.marker.openPopup()
    }
  }, [selectedId])

  return <div ref={elRef} className="fx-map" role="region" aria-label="Map" />
}
