export function formatNumber(n) {
  if (n === undefined || n === null) return '—'
  return n.toLocaleString('en-US')
}

export const ROLE_LABEL = {
  leader: 'Leader',
  coLeader: 'Co-Leader',
  admin: 'Elder',
  elder: 'Elder',
  member: 'Member'
}

export function roleLabel(role) {
  return ROLE_LABEL[role] || 'Member'
}

// A small deterministic palette keyed off town hall level so the roster
// reads at a glance without needing real game art.
const TH_COLORS = [
  '#8B8FA3', '#8B8FA3', '#7FAE6E', '#7FAE6E', '#5F8FC4', '#5F8FC4',
  '#D9A855', '#D9A855', '#DD6B3B', '#DD6B3B', '#C4535F', '#C4535F',
  '#8B6FD1', '#8B6FD1', '#8B6FD1', '#E4C468', '#E4C468'
]

export function thColor(level) {
  return TH_COLORS[Math.min(level ?? 0, TH_COLORS.length - 1)] || '#8B8FA3'
}

// The API returns timestamps like "20260909T053000.000Z" — not directly parseable
// by `new Date()`. Insert the separators it's missing.
export function parseCocDate(raw) {
  if (!raw) return null
  const iso = raw.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
    '$1-$2-$3T$4:$5:$6'
  )
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

export function formatDate(raw) {
  const d = parseCocDate(raw)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(raw) {
  const d = parseCocDate(raw)
  if (!d) return '—'
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const WAR_STATE_LABEL = {
  notInWar: 'Not currently in a war',
  preparation: 'Preparation day',
  inWar: 'Battle day',
  warEnded: 'War ended'
}

export function warStateLabel(state) {
  return WAR_STATE_LABEL[state] || state
}

export function trophyTier(trophies = 0) {
  if (trophies >= 5000) return 'Legend'
  if (trophies >= 4100) return 'Titan'
  if (trophies >= 3200) return 'Champion'
  if (trophies >= 2600) return 'Master'
  if (trophies >= 2000) return 'Crystal'
  if (trophies >= 1400) return 'Gold'
  if (trophies >= 800) return 'Silver'
  return 'Bronze'
}