// All backend calls go through here. In dev, Vite proxies /api to FastAPI (see vite.config.js).
// In production set VITE_API_URL to the deployed backend origin.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `HTTP ${status}`)
    this.status = status
  }
}

export async function request(path, { method = 'GET', body, timeoutMs = 30000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    if (!res.ok) {
      let detail = ''
      try {
        detail = (await res.json()).detail
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(res.status, typeof detail === 'string' ? detail : '')
    }
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export const postChat = ({ message, language, history }) =>
  request('/api/chat', { method: 'POST', body: { message, language, history }, timeoutMs: 30000 })
