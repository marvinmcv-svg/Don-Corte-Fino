import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })

/** Serves /api/chat in `vite dev` with the same code the Vercel function uses. */
function conciergeDevApi(): Plugin {
  return {
    name: 'concierge-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        const json = (status: number, body: object) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })
        const mod = await server.ssrLoadModule('/server/concierge.ts')
        if (!mod.hasCredentials()) return json(503, { error: 'not_configured' })
        let parsed: unknown
        try {
          parsed = JSON.parse(await readBody(req))
        } catch {
          return json(400, { error: 'bad_request' })
        }
        const body = mod.sanitize(parsed)
        if (!body) return json(400, { error: 'bad_request' })
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        try {
          await mod.streamReply(body, (chunk: string) => res.write(chunk))
        } catch (err) {
          server.config.logger.error(String(err))
          if (!res.headersSent) return json(502, { error: 'upstream' })
          res.write('\n[[error]]')
        }
        res.end()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Expose .env (ANTHROPIC_API_KEY, ANTHROPIC_MODEL) to the dev API middleware
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), conciergeDevApi()],
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('gsap') || id.includes('lenis') || id.includes('framer-motion')) return 'motion'
          },
        },
      },
    },
  }
})
