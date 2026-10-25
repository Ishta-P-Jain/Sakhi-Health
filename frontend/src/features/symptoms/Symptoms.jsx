import { useCallback, useEffect, useState } from 'react'
import {
  createSymptom,
  deleteSymptom,
  fetchSymptoms,
  updateSymptom,
} from '../../services/api'

const SEVERITIES = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
]

export default function Symptoms({ t }) {
  const [logs, setLogs] = useState([])
  const [symptom, setSymptom] = useState('')
  const [severity, setSeverity] = useState('mild')
  const [notes, setNotes] = useState('')
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16))
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchSymptoms({ limit: 100 })
      setLogs(data)
    } catch (err) {
      setError(err.status === 401 ? 'Session expired. Please sign in again.' : 'Unable to load symptoms.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editingId) {
        await updateSymptom(editingId, { symptom, severity, notes })
      } else {
        await createSymptom({ symptom, severity, notes, occurred_at: occurredAt })
      }
      setSymptom('')
      setSeverity('mild')
      setNotes('')
      setEditingId(null)
      setOccurredAt(new Date().toISOString().slice(0, 16))
      load()
    } catch (err) {
      setError('Unable to save symptom entry.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this symptom entry?')) return
    try {
      await deleteSymptom(id)
      load()
    } catch (err) {
      setError('Unable to delete symptom entry.')
    }
  }

  const handleEdit = (log) => {
    setEditingId(log.id)
    setSymptom(log.symptom)
    setSeverity(log.severity)
    setNotes(log.notes || '')
    setOccurredAt(log.occurred_at ? log.occurred_at.slice(0, 16) : '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setSymptom('')
    setSeverity('mild')
    setNotes('')
    setOccurredAt(new Date().toISOString().slice(0, 16))
  }

  if (loading) {
    return <div className="symptoms-page">Loading your symptoms…</div>
  }

  return (
    <div className="symptoms-page">
      <section className="section">
        <div className="section-heading">
          <span className="section-kicker">Symptoms</span>
          <h2>Symptom log</h2>
          <p>Record how you feel. This is for your personal awareness — not a diagnosis.</p>
          <span className="heading-flower">✿</span>
        </div>

        <form onSubmit={handleSubmit} className="symptom-form">
          <div className="field">
            <label>Symptom</label>
            <input
              type="text"
              required
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g. cramps, headache, fatigue"
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label>Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="tracker-input"
            >
              {SEVERITIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Date & time</label>
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="tracker-input"
            />
          </div>
          <div className="field">
            <label>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything you'd like to remember…"
              className="tracker-input tracker-textarea"
              rows={2}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button-primary" disabled={saving}>
            {editingId ? 'Update entry' : 'Log symptom'}
          </button>
          {editingId && (
            <button type="button" className="button-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>
      </section>

      {logs.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <span className="section-kicker">History</span>
            <h2>Your symptom entries</h2>
            <span className="heading-flower">✿</span>
          </div>
          <ul className="symptom-list">
            {logs.map((log) => (
              <li key={log.id} className="symptom-item">
                <div className="symptom-info">
                  <strong>{log.symptom}</strong>
                  <span className={`severity severity-${log.severity}`}>{log.severity}</span>
                  <span className="symptom-date">{new Date(log.occurred_at).toLocaleString()}</span>
                  {log.notes && <span className="symptom-notes">{log.notes}</span>}
                </div>
                <div className="symptom-actions">
                  <button
                    type="button"
                    className="button-link"
                    onClick={() => handleEdit(log)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button-link button-delete"
                    onClick={() => handleDelete(log.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="content-note">
        Recording symptoms helps you notice patterns. It is not a medical diagnosis.
        For health concerns, consult a qualified healthcare professional.
      </p>
    </div>
  )
}
