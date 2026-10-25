import { useCallback, useEffect, useState } from 'react'
import {
  createReminder,
  deleteReminder,
  fetchReminders,
  updateReminder,
} from '../../services/api'

export default function Reminders({ t }) {
  const [reminders, setReminders] = useState([])
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('medication')
  const [frequency, setFrequency] = useState('daily')
  const [timeOfDay, setTimeOfDay] = useState('')
  const [active, setActive] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [errorCode, setErrorCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const kinds = [
    { value: 'medication', label: t?.remindersTypeMedication || 'Medication' },
    { value: 'preventive_care', label: t?.remindersTypePreventive || 'Preventive care' },
  ]

  const frequencies = [
    { value: 'daily', label: t?.remindersFreqDaily || 'Daily' },
    { value: 'weekly', label: t?.remindersFreqWeekly || 'Weekly' },
    { value: 'monthly', label: t?.remindersFreqMonthly || 'Monthly' },
    { value: 'custom', label: t?.remindersFreqCustom || 'Custom' },
  ]

  const load = useCallback(async () => {
    setLoading(true)
    setErrorCode(null)
    try {
      const data = await fetchReminders({ limit: 100 })
      setReminders(data)
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
    } catch {
      setErrorCode('save_failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmMsg = t?.remindersDeleteConfirm || 'Delete this reminder?'
    if (!window.confirm(confirmMsg)) return
    setErrorCode(null)
    try {
      await deleteReminder(id)
      if (editingId === id) {
        cancelEdit()
      }
      load()
    } catch {
      setErrorCode('delete_failed')
    }
  }

  const handleToggle = async (reminder) => {
    try {
      await updateReminder(reminder.id, { active: !reminder.active })
      load()
    } catch {
      setErrorCode('update_failed')
    }
  }

  const handleMarkTaken = async (reminder) => {
    setErrorCode(null)
    try {
      await updateReminder(reminder.id, { last_taken: new Date().toISOString() })
      await load()
    } catch {
      setErrorCode('update_failed')
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

  const errorMessage = errorCode === 'session_expired'
    ? (t?.sessionExpired || 'Session expired. Please sign in again.')
    : errorCode === 'load_failed'
      ? (t?.remindersErrorLoad || 'Unable to load reminders.')
      : errorCode === 'save_failed'
        ? (t?.remindersErrorSave || 'Unable to save reminder.')
        : errorCode === 'delete_failed'
          ? (t?.remindersErrorDelete || 'Unable to delete reminder.')
          : errorCode === 'update_failed'
            ? (t?.remindersErrorUpdate || 'Unable to update reminder.')
            : null

  if (loading) {
    return (
      <div className="reminders-page">
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{t?.remindersKicker || 'Reminders'}</span>
              <h2>{t?.remindersHeading || 'Medication & care reminders'}</h2>
            </div>
            <span className="heading-flower">✿</span>
          </div>
          <div className="loading-state">
            <p>{t?.remindersLoading || 'Loading your reminders…'}</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="reminders-page">
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{t?.remindersKicker || 'Reminders'}</span>
            <h2>{t?.remindersHeading || 'Medication & care reminders'}</h2>
            <p>{t?.remindersIntro || 'Set reminders for medications, supplements, or preventive care.'}</p>
          </div>
          <span className="heading-flower">✿</span>
        </div>

        <form onSubmit={handleSubmit} className="reminder-form">
          <div className="field">
            <label htmlFor="reminder-title">{t?.remindersLabelTitle || 'Title'}</label>
            <input
              id="reminder-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t?.remindersPlaceholderTitle || 'e.g. Iron tablet, prenatal vitamin'}
              autoComplete="off"
            />
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="reminder-kind">{t?.remindersLabelType || 'Type'}</label>
              <select
                id="reminder-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="tracker-input"
              >
                {kinds.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="reminder-freq">{t?.remindersLabelFrequency || 'Frequency'}</label>
              <select
                id="reminder-freq"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="tracker-input"
              >
                {frequencies.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="reminder-time">
              <span>{t?.remindersLabelTime || 'Time of day (optional)'}</span>
            </label>
            <input
              id="reminder-time"
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="tracker-input"
            />
          </div>

          <div className="field">
            <label htmlFor="reminder-active" className="checkbox-label">
              <input
                id="reminder-active"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span>{t?.remindersLabelActive || 'Active'}</span>
            </label>
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
                  ? (t?.remindersButtonUpdate || 'Update reminder')
                  : (t?.remindersButtonAdd || 'Add reminder')}
            </button>
            {editingId && (
              <button type="button" className="button-secondary" onClick={cancelEdit}>
                {t?.actionCancel || 'Cancel'}
              </button>
            )}
          </div>
        </form>
      </section>

      {reminders.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{t?.remindersKicker || 'Reminders'}</span>
              <h2>{t?.remindersHistoryHeading || 'Active & upcoming'}</h2>
            </div>
            <span className="heading-flower">✿</span>
          </div>

          <ul className="reminder-list" aria-label={t?.remindersHistoryHeading || 'Active & upcoming'}>
            {reminders.map((r) => {
              const kindLabel =
                r.kind === 'medication'
                  ? (t?.remindersTypeMedication || 'Medication')
                  : r.kind === 'preventive_care'
                    ? (t?.remindersTypePreventive || 'Preventive care')
                    : r.kind.replace('_', ' ')

              const freqLabel =
                r.frequency === 'daily'
                  ? (t?.remindersFreqDaily || 'Daily')
                  : r.frequency === 'weekly'
                    ? (t?.remindersFreqWeekly || 'Weekly')
                    : r.frequency === 'monthly'
                      ? (t?.remindersFreqMonthly || 'Monthly')
                      : r.frequency === 'custom'
                        ? (t?.remindersFreqCustom || 'Custom')
                        : r.frequency

              return (
                <li key={r.id} className={`reminder-item ${r.active ? '' : 'inactive'}`}>
                  <div className="reminder-info">
                    <strong>{r.title}</strong>
                    <span className={`badge badge-${r.kind}`}>{kindLabel}</span>
                    <span className="badge badge-frequency">{freqLabel}</span>
                    {r.time_of_day && <span className="reminder-time">{r.time_of_day}</span>}
                    {r.last_taken && (
                      <span className="reminder-time">
                        {t?.remindersLastTaken || 'Last taken'}:{' '}
                        <time dateTime={r.last_taken}>
                          {r.last_taken.replace('T', ' ').slice(0, 16)}
                        </time>
                      </span>
                    )}
                  </div>
                  <div className="reminder-actions">
                    {r.active && (
                      <button
                        type="button"
                        className="button-link button-activate"
                        onClick={() => handleMarkTaken(r)}
                        aria-label={`${t?.remindersMarkTaken || 'Mark taken'}: ${r.title}`}
                      >
                        {t?.remindersMarkTaken || 'Mark taken'}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`button-link ${r.active ? 'button-deactivate' : 'button-activate'}`}
                      onClick={() => handleToggle(r)}
                      aria-label={`${r.active ? (t?.actionDeactivate || 'Deactivate') : (t?.actionActivate || 'Activate')} ${r.title}`}
                    >
                      {r.active ? (t?.actionDeactivate || 'Deactivate') : (t?.actionActivate || 'Activate')}
                    </button>
                    <button
                      type="button"
                      className="button-link"
                      onClick={() => handleEdit(r)}
                      aria-label={`${t?.actionEdit || 'Edit'} ${r.title}`}
                    >
                      {t?.actionEdit || 'Edit'}
                    </button>
                    <button
                      type="button"
                      className="button-link button-delete"
                      onClick={() => handleDelete(r.id)}
                      aria-label={`${t?.actionDelete || 'Delete'} ${r.title}`}
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
          <h3>{t?.remindersEmptyTitle || 'No reminders scheduled'}</h3>
          <p>{t?.remindersEmptyText || 'Set a medication or care reminder above to stay on track with your health routine.'}</p>
        </div>
      )}

      <p className="content-note">
        {t?.remindersDisclaimer ||
          'Sakhi stores your reminders locally on the server. It does not send push notifications or SMS — please check this page or set your own phone reminders for time-sensitive medications.'}
      </p>
    </div>
  )
}
