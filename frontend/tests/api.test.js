import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import {
  clearAuthToken,
  deleteHealthLog,
  downloadReport,
  registerAndLogin,
  request,
  setAuthToken,
  uploadReport,
} from '../src/services/api.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  clearAuthToken()
})

test('registration signs in with the newly created credentials', async () => {
  const requests = []
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options })
    if (url.endsWith('/api/auth/register')) {
      return Response.json({ id: 'user-1', email: 'user@example.com' }, { status: 201 })
    }
    return Response.json({ access_token: 'session-token', token_type: 'bearer' })
  }

  const session = await registerAndLogin({ email: 'user@example.com', password: 'password123' })

  assert.equal(requests.length, 2)
  assert.equal(requests[0].url, '/api/auth/register')
  assert.equal(requests[1].url, '/api/auth/login')
  assert.equal(session.access_token, 'session-token')
})

test('registration identifies when account creation succeeds but sign-in fails', async () => {
  globalThis.fetch = async (url) => {
    if (url.endsWith('/api/auth/register')) {
      return Response.json({ id: 'user-1', email: 'user@example.com' }, { status: 201 })
    }
    return Response.json({ detail: 'sign-in unavailable' }, { status: 401 })
  }

  await assert.rejects(
    registerAndLogin({ email: 'user@example.com', password: 'password123' }),
    (error) => error.accountCreated === true && error.status === 401,
  )
})

test('successful no-content deletes resolve without parsing JSON', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 })

  assert.equal(await deleteHealthLog('log-1'), null)
})

test('successful text responses remain available as text', async () => {
  globalThis.fetch = async () => new Response('plain text response', { status: 200 })

  assert.equal(await request('/api/example'), 'plain text response')
})

test('report uploads send FormData without overriding its content type', async () => {
  let requestOptions
  globalThis.fetch = async (_url, options) => {
    requestOptions = options
    return Response.json({ id: 'report-1' }, { status: 201 })
  }

  await uploadReport(new Blob(['report contents']))

  assert.ok(requestOptions.body instanceof FormData)
  assert.equal(requestOptions.headers['Content-Type'], undefined)
})

test('report downloads use the authenticated API request and return a blob', async () => {
  let request
  setAuthToken('session-token')
  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return new Response('report contents', { status: 200 })
  }

  const blob = await downloadReport('report-1')

  assert.equal(request.url, '/api/reports/report-1/file')
  assert.equal(request.options.headers.Authorization, 'Bearer session-token')
  assert.equal(await blob.text(), 'report contents')
})
