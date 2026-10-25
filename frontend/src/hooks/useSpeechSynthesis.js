import { useCallback, useEffect, useState } from 'react'
import { detectSpeechLang } from '../services/languages'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

function pickVoice(voices, lang) {
  const want = lang.toLowerCase()
  const norm = (v) => v.lang.replace('_', '-').toLowerCase()
  return voices.find((v) => norm(v) === want) || voices.find((v) => norm(v).startsWith(want.split('-')[0])) || null
}

// Emoji get read out loud as their names ("tulip"), so strip them before speaking.
const stripEmoji = (s) => s.replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim()

/** Browser text-to-speech. Voice availability for Indian languages varies by device - test on the demo phone. */
export function useSpeechSynthesis(defaultLang = 'en-IN') {
  const [speakingId, setSpeakingId] = useState(null)

  useEffect(() => {
    if (!supported) return undefined
    // Voices load asynchronously in some browsers; touching getVoices() nudges them to load.
    window.speechSynthesis.getVoices()
    return () => window.speechSynthesis.cancel()
  }, [])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeakingId(null)
  }, [])

  const speak = useCallback(
    (id, text) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const clean = stripEmoji(text)
      if (!clean) return
      const lang = detectSpeechLang(clean, defaultLang)
      const u = new SpeechSynthesisUtterance(clean)
      u.lang = lang
      const voice = pickVoice(window.speechSynthesis.getVoices(), lang)
      if (voice) u.voice = voice
      u.rate = 0.95
      u.onend = () => setSpeakingId((cur) => (cur === id ? null : cur))
      u.onerror = u.onend
      setSpeakingId(id)
      window.speechSynthesis.speak(u)
    },
    [defaultLang],
  )

  return { supported, speakingId, speak, stop }
}
