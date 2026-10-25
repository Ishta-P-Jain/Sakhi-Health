import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [errorCode, setErrorCode] = useState(null)
  const [customError, setCustomError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErrorCode(null)
    setCustomError('')
    try {
      const data = await fetchReports({ limit: 100 })
      setReports(data)
    } catch (err) {
      setErrorCode(err.status === 401 ? 'session_expired' : 'load_failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0]
    setErrorCode(null)
    setCustomError('')
    if (!selected) {
      setFile(null)
      return
    }
    const ext = selected.name.slice(selected.name.lastIndexOf('.')).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorCode('file_type')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (selected.size > MAX_MB * 1024 * 1024) {
      setErrorCode('file_size')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setFile(selected)
  }

  const handleRemoveSelectedFile = () => {
    setFile(null)
    setErrorCode(null)
    setCustomError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!file) return
    setErrorCode(null)
    setCustomError('')
    setUploading(true)
    try {
      await uploadReport(file)
      handleRemoveSelectedFile()
      load()
    } catch (err) {
      if (err.status === 400 && err.detail) {
        setCustomError(err.detail)
      } else {
        setErrorCode('upload_failed')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmMsg = t?.reportsDeleteConfirm || 'Delete this report?'
    if (!window.confirm(confirmMsg)) return
    setErrorCode(null)
    try {
      await deleteReport(id)
      load()
    } catch {
      setErrorCode('delete_failed')
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
    } catch (err) {
      setErrorCode(err.status === 401 ? 'session_expired' : 'download_failed')
    }
  }

  const errorMessage = customError || (
    errorCode === 'session_expired'
      ? (t?.sessionExpired || 'Session expired. Please sign in again.')
      : errorCode === 'load_failed'
        ? (t?.reportsErrorLoad || 'Unable to load reports.')
        : errorCode === 'upload_failed'
          ? (t?.reportsErrorUpload || 'Unable to upload report.')
          : errorCode === 'download_failed'
            ? (t?.reportsErrorDownload || 'Unable to download report.')
            : errorCode === 'delete_failed'
              ? (t?.reportsErrorDelete || 'Unable to delete report.')
              : errorCode === 'file_type'
                ? (t?.reportsErrorFileType || 'File type not allowed. Allowed: .pdf, .png, .jpg, .jpeg')
                : errorCode === 'file_size'
                  ? (t?.reportsErrorFileSize || 'File too large. Maximum size is 5 MB.')
                  : null
  )

  if (loading) {
    return (
      <div className="reports-page">
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{t?.reportsKicker || 'Medical reports'}</span>
              <h2>{t?.reportsHeading || 'Your medical reports'}</h2>
            </div>
            <span className="heading-flower">✿</span>
          </div>
          <div className="loading-state">
            <p>{t?.reportsLoading || 'Loading your reports…'}</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="reports-page">
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{t?.reportsKicker || 'Medical reports'}</span>
            <h2>{t?.reportsHeading || 'Your medical reports'}</h2>
            <p>{t?.reportsIntro || 'Upload, view, and download your medical documents securely.'}</p>
          </div>
          <span className="heading-flower">✿</span>
        </div>

        <form onSubmit={handleUpload} className="upload-form">
          <div className="field">
            <label htmlFor="report-file-input">{t?.reportsLabelChooseFile || 'Choose file'}</label>
            <input
              id="report-file-input"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="file-input"
            />
            <small className="hint">
              {t?.reportsHint ||
                'Allowed: PDF, PNG, JPG. Max 5 MB. Files are stored privately and are only accessible to you.'}
            </small>
          </div>

          {file && (
            <div className="file-selected" aria-live="polite">
              <span className="file-selected-name">
                📄 {file.name} <strong>({Math.round(file.size / 1024)} KB)</strong>
              </span>
              <button
                type="button"
                className="button-link button-delete"
                onClick={handleRemoveSelectedFile}
                aria-label={t?.actionRemove || 'Remove'}
              >
                {t?.actionRemove || 'Remove'}
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="error" role="alert" aria-live="assertive">
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={!file || uploading}>
              {uploading
                ? (t?.reportsButtonUploading || t?.actionUploading || 'Uploading…')
                : (t?.reportsButtonUpload || 'Upload report')}
            </button>
          </div>
        </form>
      </section>

      {reports.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{t?.reportsKicker || 'Medical reports'}</span>
              <h2>{t?.reportsHistoryHeading || 'Your files'}</h2>
            </div>
            <span className="heading-flower">✿</span>
          </div>

          <ul className="report-list" aria-label={t?.reportsHistoryHeading || 'Your files'}>
            {reports.map((r) => (
              <li key={r.id} className="report-item">
                <div className="report-info">
                  <strong className="report-name">📄 {r.original_filename}</strong>
                  <span className="badge badge-frequency">{r.file_type}</span>
                  <span className="report-size">{(r.file_size / 1024).toFixed(1)} KB</span>
                  <span className="report-date">{new Date(r.uploaded_at).toLocaleDateString()}</span>
                </div>
                <div className="report-actions">
                  <button
                    type="button"
                    className="button-link"
                    onClick={() => handleDownload(r.id, r.original_filename)}
                    aria-label={`${t?.actionDownload || 'Download'} ${r.original_filename}`}
                  >
                    {t?.actionDownload || 'Download'}
                  </button>
                  <button
                    type="button"
                    className="button-link button-delete"
                    onClick={() => handleDelete(r.id)}
                    aria-label={`${t?.actionDelete || 'Delete'} ${r.original_filename}`}
                  >
                    {t?.actionDelete || 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">✿</span>
          <h3>{t?.reportsEmptyTitle || 'No reports uploaded yet'}</h3>
          <p>
            {t?.reportsEmptyText ||
              'Uploaded reports are stored privately and are only accessible to your account. Sakhi does not perform OCR or AI analysis on your files.'}
          </p>
        </div>
      )}
    </div>
  )
}
