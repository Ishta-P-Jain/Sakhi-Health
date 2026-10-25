import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createHealthLog,
  deleteHealthLog,
  fetchHealthLogs,
  updateHealthLog,
  createSymptom,
  fetchSymptoms,
} from '../../services/api'

const MOODS = [
  { value: 'Great', label: 'Great' },
  { value: 'Good', label: 'Good' },
  { value: 'Okay', label: 'Okay' },
  { value: 'Low', label: 'Low' },
  { value: 'Stressed', label: 'Stressed' },
]

const SYMPTOM_OPTIONS = [
  { id: 'Cramps', label: 'Cramps' },
  { id: 'Headache', label: 'Headache' },
  { id: 'Tiredness', label: 'Tiredness' },
  { id: 'Bloating', label: 'Bloating' },
]

export default function HealthTracker({ t }) {
  const [periodDays, setPeriodDays] = useState([])
  const [wellnessMood, setWellnessMood] = useState('Okay')
  const [wellnessSymptoms, setWellnessSymptoms] = useState([])
  const [wellnessNotes, setWellnessNotes] = useState('')
  const [wellnessDate, setWellnessDate] = useState(
    new Date().toLocaleDateString('en-CA')
  )
  const wellnessDateRef = useRef(wellnessDate)
  const [cycleEndDate, setCycleEndDate] = useState('')
  const [flowLevel, setFlowLevel] = useState('')
  const [healthLogs, setHealthLogs] = useState([])
  const [symptomLogs, setSymptomLogs] = useState([])
  const [editingHealthLogId, setEditingHealthLogId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [logs, symptoms] = await Promise.all([
        fetchHealthLogs({ limit: 100 }),
        fetchSymptoms({ limit: 100 }),
      ])
      setHealthLogs(logs)
      setSymptomLogs(symptoms)
      const selectedCycleLog = logs.find(
        (log) => log.cycle_start_date === wellnessDateRef.current && !log.notes?.startsWith('Mood:')
      )
      setCycleEndDate(selectedCycleLog?.cycle_end_date || '')
      setFlowLevel(selectedCycleLog?.flow_level || '')
      const dates = logs
        .filter((l) => l.cycle_start_date && !l.notes?.startsWith('Mood:'))
        .map((l) => l.cycle_start_date)
      setPeriodDays(dates)
    } catch (err) {
      setError(err.status === 401 ? 'Session expired. Please sign in again.' : 'Unable to load your records.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const cycleLogForDate = (date) =>
    healthLogs.find((log) => log.cycle_start_date === date && !log.notes?.startsWith('Mood:'))

  const handlePeriodDateChange = (date) => {
    wellnessDateRef.current = date
    setWellnessDate(date)
    const log = cycleLogForDate(date)
    setCycleEndDate(log?.cycle_end_date || '')
    setFlowLevel(log?.flow_level || '')
  }

  const savePeriodDay = async (event) => {
    event.preventDefault()
    if (!wellnessDate) return
    setError('')
    setSaving(true)
    const existingLog = cycleLogForDate(wellnessDate)
    const payload = {
      cycle_start_date: wellnessDate,
      cycle_end_date: cycleEndDate || null,
      flow_level: flowLevel || null,
    }
    try {
      if (existingLog) {
        await updateHealthLog(existingLog.id, payload)
      } else {
        await createHealthLog(payload)
      }
      await load()
    } catch {
      setError(existingLog ? 'Unable to update period details.' : 'Unable to mark period day.')
    } finally {
      setSaving(false)
    }
  }

  const removePeriodDay = async (date) => {
    const log = cycleLogForDate(date)
    if (!log) return
    setError('')
    try {
      await deleteHealthLog(log.id)
      await load()
      if (wellnessDate === date) {
        setCycleEndDate('')
        setFlowLevel('')
      }
    } catch {
      setError('Unable to remove period day.')
    }
  }

  const saveWellness = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const healthLog = {
        cycle_start_date: wellnessDate,
        notes: `Mood: ${wellnessMood}. ${wellnessNotes}`,
      }
      if (editingHealthLogId) {
        await updateHealthLog(editingHealthLogId, healthLog)
      } else {
        await createHealthLog(healthLog)
      }
      for (const symptom of wellnessSymptoms) {
        await createSymptom({
          symptom,
          severity: 'mild',
          notes: `Logged on ${wellnessDate}`,
          occurred_at: `${wellnessDate}T00:00:00`,
        })
      }
      setWellnessMood('Okay')
      setWellnessSymptoms([])
      setWellnessNotes('')
      setEditingHealthLogId(null)
      await load()
    } catch (err) {
      setError('Unable to save wellness entry.')
    } finally {
      setSaving(false)
    }
  }

  const editWellnessLog = (log) => {
    const match = log.notes?.match(/^Mood: (Great|Good|Okay|Low|Stressed)\.\s?([\s\S]*)$/)
    setEditingHealthLogId(log.id)
    wellnessDateRef.current = log.cycle_start_date || wellnessDate
    setWellnessDate(wellnessDateRef.current)
    setWellnessMood(match?.[1] || 'Okay')
    setWellnessNotes(match?.[2] || '')
    setWellnessSymptoms([])
  }

  const deleteLog = async (id) => {
    try {
      await deleteHealthLog(id)
      load()
    } catch (err) {
      setError('Unable to delete entry.')
    }
  }

  if (loading) {
    return (
      <section className="section tracker-dashboard">
        <div className="section-heading">
          <span className="section-kicker">{t.trackerKicker}</span>
          <h2>{t.trackerHeading}</h2>
          <p>{t.trackerIntro}</p>
          <span className="heading-flower">✿</span>
        </div>
        <p>Loading your records…</p>
      </section>
    )
  }

  return (
    <section className="section tracker-dashboard">
      <div className="section-heading">
        <div>
          <span className="section-kicker">{t.trackerKicker}</span>
          <h2>{t.trackerHeading}</h2>
          <p>{t.trackerIntro}</p>
        </div>
        <span className="heading-flower">✿</span>
      </div>

      <div className="tracker-grid">
        <article className="tracker-panel">
          <span className="tracker-kicker">{t.trackerPeriodKicker}</span>
          <h3>{t.trackerPeriodTitle}</h3>
          <p>{t.trackerPeriodDescription}</p>

          <form onSubmit={savePeriodDay}>
            <label className="tracker-label" htmlFor="period-date">
              {t.trackerChooseDate}
            </label>
            <input
              id="period-date"
              className="tracker-input"
              type="date"
              value={wellnessDate}
              onChange={(event) => handlePeriodDateChange(event.target.value)}
              required
            />

            <label className="tracker-label" htmlFor="cycle-end-date">
              {t.trackerCycleEndDate}
            </label>
            <input
              id="cycle-end-date"
              className="tracker-input"
              type="date"
              value={cycleEndDate}
              min={wellnessDate}
              onChange={(event) => setCycleEndDate(event.target.value)}
            />

            <label className="tracker-label" htmlFor="flow-level">
              {t.trackerFlowLevel}
            </label>
            <select
              id="flow-level"
              className="tracker-input"
              value={flowLevel}
              onChange={(event) => setFlowLevel(event.target.value)}
            >
              <option value="">{t.trackerFlowNotSet}</option>
              <option value="light">{t.trackerFlowLight}</option>
              <option value="medium">{t.trackerFlowMedium}</option>
              <option value="heavy">{t.trackerFlowHeavy}</option>
            </select>

            {error && <p className="error" role="alert">{error}</p>}
            <button className="tracker-button" type="submit" disabled={!wellnessDate || saving}>
              {saving
                ? (t.actionSaving || 'Saving…')
                : cycleLogForDate(wellnessDate)
                  ? t.trackerUpdatePeriodDay
                  : t.trackerMarkPeriodDay}
            </button>
          </form>

          <div className="tracker-summary">
            <strong>{periodDays.length}</strong>
            <span>
              {periodDays.length === 1
                ? t.trackerDateRecorded
                : t.trackerDatesRecorded}
            </span>
          </div>

          {periodDays.length > 0 && (
            <ul className="tracker-date-list">
              {periodDays.map((day) => (
                <li key={day}>
                  {day}
                  <button
                    type="button"
                    className="delete-day"
                    onClick={() => removePeriodDay(day)}
                    aria-label={`Remove ${day}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="tracker-panel">
          <span className="tracker-kicker">{t.trackerWellnessKicker}</span>
          <h3>{t.trackerWellnessTitle}</h3>
          <p>{t.trackerWellnessDescription}</p>

          <form onSubmit={saveWellness}>
            <label className="tracker-label" htmlFor="wellness-mood">
              {t.trackerMood}
            </label>
            <select
              id="wellness-mood"
              className="tracker-input"
              value={wellnessMood}
              onChange={(event) => setWellnessMood(event.target.value)}
            >
              {MOODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <span className="tracker-label">{t.trackerSymptomsLabel}</span>
            <div className="symptom-options">
              {SYMPTOM_OPTIONS.map((symptom) => (
                <label className="symptom-option" key={symptom.id}>
                  <input
                    type="checkbox"
                    checked={wellnessSymptoms.includes(symptom.id)}
                    onChange={() =>
                      setWellnessSymptoms((items) =>
                        items.includes(symptom.id)
                          ? items.filter((item) => item !== symptom.id)
                          : [...items, symptom.id]
                      )
                    }
                  />
                  {symptom.label}
                </label>
              ))}
            </div>

            <label className="tracker-label" htmlFor="wellness-notes">
              {t.trackerNotesLabel}
            </label>
            <textarea
              id="wellness-notes"
              className="tracker-input tracker-textarea"
              rows={3}
              placeholder={t.trackerNotesPlaceholder}
              value={wellnessNotes}
              onChange={(event) => setWellnessNotes(event.target.value)}
            />

            {error && <p className="error">{error}</p>}

            <button type="submit" className="tracker-button" disabled={saving}>
              {saving
                ? (t.actionSaving || 'Saving…')
                : editingHealthLogId
                  ? (t.symptomsButtonUpdate || 'Update entry')
                  : (t.trackerSaveEntry || 'Save entry')}
            </button>
            {editingHealthLogId && (
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setEditingHealthLogId(null)
                  setWellnessMood('Okay')
                  setWellnessSymptoms([])
                  setWellnessNotes('')
                }}
              >
                {t.actionCancel || 'Cancel'}
              </button>
            )}
          </form>

          <p className="tracker-privacy">{t.trackerPrivacy}</p>
        </article>
      </div>

      {healthLogs.length > 0 && (
        <div className="tracker-history">
          <h3>Your entries</h3>
          <ul className="tracker-history-list">
            {healthLogs.map((log) => (
              <li key={log.id} className="tracker-history-item">
                <span className="history-date">{log.cycle_start_date || log.created_at}</span>
                <span className="history-notes">{log.notes || '—'}</span>
                <div className="tracker-history-actions">
                  {log.notes?.startsWith('Mood:') && (
                    <button
                      type="button"
                      className="button-link"
                      onClick={() => editWellnessLog(log)}
                      aria-label={`${t.actionEdit || 'Edit'} ${log.cycle_start_date || log.created_at}`}
                    >
                      {t.actionEdit || 'Edit'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="delete-day"
                    onClick={() => deleteLog(log.id)}
                    aria-label={`${t.actionDelete || 'Delete'} ${log.cycle_start_date || log.created_at}`}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="content-note">{t.trackerDisclaimer}</p>
    </section>
  )
}
