import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { hasCredentials, sanitize, streamReply } from '../server/concierge'

/** Vercel serverless function: POST /api/chat → streamed plain-text reply. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
  if (!hasCredentials()) return res.status(503).json({ error: 'not_configured' })
  const body = sanitize(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)
  if (!body) return res.status(400).json({ error: 'bad_request' })

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  try {
    await streamReply(body, (chunk) => res.write(chunk))
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) console.warn('concierge rate limited')
    else if (err instanceof Anthropic.APIError) console.error('concierge api error', err.status, err.message)
    else console.error('concierge error', err)
    if (!res.headersSent) return res.status(502).json({ error: 'upstream' })
    res.write('\n[[error]]')
  }
  res.end()
}
