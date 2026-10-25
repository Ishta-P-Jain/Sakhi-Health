import { useCallback, useEffect, useState } from 'react'
import {
  deleteReport,
  downloadReport,
  fetchReports,
  uploadReport,
} from '../../services/api'

const MAX_MB = 5
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg']

export default function Reports({ t }) {
  const [reports, setReports] = useState([])
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchReports({ limit: 100 })
      setReports(data)
    } catch (err) {
      setError(err.status === 401 ? 'Session expired. Please sign in again.' : 'Unable to load reports.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleFileChange = (event) => {
    const selected = event.target.files[0]
    setError('')
    if (!selected) {
      setFile(null)
      return
    }
    const ext = selected.name.slice(selected.name.lastIndexOf('.')).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`)
      setFile(null)
      event.target.value = ''
      return
    }
    if (selected.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_MB} MB.`)
      setFile(null)
      event.target.value = ''
      return
    }
    setFile(selected)
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!file) return
    setError('')
    setUploading(true)
    try {
      await uploadReport(file)
      setFile(null)
      event.target.value = ''
      load()
    } catch (err) {
      setError(err.status === 400 ? err.detail : 'Unable to upload report.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return
    try {
      await deleteReport(id)
      load()
    } catch (err) {
      setError('Unable to delete report.')
    }
  }

  const handleDownload = async (id, filename) => {
    try {
      const blob = await downloadReport(id)
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
    } catch {
      setError('Unable to download report.')
    }
  }

  if (loading) {
    return <div className="reports-page">Loading your reports…</div>
  }

  return (
    <div className="reports-page">
      <section className="section">
        <div className="section-heading">
          <span className="section-kicker">Medical reports</span>
          <h2>Your medical reports</h2>
          <p>Upload, view, and download your medical documents securely.</p>
          <span className="heading-flower">✿</span>
        </div>

        <form onSubmit={handleUpload} className="upload-form">
          <div className="field">
            <label>Choose file</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="file-input"
            />
            <small className="hint">
              Allowed: PDF, PNG, JPG. Max {MAX_MB} MB. Files are stored privately
              and are only accessible to you.
            </small>
          </div>
          {file && (
            <div className="file-selected">
              {file.name} ({Math.round(file.size / 1024)} KB)
              <button
                type="button"
                className="button-link"
                onClick={() => {
                  setFile(null)
                  event && event.target && (event.target.value = '')
                }}
              >
                Remove
              </button>
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button-primary" disabled={!file || uploading}>
            {uploading ? 'Uploading…' : 'Upload report'}
          </button>
        </form>
      </section>

      {reports.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <span className="section-kicker">Uploaded reports</span>
            <h2>Your files</h2>
            <span className="heading-flower">✿</span>
          </div>
          <ul className="report-list">
            {reports.map((r) => (
              <li key={r.id} className="report-item">
                <div className="report-info">
                  <span className="report-name">{r.original_filename}</span>
                  <span className="report-type">{r.file_type}</span>
                  <span className="report-size">{(r.file_size / 1024).toFixed(1)} KB</span>
                  <span className="report-date">{new Date(r.uploaded_at).toLocaleDateString()}</span>
                </div>
                <div className="report-actions">
                  <button
                    type="button"
                    className="button-link"
                    onClick={() => handleDownload(r.id, r.original_filename)}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className="button-link button-delete"
                    onClick={() => handleDelete(r.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {reports.length === 0 && !loading && (
        <div className="empty-state">
          <p>No reports uploaded yet.</p>
          <p className="content-note">
            Uploaded reports are stored privately and are only accessible to your
            account. Sakhi does not perform OCR or AI analysis on your files.
          </p>
        </div>
      )}
    </div>
  )
}
