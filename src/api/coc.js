// Thin client for our own proxy server (see /server).
//
// IMPORTANT: The official Clash of Clans API (developer.clashofclans.com) does not
// send CORS headers and only accepts requests from an IP address you whitelist on
// your API key. That means a browser can never call it directly. This client talks
// to a small proxy (in /server) that holds the API key server-side and forwards
// requests. Run the proxy locally (or deploy it) and point VITE_API_BASE at it.

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

class CocApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path) {
  let res
  try {
    res = await fetch(`${BASE}${path}`)
  } catch (err) {
    throw new CocApiError(
      'Could not reach the proxy server. Is it running on the configured VITE_API_BASE?',
      0
    )
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new CocApiError('Not found. Double-check the tag and try again.', 404)
    }
    if (res.status === 403) {
      throw new CocApiError(
        'The API rejected this request. The proxy\'s API key may not be whitelisted for its current IP.',
        403
      )
    }
    throw new CocApiError('Something went wrong talking to the Clash of Clans API.', res.status)
  }
  return res.json()
}

// Tags are stored/typed without a leading # in the URL, e.g. "2PP" not "#2PP".
// This normalizes user input either way before it hits the proxy.
export function normalizeTag(raw) {
  if (!raw) return ''
  return raw.trim().toUpperCase().replace(/^#/, '').replace(/O/g, '0')
}

export function getClan(tag) {
  return request(`/clans/${encodeURIComponent(normalizeTag(tag))}`)
}

export function getClanMembers(tag) {
  return request(`/clans/${encodeURIComponent(normalizeTag(tag))}/members`)
}

export function getCurrentWar(tag) {
  return request(`/clans/${encodeURIComponent(normalizeTag(tag))}/currentwar`)
}

// Regular (non-CWL) war log — the clan's past war results.
// Requires the clan to have its war log set to public in-game.
export function getWarLog(tag) {
  return request(`/clans/${encodeURIComponent(normalizeTag(tag))}/warlog`)
}

// CWL "league group" — the season, the 8 clans in it, and 7 rounds of war tags.
export function getLeagueGroup(tag) {
  return request(`/clans/${encodeURIComponent(normalizeTag(tag))}/currentwar/leaguegroup`)
}

// A single CWL round's match, fetched by WAR tag (not clan tag) — get these
// from a round's `warTags` array in the league group response above.
export function getCwlWar(warTag) {
  return request(`/wars/${encodeURIComponent(normalizeTag(warTag))}`)
}

export function getPlayer(tag) {
  return request(`/players/${encodeURIComponent(normalizeTag(tag))}`)
}

export { CocApiError }
