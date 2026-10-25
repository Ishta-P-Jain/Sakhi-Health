// All backend calls go through here. In dev, Vite proxies /api to FastAPI (see vite.config.js).
// In production set VITE_API_URL to the deployed backend origin.
const BASE = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '')

let authToken = null
let onUnauthenticated = () => {}

export function setAuthToken(token) {
  authToken = token
}

export function clearAuthToken() {
  authToken = null
}

export function setOnUnauthenticated(handler) {
  onUnauthenticated = handler
}

export class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `HTTP ${status}`)
    this.status = status
  }
}

export async function request(path, { method = 'GET', body, timeoutMs = 30000, responseType = 'json' } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const headers = {}
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  if (body && !isFormData) headers['Content-Type'] = 'application/json'
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    })
    if (res.status === 401) {
      clearAuthToken()
      onUnauthenticated()
      throw new ApiError(401, 'session_expired')
    }
    if (!res.ok) {
      let detail = ''
      try {
        detail = (await res.json()).detail
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(res.status, typeof detail === 'string' ? detail : '')
    }
<<<<<<< HEAD
    if (res.status === 204) return null
    if (responseType === 'blob') return await res.blob()
    return await res.json()
=======
    if (res.status === 204) {
      return null
    }
    const text = await res.text()
    if (!text) {
      return null
    }
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
>>>>>>> origin/main
  } finally {
    clearTimeout(timer)
  }
}

/* ---------- Auth ---------- */

export const postChat = ({ message, language, history }) =>
  request('/api/chat', { method: 'POST', body: { message, language, history }, timeoutMs: 30000 })

export const register = ({ email, password, full_name }) =>
  request('/api/auth/register', { method: 'POST', body: { email, password, full_name } })

export const login = ({ email, password }) =>
  request('/api/auth/login', { method: 'POST', body: { email, password } })

export const registerAndLogin = async (credentials) => {
  await register(credentials)
  try {
    return await login(credentials)
  } catch (error) {
    error.accountCreated = true
    throw error
  }
}

export const fetchMe = () => request('/api/auth/me')

/* ---------- Health logs ---------- */

export const fetchHealthLogs = ({ start, end, limit, offset } = {}) => {
  const qs = new URLSearchParams()
  if (start) qs.set('start', start)
  if (end) qs.set('end', end)
  if (limit) qs.set('limit', limit)
  if (offset) qs.set('offset', offset)
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return request(`/api/health/logs${query}`)
}

export const createHealthLog = (data) =>
  request('/api/health/logs', { method: 'POST', body: data })

export const updateHealthLog = (id, data) =>
  request(`/api/health/logs/${id}`, { method: 'PUT', body: data })

export const deleteHealthLog = (id) =>
  request(`/api/health/logs/${id}`, { method: 'DELETE' })

/* ---------- Symptoms ---------- */

export const fetchSymptoms = ({ limit, offset } = {}) => {
  const qs = new URLSearchParams()
  if (limit) qs.set('limit', limit)
  if (offset) qs.set('offset', offset)
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return request(`/api/symptoms${query}`)
}

export const createSymptom = (data) =>
  request('/api/symptoms', { method: 'POST', body: data })

export const updateSymptom = (id, data) =>
  request(`/api/symptoms/${id}`, { method: 'PUT', body: data })

export const deleteSymptom = (id) =>
  request(`/api/symptoms/${id}`, { method: 'DELETE' })

/* ---------- Reminders ---------- */

export const fetchReminders = ({ active, kind, limit, offset } = {}) => {
  const qs = new URLSearchParams()
  if (active !== undefined) qs.set('active', active)
  if (kind) qs.set('kind', kind)
  if (limit) qs.set('limit', limit)
  if (offset) qs.set('offset', offset)
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return request(`/api/reminders${query}`)
}

export const createReminder = (data) =>
  request('/api/reminders', { method: 'POST', body: data })

export const updateReminder = (id, data) =>
  request(`/api/reminders/${id}`, { method: 'PUT', body: data })

export const deleteReminder = (id) =>
  request(`/api/reminders/${id}`, { method: 'DELETE' })

/* ---------- Medical reports ---------- */

export const fetchReports = ({ limit, offset } = {}) => {
  const qs = new URLSearchParams()
  if (limit) qs.set('limit', limit)
  if (offset) qs.set('offset', offset)
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return request(`/api/reports${query}`)
}

export const uploadReport = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request('/api/reports/upload', { method: 'POST', body: formData })
}

export const downloadReport = (id) =>
  request(`/api/reports/${id}/file`, { responseType: 'blob' })

export const deleteReport = (id) =>
  request(`/api/reports/${id}`, { method: 'DELETE' })
