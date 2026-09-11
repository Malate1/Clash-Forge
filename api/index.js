import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { HttpsProxyAgent } from 'https-proxy-agent'

const PORT = process.env.PORT || 5000
const TOKEN = process.env.COC_API_TOKEN
const FIXIE_URL = process.env.FIXIE_URL
const COC_BASE = 'https://api.clashofclans.com/v1'

// Create a proxy agent if FIXIE_URL is provided
const proxyAgent = FIXIE_URL ? new HttpsProxyAgent(FIXIE_URL) : null

const app = express()

app.use(cors({ origin: '*', credentials: true }))

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
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/json'
      }
    }

    // Attach the static proxy agent to outbound requests
    if (proxyAgent) {
      fetchOptions.agent = proxyAgent
    }

    const upstream = await fetch(`${COC_BASE}${path}`, fetchOptions)
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

// Routes
app.get(['/api/clans/:tag', '/clans/:tag'], (req, res) => forward(res, `/clans/${encodedTag(req.params.tag)}`))
app.get(['/api/clans/:tag/members', '/clans/:tag/members'], (req, res) => forward(res, `/clans/${encodedTag(req.params.tag)}/members?limit=50`))
app.get(['/api/clans/:tag/currentwar', '/clans/:tag/currentwar'], (req, res) => forward(res, `/clans/${encodedTag(req.params.tag)}/currentwar`))
app.get(['/api/clans/:tag/warlog', '/clans/:tag/warlog'], (req, res) => forward(res, `/clans/${encodedTag(req.params.tag)}/warlog?limit=25`))
app.get(['/api/clans/:tag/currentwar/leaguegroup', '/clans/:tag/currentwar/leaguegroup'], (req, res) => forward(res, `/clans/${encodedTag(req.params.tag)}/currentwar/leaguegroup`))
app.get(['/api/wars/:warTag', '/wars/:warTag'], (req, res) => forward(res, `/clanwarleagues/wars/${encodedTag(req.params.warTag)}`))
app.get(['/api/players/:tag', '/players/:tag'], (req, res) => forward(res, `/players/${encodedTag(req.params.tag)}`))
app.get(['/api/health', '/health'], (req, res) => res.json({ ok: true }))

export default app