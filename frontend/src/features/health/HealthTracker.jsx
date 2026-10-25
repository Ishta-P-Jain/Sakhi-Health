import { useCallback, useEffect, useState } from 'react'
import {
  createHealthLog,
  deleteHealthLog,
  fetchHealthLogs,
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
  const [healthLogs, setHealthLogs] = useState([])
  const [symptomLogs, setSymptomLogs] = useState([])
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
      const dates = logs
        .filter((l) => l.cycle_start_date)
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

  const togglePeriodDay = async (date) => {
    if (periodDays.includes(date)) {
      const log = healthLogs.find((l) => l.cycle_start_date === date)
      if (log) {
        try {
          await deleteHealthLog(log.id)
          setPeriodDays(periodDays.filter((d) => d !== date))
          setHealthLogs(healthLogs.filter((l) => l.id !== log.id))
        } catch (err) {
          setError('Unable to remove period day.')
        }
      }
    } else {
      setSaving(true)
      try {
        await createHealthLog({ cycle_start_date: date })
        setPeriodDays([...periodDays, date].sort())
        load()
      } catch (err) {
        setError('Unable to mark period day.')
      } finally {
        setSaving(false)
      }
    }
  }

  const saveWellness = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createHealthLog({
        cycle_start_date: wellnessDate,
        notes: `Mood: ${wellnessMood}. ${wellnessNotes}`,
      })
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
      load()
    } catch (err) {
      setError('Unable to save wellness entry.')
    } finally {
      setSaving(false)
    }
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

          <label className="tracker-label" htmlFor="period-date">
            {t.trackerChooseDate}
          </label>
          <input
            id="period-date"
            className="tracker-input"
            type="date"
            value={wellnessDate}
            onChange={(event) => setWellnessDate(event.target.value)}
          />

          <button
            className="tracker-button"
            onClick={() => togglePeriodDay(wellnessDate)}
            disabled={!wellnessDate || saving}
          >
            {periodDays.includes(wellnessDate)
              ? t.trackerRemovePeriodDay
              : t.trackerMarkPeriodDay}
          </button>

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
                    onClick={() => togglePeriodDay(day)}
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
              {saving ? 'Saving…' : 'Save entry'}
            </button>
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
                <button
                  type="button"
                  className="delete-day"
                  onClick={() => deleteLog(log.id)}
                  aria-label="Delete entry"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="content-note">{t.trackerDisclaimer}</p>
    </section>
  )
}
