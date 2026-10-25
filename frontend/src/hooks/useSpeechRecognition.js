import { useCallback, useEffect, useRef, useState } from 'react'

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

/** Browser speech-to-text (Chrome/Edge/Android Chrome/Safari). `lang` is a BCP-47 tag like 'hi-IN'. */
export function useSpeechRecognition({ lang, onResult }) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const recRef = useRef(null)
  const onResultRef = useRef(onResult)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => () => recRef.current?.abort(), [])

  const start = useCallback(() => {
    if (!SR) return
    setError('')
    const rec = new SR()
    rec.lang = lang
    rec.interimResults = false
    rec.continuous = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript?.trim()
      if (text) onResultRef.current?.(text)
    }
    rec.onerror = (e) => {
      setError(e.error || 'error')
      setListening(false)
    }
    rec.onend = () => {
      setListening(false)
      recRef.current = null
    }
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }, [lang])

  const stop = useCallback(() => recRef.current?.stop(), [])

  return { supported: Boolean(SR), listening, error, start, stop }
}
