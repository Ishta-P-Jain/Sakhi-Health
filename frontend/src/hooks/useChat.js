import { useCallback, useEffect, useRef, useState } from 'react'
import { postChat } from '../services/api'
import { langInfo } from '../services/languages'

let counter = 0
const nextId = () => `m${++counter}`
const greeting = () => ({ id: 'greeting', role: 'assistant', replyKey: 'initialGreeting' })

/**
 * Chat state + backend calls.
 * `offlineReply(text)` must return { replyKey, text } - it is used when the API is unreachable,
 * so the demo never shows a dead chat.
 */
export function useChat({ language, offlineReply }) {
  const [messages, setMessages] = useState(() => [greeting()])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [online, setOnline] = useState(null) // null = not tried yet
  const messagesRef = useRef(messages)
  const session = useRef(0) // bumped on clear so late replies from an old chat are dropped

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const send = useCallback(
    async (raw) => {
      const text = (typeof raw === 'string' ? raw : input).trim()
      if (!text || loading) return
      const sid = session.current
      const history = messagesRef.current
        .filter((m) => m.text && !m.offline)
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text }))

      setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
      setInput('')
      setLoading(true)
      try {
        const res = await postChat({ message: text, language: langInfo(language).code, history })
        if (sid !== session.current) return
        setOnline(true)
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', text: res.reply, emergency: res.source === 'safety' },
        ])
      } catch {
        if (sid !== session.current) return
        setOnline(false)
        setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', offline: true, ...offlineReply(text) }])
      } finally {
        if (sid === session.current) setLoading(false)
      }
    },
    [input, loading, language, offlineReply],
  )

  const clear = useCallback(() => {
    session.current += 1
    setMessages([greeting()])
    setInput('')
    setLoading(false)
  }, [])

  return { messages, input, setInput, send, clear, loading, online }
}
