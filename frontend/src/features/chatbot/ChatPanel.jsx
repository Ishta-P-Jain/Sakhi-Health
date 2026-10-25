import { useEffect, useRef } from 'react'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { langInfo } from '../../services/languages'
import { chatStrings } from './strings'
import './chatbot.css'

const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
)
const SpeakerIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    {active ? <path d="M17 8a5 5 0 0 1 0 8" /> : <path d="M17 9l4 6M21 9l-4 6" />}
  </svg>
)

/**
 * Chat window. State lives in useChat() (called in App so the home-page question box can
 * also send messages). `renderText(message)` resolves canned/localised greeting text.
 */
export default function ChatPanel({ chat, t, language, renderText }) {
  const s = chatStrings[language] || chatStrings.English
  const speechLang = langInfo(language).speech
  const boxRef = useRef(null)

  const speech = useSpeechRecognition({ lang: speechLang, onResult: (text) => chat.send(text) })
  const tts = useSpeechSynthesis(speechLang)

  useEffect(() => {
    const el = boxRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [chat.messages.length, chat.loading])

  const status = chat.online === false ? s.offline : s.ready
  const micMessage = speech.listening
    ? s.listening
    : speech.error === 'not-allowed' || speech.error === 'service-not-allowed'
      ? s.micDenied
      : speech.error
        ? s.micError
        : ''

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">
        <div className="chat-avatar small">S</div>
        <div className="chat-panel-title">
          <strong>{t.assistantPanelTitle}</strong>
          <span>{t.assistantPanelSubtitle}</span>
        </div>
        <div className="chat-actions">
          <span className={`chat-status ${chat.online === false ? 'cb-offline' : ''}`}>{status}</span>
          <button type="button" onClick={chat.clear} aria-label={t.assistantClearChatAria}>
            {t.assistantClearChat}
          </button>
        </div>
      </div>

      <div className="chat-messages" aria-live="polite" ref={boxRef}>
        {chat.messages.map((m) => {
          const text = renderText(m)
          const speaking = tts.speakingId === m.id
          return (
            <div key={m.id} className={`chat-message ${m.role} cb-bubble${m.emergency ? ' cb-emergency' : ''}`}>
              {m.emergency && <strong className="cb-urgent">{s.urgent}</strong>}
              <span className="cb-text">{text}</span>
              {m.offline && <small className="cb-note">{s.offlineNote}</small>}
              {m.role === 'assistant' && tts.supported && text && (
                <button
                  type="button"
                  className="cb-speak"
                  aria-label={speaking ? s.stopSpeak : s.speak}
                  onClick={() => (speaking ? tts.stop() : tts.speak(m.id, text))}
                >
                  <SpeakerIcon active={!speaking} /> {speaking ? s.stopSpeak : s.speak}
                </button>
              )}
            </div>
          )
        })}
        {chat.loading && (
          <div className="chat-message assistant cb-typing" role="status" aria-label={s.thinking}>
            <i /><i /><i />
          </div>
        )}
      </div>

      {micMessage && <p className={`cb-mic-msg${speech.listening ? ' live' : ''}`} role="status">{micMessage}</p>}

      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault()
          chat.send()
        }}
      >
        {speech.supported && (
          <button
            type="button"
            className={`cb-mic${speech.listening ? ' listening' : ''}`}
            aria-pressed={speech.listening}
            aria-label={speech.listening ? s.micStop : s.micStart}
            title={speech.listening ? s.micStop : s.micStart}
            onClick={speech.listening ? speech.stop : speech.start}
          >
            <MicIcon />
          </button>
        )}
        <input
          aria-label={t.assistantInputAria}
          value={chat.input}
          onChange={(event) => chat.setInput(event.target.value)}
          placeholder={t.assistantInputPlaceholder}
          lang={speechLang}
        />
        <button type="submit" disabled={!chat.input.trim() || chat.loading}>
          {t.assistantSend} ↗
        </button>
      </form>

      <p className="chat-disclaimer">{t.assistantDisclaimer}</p>
    </div>
  )
}
