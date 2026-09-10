import ItemIcon from './ItemIcon.jsx'

// Known Hero Pets (from Supercell API player.troops array)
const PET_NAMES = new Set([
  'L.A.S.S.I', 'Electro Owl', 'Mighty Yak', 'Unicorn', 'Frosty',
  'Diggy', 'Poison Lizard', 'Phoenix', 'Sneezy', 'Spirit Fox', 'Angry Jelly'
])

// Known Siege Machines
const SIEGE_NAMES = new Set([
  'Wall Wrecker', 'Battle Blimp', 'Stone Slammer', 'Siege Barracks',
  'Log Launcher', 'Flame Flinger', 'Battle Drill', 'Troop Launcher'
])

function ProgressBar({ level, maxLevel }) {
  const pct = maxLevel > 0 ? Math.round((level / maxLevel) * 100) : 0
  const maxed = level >= maxLevel
  return (
    <div className="w-full bg-[#0d121d] rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800 shadow-inner">
      <div
        className={`h-full transition-all duration-300 rounded-full ${
          maxed
            ? 'bg-gradient-to-r from-amber-500 to-[#ffc800] shadow-[0_0_8px_rgba(255,200,0,0.6)]'
            : 'bg-gradient-to-r from-blue-600 to-cyan-400'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function Group({ title, items, kind, village = 'home', renderExtra, badge }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-clash text-xl text-[#ffc800] uppercase tracking-wide drop-shadow-sm">
          {title}
        </h3>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
            {badge}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const maxed = item.level >= item.maxLevel
          return (
            <div
              key={item.name}
              className="bg-[#182030] border-2 border-slate-700/50 rounded-xl p-3 flex flex-col justify-between hover:border-slate-500/80 transition-colors shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <ItemIcon
                      kind={kind}
                      name={item.name}
                      village={village}
                      className="w-6 h-6 shrink-0 object-contain drop-shadow"
                    />
                    <span className="text-slate-100 text-sm font-semibold truncate">
                      {item.name}
                    </span>
                  </span>
                  <span
                    className={`font-clash text-lg shrink-0 ${
                      maxed ? 'text-[#ffc800]' : 'text-slate-300'
                    }`}
                  >
                    {item.level}
                    <span className="text-slate-500 text-xs font-sans">
                      /{item.maxLevel}
                    </span>
                  </span>
                </div>
                <ProgressBar level={item.level} maxLevel={item.maxLevel} />
              </div>
              {renderExtra?.(item)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EquipmentChips({ equipment }) {
  if (!equipment?.length) return null
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-slate-700/40">
      {equipment.map((eq) => (
        <span
          key={eq.name}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-300 bg-fuchsia-950/50 border border-fuchsia-700/40 px-2 py-0.5 rounded-md"
        >
          <ItemIcon kind="equipment" name={eq.name} className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-[80px]">{eq.name}</span>
          <span className="text-fuchsia-400 font-mono">
            {eq.level}/{eq.maxLevel}
          </span>
        </span>
      ))}
    </div>
  )
}

export default function PlayerTroops({ player }) {
  const homeHeroes = player.heroes?.filter((h) => h.village === 'home') || []
  const builderHeroes = player.heroes?.filter((h) => h.village === 'builderBase') || []
  
  const allHomeTroops = player.troops?.filter((t) => t.village === 'home') || []
  const builderTroops = player.troops?.filter((t) => t.village === 'builderBase') || []
  const spells = player.spells?.filter((s) => s.village === 'home') || []
  const heroEquipment = player.heroEquipment || []

  // Categorize home village troops into distinct groups
  const pets = allHomeTroops.filter((t) => PET_NAMES.has(t.name))
  const siegeMachines = allHomeTroops.filter((t) => SIEGE_NAMES.has(t.name))
  const superTroops = allHomeTroops.filter(
    (t) => !PET_NAMES.has(t.name) && !SIEGE_NAMES.has(t.name) && t.name.startsWith('Super ')
  )
  const standardTroops = allHomeTroops.filter(
    (t) => !PET_NAMES.has(t.name) && !SIEGE_NAMES.has(t.name) && !t.name.startsWith('Super ')
  )

  const hasAnything =
    homeHeroes.length ||
    builderHeroes.length ||
    allHomeTroops.length ||
    builderTroops.length ||
    spells.length

  if (!hasAnything) return null

  return (
    <div className="space-y-8">
      {/* Heroes */}
      <Group
        title="Heroes"
        items={homeHeroes}
        kind="hero"
        village="home"
        renderExtra={(h) => <EquipmentChips equipment={h.equipment} />}
      />

      {/* Hero Pets */}
      <Group
        title="Hero Pets"
        items={pets}
        kind="pet"
        village="home"
        badge={pets.length}
      />

      {/* Standard Home Troops */}
      <Group
        title="Troops"
        items={standardTroops}
        kind="troop"
        village="home"
      />

      {/* Super Troops Separator */}
      <Group
        title="Super Troops"
        items={superTroops}
        kind="troop"
        village="home"
        badge={superTroops.length}
      />

      {/* Siege Machines Separator */}
      <Group
        title="Siege Machines"
        items={siegeMachines}
        kind="troop"
        village="home"
        badge={siegeMachines.length}
      />

      {/* Builder Base Section */}
      <Group
        title="Builder Base Heroes"
        items={builderHeroes}
        kind="hero"
        village="builderBase"
      />
      <Group
        title="Builder Base Troops"
        items={builderTroops}
        kind="troop"
        village="builderBase"
      />

      {/* Spells */}
      <Group
        title="Spells"
        items={spells}
        kind="spell"
        village="home"
      />

      {/* Standalone Equipment List */}
      {heroEquipment.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-clash text-xl text-[#ffc800] uppercase tracking-wide drop-shadow-sm">
              Hero Equipment
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              {heroEquipment.length}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {heroEquipment.map((eq) => {
              const maxed = eq.level >= eq.maxLevel
              return (
                <div
                  key={eq.name}
                  className="bg-[#182030] border-2 border-slate-700/50 rounded-xl p-3 flex flex-col justify-between hover:border-slate-500/80 transition-colors shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 min-w-0">
                        <ItemIcon
                          kind="equipment"
                          name={eq.name}
                          className="w-6 h-6 shrink-0 object-contain drop-shadow"
                        />
                        <span className="text-slate-100 text-sm font-semibold truncate">
                          {eq.name}
                        </span>
                      </span>
                      <span
                        className={`font-clash text-lg shrink-0 ${
                          maxed ? 'text-fuchsia-400' : 'text-slate-300'
                        }`}
                      >
                        {eq.level}
                        <span className="text-slate-500 text-xs font-sans">
                          /{eq.maxLevel}
                        </span>
                      </span>
                    </div>
                    <ProgressBar level={eq.level} maxLevel={eq.maxLevel} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}