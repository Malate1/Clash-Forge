const STORAGE_KEY = 'clash-forge:regular-war-archive:v1'

function safeParse(value, fallback) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function getArchive() {
  if (typeof window === 'undefined') return []
  return safeParse(window.localStorage.getItem(STORAGE_KEY), [])
}

function saveArchive(items) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)))
}

function normalizeTag(tag) {
  return String(tag || '').replace(/^#/, '').toUpperCase()
}

export function makeRegularWarKey(war, clanTag) {
  const clan = normalizeTag(clanTag)
  const opponent = normalizeTag(
    war?.clan?.tag && normalizeTag(war.clan.tag) !== clan ? war.clan.tag : war?.opponent?.tag
  )
  const endTime = war?.endTime || ''
  const teamSize = war?.teamSize || ''
  return `${clan}|${opponent}|${endTime}|${teamSize}`
}

export function archiveRegularWar(war, clanTag) {
  if (!war || war.state === 'notInWar') return
  const hasAttackData = [...(war.clan?.members || []), ...(war.opponent?.members || [])].some(
    (member) => (member.attacks?.length || 0) > 0 || member.bestOpponentAttack
  )
  if (!hasAttackData) return

  const key = makeRegularWarKey(war, clanTag)
  const archive = getArchive()
  const next = [{ key, clanTag: normalizeTag(clanTag), savedAt: Date.now(), war }, ...archive.filter((item) => item.key !== key)]
  saveArchive(next)
}

export function findArchivedRegularWar(logWar, clanTag) {
  const clan = normalizeTag(clanTag)
  const opponentTag = normalizeTag(logWar?.opponent?.tag)
  const archive = getArchive()

  return archive.find((item) => {
    const war = item.war
    const itemClanTag = normalizeTag(item.clanTag)
    if (itemClanTag !== clan) return false

    const archivedOpponent = normalizeTag(
      normalizeTag(war?.clan?.tag) === clan ? war?.opponent?.tag : war?.clan?.tag
    )

    return (
      archivedOpponent === opponentTag &&
      String(war?.endTime || '') === String(logWar?.endTime || '') &&
      Number(war?.teamSize || 0) === Number(logWar?.teamSize || 0)
    )
  })?.war || null
}
