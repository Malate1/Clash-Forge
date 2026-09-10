// Thin client for our own proxy server (see /api or /server).

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
    // Construct clean URL avoiding double slashes if BASE ends with /
    const cleanBase = BASE.replace(/\/$/, '')
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    res = await fetch(`${cleanBase}${cleanPath}`)
  } catch (err) {
    throw new CocApiError(
      `Network Error: Could not reach proxy at ${BASE}. Ensure the proxy is running and VITE_API_BASE is correct. (${err.message})`,
      0
    )
  }

  // Attempt to safely parse JSON response body regardless of status code
  let data = null
  const contentType = res.headers.get('content-type') || ''
  
  if (contentType.includes('application/json')) {
    try {
      data = await res.json()
    } catch (e) {
      // JSON parsing failed unexpectedly
    }
  }

  // If HTTP status is not OK (200-299), throw detailed error
  if (!res.ok) {
    // Extract error reason or message from proxy or Supercell payload if available
    const serverMessage = data?.message || data?.reason || ''

    if (res.status === 404) {
      throw new CocApiError(
        serverMessage || 'Not found. Double-check the tag and try again.',
        404
      )
    }

    if (res.status === 403) {
      throw new CocApiError(
        serverMessage || 'Access Denied (403). The proxy API key may not be whitelisted for its current IP.',
        403
      )
    }

    if (res.status === 502) {
      throw new CocApiError(
        serverMessage || 'Bad Gateway (502). The proxy server failed to reach the Clash of Clans API.',
        502
      )
    }

    if (res.status === 500) {
      throw new CocApiError(
        serverMessage || 'Internal Server Error (500) in proxy server.',
        500
      )
    }

    throw new CocApiError(
      serverMessage || `Request failed with status ${res.status}: ${res.statusText}`,
      res.status
    )
  }

  // Handle cases where status is 200 OK, but backend sent back non-JSON or proxy error payload
  if (!data) {
    throw new CocApiError('Invalid Response: Server returned non-JSON content or an empty payload.', res.status)
  }

  // Handle cases where Clash of Clans returned an error inside a 200 payload wrapper
  if (data.reason || data.message) {
    if (data.reason === 'accessDenied' || data.reason === 'invalidIp') {
      throw new CocApiError(`CoC API IP Error: ${data.message || data.reason}`, 403)
    }
    if (data.reason === 'notFound') {
      throw new CocApiError(`CoC API Error: ${data.message || 'Tag not found'}`, 404)
    }
  }

  return data
}

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

export function getWarLog(tag) {
  return request(`/clans/${encodeURIComponent(normalizeTag(tag))}/warlog`)
}

export function getLeagueGroup(tag) {
  return request(`/clans/${encodeURIComponent(normalizeTag(tag))}/currentwar/leaguegroup`)
}

export function getCwlWar(warTag) {
  return request(`/wars/${encodeURIComponent(normalizeTag(warTag))}`)
}

export function getPlayer(tag) {
  return request(`/players/${encodeURIComponent(normalizeTag(tag))}`)
}

export { CocApiError }