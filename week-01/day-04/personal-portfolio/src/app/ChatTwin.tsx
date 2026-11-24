'use client'

import { FormEvent, useState } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

function FormattedReply({ content }: { content: string }) {
  const lines = content.replace(/\\(?=[#*|\-])/g, '').split('\n')
  const inline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g)
    return parts.map((part, i) => {
      const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
      if (link) return <a href={link[2]} key={i} target="_blank" rel="noreferrer">{link[1]}</a>
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
      if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
      return part
    })
  }
  const rendered = []
  let list: string[] = []
  let table: string[][] = []
  const flush = () => {
    if (list.length) { rendered.push(<ul key={`ul-${rendered.length}`}>{list.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>); list = [] }
    if (table.length) { rendered.push(<div className="reply-table" key={`table-${rendered.length}`}>{table.filter(row => !row.every(cell => /^:?-{3,}:?$/.test(cell))).map((row, i) => <div className="reply-table-row" key={i}>{row.map((cell, j) => <span key={j}>{inline(cell)}</span>)}</div>)}</div>); table = [] }
  }
  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (!line) { flush(); return }
    if (line.startsWith('|')) { if (list.length) flush(); table.push(line.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())); return }
    if (/^[-*•]\s+/.test(line)) { if (table.length) flush(); list.push(line.replace(/^[-*•]\s+/, '')); return }
    flush()
    const heading = line.match(/^#{1,3}\s+(.+)$/)
    if (heading) rendered.push(<h4 key={`h-${i}`}>{inline(heading[1])}</h4>)
    else rendered.push(<p key={`p-${i}`}>{inline(line)}</p>)
  })
  flush()
  return <div className="formatted-reply">{rendered}</div>
}

export default function ChatTwin() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const content = input.trim()
    if (!content || busy) return
    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next); setInput(''); setBusy(true); setError('')
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Please try again.')
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.') }
    finally { setBusy(false) }
  }

  return <section className="chat-section" id="digital-twin"><div className="wrap chat-layout"><div className="chat-intro"><div className="section-kicker"><span className="kicker-mark" /> Ask my digital twin</div><h2>A conversation<br />about my work.</h2><p>Ask about my experience, projects, or the tools I use. This AI answers from my career profile.</p><div className="chat-suggestions"><span>Try asking</span><button onClick={() => setInput('What are you working on at ProspactBD?')}>What are you working on now?</button><button onClick={() => setInput('Tell me about your featured projects.')}>Tell me about my projects</button></div></div><div className="chat-box"><div className="chat-head"><span className="status-dot" /> <b>Nazmul’s digital twin</b><span>Career Q&amp;A</span></div><div className="chat-messages" aria-live="polite">{messages.length === 0 ? <p className="chat-welcome">Hi, I’m Nazmul’s digital twin. Ask me about his career, projects, or technical experience.</p> : messages.map((message, i) => <div className={`chat-message ${message.role}`} key={i}>{message.role === 'assistant' ? <FormattedReply content={message.content} /> : message.content}</div>)}{busy && <p className="chat-message assistant">Thinking…</p>}{error && <p className="chat-error" role="alert">{error}</p>}</div><form className="chat-form" onSubmit={submit}><input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question about my career…" aria-label="Your question" maxLength={1000} /><button type="submit" disabled={busy || !input.trim()} aria-label="Send message">↑</button></form></div></div></section>
}
