import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const PORT = process.env.PORT || 5000
const TOKEN = process.env.COC_API_TOKEN
const COC_BASE = 'https://api.clashofclans.com/v1'

const app = express()

// Allow requests from localhost during dev and your Vercel deployment domain
app.use(
  cors({
    origin: '*',
    credentials: true
  })
)

// Clash of Clans tags use '#', which must be percent-encoded as %23 in the path.
function encodedTag(rawTag) {
  const clean = decodeURIComponent(rawTag).replace(/^#/, '').toUpperCase()
  return encodeURIComponent(`#${clean}`)
}

async function forward(res, path) {
  if (!TOKEN) {
    return res.status(500).json({
      reason: 'missingToken',
      message: 'COC_API_TOKEN is missing in environment variables.'
    })
  }

  try {
    const upstream = await fetch(`${COC_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/json'
      }
    })
    const body = await upstream.json()
    res.status(upstream.status).json(body)
  } catch (err) {
    console.error(err)
    res.status(502).json({
      reason: 'proxyError',
      message: 'Could not reach the Clash of Clans API.'
    })
  }
}

app.get('/api/clans/:tag', (req, res) => {
  forward(res, `/clans/${encodedTag(req.params.tag)}`)
})

app.get('/api/clans/:tag/members', (req, res) => {
  forward(res, `/clans/${encodedTag(req.params.tag)}/members?limit=50`)
})

app.get('/api/clans/:tag/currentwar', (req, res) => {
  forward(res, `/clans/${encodedTag(req.params.tag)}/currentwar`)
})

app.get('/api/clans/:tag/warlog', (req, res) => {
  forward(res, `/clans/${encodedTag(req.params.tag)}/warlog?limit=25`)
})

app.get('/api/clans/:tag/currentwar/leaguegroup', (req, res) => {
  forward(res, `/clans/${encodedTag(req.params.tag)}/currentwar/leaguegroup`)
})

// CWL individual round matches are fetched by war tag, not clan tag.
app.get('/api/wars/:warTag', (req, res) => {
  forward(res, `/clanwarleagues/wars/${encodedTag(req.params.warTag)}`)
})

app.get('/api/players/:tag', (req, res) => {
  forward(res, `/players/${encodedTag(req.params.tag)}`)
})

app.get('/api/health', (req, res) => res.json({ ok: true }))

// Local development server runner
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CoC proxy listening on http://localhost:${PORT}`)
  })
}

// Export default app for Vercel Serverless Functions
export default app