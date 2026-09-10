import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const PORT = process.env.PORT || 5000
const TOKEN = process.env.COC_API_TOKEN
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const COC_BASE = 'https://api.clashofclans.com/v1'

if (!TOKEN) {
  console.warn(
    '\n[warn] COC_API_TOKEN is not set. Requests will fail until you add one to server/.env\n' +
      'Create a key at https://developer.clashofclans.com whitelisted to this server\'s public IP.\n'
  )
}

const app = express()
app.use(cors({ origin: CLIENT_ORIGIN }))

// Clash of Clans tags use '#', which must be percent-encoded as %23 in the path.
function encodedTag(rawTag) {
  const clean = decodeURIComponent(rawTag).replace(/^#/, '').toUpperCase()
  return encodeURIComponent(`#${clean}`)
}

async function forward(res, path) {
  try {
    const upstream = await fetch(`${COC_BASE}${path}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' }
    })
    const body = await upstream.json()
    res.status(upstream.status).json(body)
  } catch (err) {
    console.error(err)
    res.status(502).json({ reason: 'proxyError', message: 'Could not reach the Clash of Clans API.' })
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

app.listen(PORT, () => {
  console.log(`CoC proxy listening on http://localhost:${PORT}`)
})