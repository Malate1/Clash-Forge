export function isSuperTroop(troop) {
  return /^super\s/i.test(troop?.name || '')
}
