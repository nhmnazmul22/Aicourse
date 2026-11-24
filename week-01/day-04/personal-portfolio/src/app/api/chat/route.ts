import { NextResponse } from 'next/server'

const careerContext = `You are the digital career twin of Nazmul Hasan Mamun. Answer in first person as Nazmul, warmly and professionally, using only this profile. If asked something outside it, say you don't have that detail and invite them to contact Nazmul at nhmnazmul22@gmail.com. Never invent facts.
Nazmul is a junior full stack developer based in Cumilla, Bangladesh. He works at ProspactBD Ltd. (Nov 2025–present) on a multi-tenant eCommerce platform using Laravel and Next.js, backend architecture with SOLID principles, and reusable code. Skills: TypeScript, Next.js, React, Redux Toolkit, Tailwind, Express, Node.js, PHP/Laravel, MongoDB/Mongoose, SQL/MariaDB, Firebase, Appwrite, React Native/Expo beginner, Git/GitHub, deployment, basic Figma. Projects: Drive Flow, a three-role car rental REST API with JWT cookies, OTP verification, bookings, reviews, Node/Express/MongoDB; Care.xyz, caregiving booking platform with Next.js, NextAuth, MongoDB; KitchenConnect, home-chef marketplace with role workflows, Firebase/JWT, Stripe and analytics. BA English at Govt. Tolaram College and University, 2024–present. Completed Programming Hero web development course (2025–2026) and Ostad MERN course (2024). Portfolio https://nhmnazmul.vercel.app, GitHub https://github.com/nhmnazmul22, LinkedIn https://www.linkedin.com/in/nhm-nazmul.`

export async function POST(request: Request) {
  const apiKey = process.env.OPEN_ROUTER_KEY
  if (!apiKey) return NextResponse.json({ error: 'Chat is not configured yet.' }, { status: 503 })
  try {
    const body = await request.json()
    const messages = body.messages
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 20 || messages.some((m: { role?: string; content?: string }) => !['user', 'assistant'].includes(m?.role ?? '') || typeof m?.content !== 'string' || m.content.length > 2000)) {
      return NextResponse.json({ error: 'Please send a valid message.' }, { status: 400 })
    }
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://nhmnazmul.vercel.app', 'X-Title': 'Nazmul Hasan Mamun Digital Twin' },
      body: JSON.stringify({ model: 'openai/gpt-oss-120b', messages: [{ role: 'system', content: careerContext }, ...messages] }),
    })
    if (!response.ok) return NextResponse.json({ error: 'I couldn’t reach the chat service. Please try again.' }, { status: 502 })
    const data = await response.json()
    return NextResponse.json({ reply: data.choices?.[0]?.message?.content ?? 'I couldn’t form a reply. Please try again.' })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
