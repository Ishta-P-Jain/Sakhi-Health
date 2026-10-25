import { useCallback, useEffect, useState } from 'react'
import {
  createSymptom,
  deleteSymptom,
  fetchSymptoms,
  updateSymptom,
} from '../../services/api'

export default function Symptoms({ t }) {
  const [logs, setLogs] = useState([])
  const [symptom, setSymptom] = useState('')
  const [severity, setSeverity] = useState('mild')
  const [notes, setNotes] = useState('')
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [editingId, setEditingId] = useState(null)
  const [errorCode, setErrorCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const severities = [
    { value: 'mild', label: t?.symptomsSeverityMild || 'Mild' },
    { value: 'moderate', label: t?.symptomsSeverityModerate || 'Moderate' },
    { value: 'severe', label: t?.symptomsSeveritySevere || 'Severe' },
  ]

  const load = useCallback(async () => {
    setLoading(true)
    setErrorCode(null)
    try {
      const data = await fetchSymptoms({ limit: 100 })
      setLogs(data)
    } catch (err) {
      setErrorCode(err.status === 401 ? 'session_expired' : 'load_failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorCode(null)
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
    } catch {
      setErrorCode('save_failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmMsg = t?.symptomsDeleteConfirm || 'Delete this symptom entry?'
    if (!window.confirm(confirmMsg)) return
    setErrorCode(null)
    try {
      await deleteSymptom(id)
      if (editingId === id) {
        cancelEdit()
      }
      load()
    } catch {
      setErrorCode('delete_failed')
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

  const errorMessage = errorCode === 'session_expired'
    ? (t?.sessionExpired || 'Session expired. Please sign in again.')
    : errorCode === 'load_failed'
      ? (t?.symptomsErrorLoad || 'Unable to load symptoms.')
      : errorCode === 'save_failed'
        ? (t?.symptomsErrorSave || 'Unable to save symptom entry.')
        : errorCode === 'delete_failed'
          ? (t?.symptomsErrorDelete || 'Unable to delete symptom entry.')
          : null

  if (loading) {
    return (
      <div className="symptoms-page">
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{t?.symptomsKicker || 'Symptoms'}</span>
              <h2>{t?.symptomsHeading || 'Symptom log'}</h2>
            </div>
            <span className="heading-flower">✿</span>
          </div>
          <div className="loading-state">
            <p>{t?.symptomsLoading || 'Loading your symptoms…'}</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="symptoms-page">
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{t?.symptomsKicker || 'Symptoms'}</span>
            <h2>{t?.symptomsHeading || 'Symptom log'}</h2>
            <p>{t?.symptomsIntro || 'Record how you feel. This is for your personal awareness — not a diagnosis.'}</p>
          </div>
          <span className="heading-flower">✿</span>
        </div>

        <form onSubmit={handleSubmit} className="symptom-form">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="symptom-input">{t?.symptomsLabelSymptom || 'Symptom'}</label>
              <input
                id="symptom-input"
                type="text"
                required
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder={t?.symptomsPlaceholderSymptom || 'e.g. cramps, headache, fatigue'}
                autoComplete="off"
              />
            </div>

            <div className="field">
              <label htmlFor="severity-select">{t?.symptomsLabelSeverity || 'Severity'}</label>
              <select
                id="severity-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="tracker-input"
              >
                {severities.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="datetime-input">{t?.symptomsLabelDateTime || 'Date & time'}</label>
            <input
              id="datetime-input"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="tracker-input"
            />
          </div>

          <div className="field">
            <label htmlFor="notes-input">
              <span>{t?.symptomsLabelNotes || 'Notes (optional)'}</span>
            </label>
            <textarea
              id="notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t?.symptomsPlaceholderNotes || "Anything you'd like to remember…"}
              className="tracker-input tracker-textarea"
              rows={2}
            />
          </div>

          {errorMessage && (
            <div className="error" role="alert" aria-live="assertive">
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={saving}>
              {saving
                ? (t?.actionSaving || 'Saving…')
                : editingId
                  ? (t?.symptomsButtonUpdate || 'Update entry')
                  : (t?.symptomsButtonLog || 'Log symptom')}
            </button>
            {editingId && (
              <button type="button" className="button-secondary" onClick={cancelEdit}>
                {t?.actionCancel || 'Cancel'}
              </button>
            )}
          </div>
        </form>
      </section>

      {logs.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{t?.symptomsKicker || 'Symptoms'}</span>
              <h2>{t?.symptomsHistoryHeading || 'Your symptom entries'}</h2>
            </div>
            <span className="heading-flower">✿</span>
          </div>

          <ul className="symptom-list" aria-label={t?.symptomsHistoryHeading || 'Your symptom entries'}>
            {logs.map((log) => {
              const sevLabel =
                log.severity === 'mild'
                  ? (t?.symptomsSeverityMild || 'Mild')
                  : log.severity === 'moderate'
                    ? (t?.symptomsSeverityModerate || 'Moderate')
                    : log.severity === 'severe'
                      ? (t?.symptomsSeveritySevere || 'Severe')
                      : log.severity
              return (
                <li key={log.id} className="symptom-item">
                  <div className="symptom-info">
                    <strong>{log.symptom}</strong>
                    <span className={`severity severity-${log.severity}`}>{sevLabel}</span>
                    <span className="symptom-date">{new Date(log.occurred_at).toLocaleString()}</span>
                    {log.notes && <span className="symptom-notes">{log.notes}</span>}
                  </div>
                  <div className="symptom-actions">
                    <button
                      type="button"
                      className="button-link"
                      onClick={() => handleEdit(log)}
                      aria-label={`${t?.actionEdit || 'Edit'} ${log.symptom}`}
                    >
                      {t?.actionEdit || 'Edit'}
                    </button>
                    <button
                      type="button"
                      className="button-link button-delete"
                      onClick={() => handleDelete(log.id)}
                      aria-label={`${t?.actionDelete || 'Delete'} ${log.symptom}`}
                    >
                      {t?.actionDelete || 'Delete'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">✿</span>
          <h3>{t?.symptomsEmptyTitle || 'No symptoms logged yet'}</h3>
          <p>{t?.symptomsEmptyText || 'Use the form above to record any symptoms or changes you notice.'}</p>
        </div>
      )}

      <p className="content-note">
        {t?.symptomsDisclaimer ||
          'Recording symptoms helps you notice patterns. It is not a medical diagnosis. For health concerns, consult a qualified healthcare professional.'}
      </p>
    </div>
  )
}
