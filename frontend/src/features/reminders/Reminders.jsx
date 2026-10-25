import { useCallback, useEffect, useState } from 'react'
import {
  createReminder,
  deleteReminder,
  fetchReminders,
  updateReminder,
} from '../../services/api'

const KINDS = [
  { value: 'medication', label: 'Medication' },
  { value: 'preventive_care', label: 'Preventive care' },
]

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
]

export default function Reminders({ t }) {
  const [reminders, setReminders] = useState([])
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('medication')
  const [frequency, setFrequency] = useState('daily')
  const [timeOfDay, setTimeOfDay] = useState('')
  const [active, setActive] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchReminders({ limit: 100 })
      setReminders(data)
    } catch (err) {
      setError(err.status === 401 ? 'Session expired. Please sign in again.' : 'Unable to load reminders.')
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
      const payload = {
        title,
        kind,
        frequency,
        time_of_day: timeOfDay || undefined,
        active,
      }
      if (editingId) {
        await updateReminder(editingId, payload)
      } else {
        await createReminder(payload)
      }
      setTitle('')
      setKind('medication')
      setFrequency('daily')
      setTimeOfDay('')
      setActive(true)
      setEditingId(null)
      load()
    } catch (err) {
      setError('Unable to save reminder.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return
    try {
      await deleteReminder(id)
      load()
    } catch (err) {
      setError('Unable to delete reminder.')
    }
  }

  const handleToggle = async (reminder) => {
    try {
      await updateReminder(reminder.id, { active: !reminder.active })
      load()
    } catch (err) {
      setError('Unable to update reminder.')
    }
  }

  const handleEdit = (r) => {
    setEditingId(r.id)
    setTitle(r.title)
    setKind(r.kind)
    setFrequency(r.frequency)
    setTimeOfDay(r.time_of_day || '')
    setActive(r.active)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setTitle('')
    setKind('medication')
    setFrequency('daily')
    setTimeOfDay('')
    setActive(true)
  }

  if (loading) {
    return <div className="reminders-page">Loading your reminders…</div>
  }

  return (
    <div className="reminders-page">
      <section className="section">
        <div className="section-heading">
          <span className="section-kicker">Reminders</span>
          <h2>Medication &amp; care reminders</h2>
          <p>Set reminders for medications, supplements, or preventive care.</p>
          <span className="heading-flower">✿</span>
        </div>

        <form onSubmit={handleSubmit} className="reminder-form">
          <div className="field">
            <label>Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Iron tablet, prenatal vitamin"
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label>Type</label>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="tracker-input">
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="tracker-input"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Time of day (optional)</label>
            <input
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="tracker-input"
            />
          </div>
          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.value === 'true')}
              />
              Active
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button-primary" disabled={saving}>
            {editingId ? 'Update reminder' : 'Add reminder'}
          </button>
          {editingId && (
            <button type="button" className="button-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>
      </section>

      {reminders.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <span className="section-kicker">Your reminders</span>
            <h2>Active &amp; upcoming</h2>
            <span className="heading-flower">✿</span>
          </div>
          <ul className="reminder-list">
            {reminders.map((r) => (
              <li key={r.id} className={`reminder-item ${r.active ? '' : 'inactive'}`}>
                <div className="reminder-info">
                  <strong>{r.title}</strong>
                  <span className={`badge badge-${r.kind}`}>{r.kind.replace('_', ' ')}</span>
                  <span className="badge badge-frequency">{r.frequency}</span>
                  {r.time_of_day && <span className="reminder-time">{r.time_of_day}</span>}
                </div>
                <div className="reminder-actions">
                  <button
                    type="button"
                    className={`button-link ${r.active ? 'button-deactivate' : 'button-activate'}`}
                    onClick={() => handleToggle(r)}
                  >
                    {r.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="button-link"
                    onClick={() => handleEdit(r)}
                  >
                    Edit
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

      <p className="content-note">
        Sakhi stores your reminders locally on the server. It does not send push
        notifications or SMS — please check this page or set your own phone
        reminders for time-sensitive medications.
      </p>
    </div>
  )
}
