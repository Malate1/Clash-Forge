import ItemIcon from "./ItemIcon.jsx";
import { isSuperTroop } from "../utils/troops.js";

// Known Hero Pets (from Supercell API player.troops array)
const PET_NAMES = new Set([
  "L.A.S.S.I",
  "Electro Owl",
  "Mighty Yak",
  "Unicorn",
  "Frosty",
  "Diggy",
  "Poison Lizard",
  "Phoenix",
  "Sneezy",
  "Spirit Fox",
	"Angry Jelly",
  "Greedy Raven",
]);

// Known Siege Machines
const SIEGE_NAMES = new Set([
  "Wall Wrecker",
  "Battle Blimp",
  "Stone Slammer",
  "Siege Barracks",
  "Log Launcher",
  "Flame Flinger",
  "Battle Drill",
	"Troop Launcher",
	"Sky Wagon",

  
]);

const ELIXIR_TROOP_NAMES = new Set([
  "Barbarian",
  "Archer",
  "Giant",
  "Goblin",
  "Wall Breaker",
  "Balloon",
  "Wizard",
  "Healer",
  "Dragon",
  "P.E.K.K.A",
  "Baby Dragon",
  "Miner",
  "Electro Dragon",
  "Yeti",
  "Dragon Rider",
  "Electro Titan",
  "Root Rider",
  "Thrower",
  "Meteor Golem",
  "Rocket Balloon",
  "Inferno Dragon",
]);

const DARK_ELIXIR_TROOP_NAMES = new Set([
  "Minion",
  "Hog Rider",
  "Valkyrie",
  "Golem",
  "Witch",
  "Lava Hound",
  "Bowler",
  "Ice Golem",
  "Headhunter",
  "Apprentice Warden",
  "Druid",
  "Furnace",
  "Ruin Witch",
  "Ice Hound",
]);

const HERO_EQUIPMENT = {
  "Barbarian King": [
    "Barbarian Puppet",
    "Rage Vial",
    "Earthquake Boots",
    "Vampstache",
    "Giant Gauntlet",
    "Spiky Ball",
    "Snake Bracelet",
    "Stick Horse",
  ],
  "Archer Queen": [
    "Archer Puppet",
    "Invisibility Vial",
    "Giant Arrow",
    "Healer Puppet",
    "Frozen Arrow",
    "Magic Mirror",
    "Action Figure",
    "Monolith Arrow",
  ],
  "Minion Prince": [
    "Henchmen Puppet",
    "Dark Orb",
    "Metal Pants",
    "Noble Iron",
    "Dark Crown",
    "Meteor Staff",
    "Portal Pendant",
  ],
  "Grand Warden": [
    "Eternal Tome",
    "Life Gem",
    "Rage Gem",
    "Healing Tome",
    "Fireball",
    "Lavaloon Puppet",
    "Heroic Torch",
  ],
  "Royal Champion": [
    "Royal Gem",
    "Seeking Shield",
    "Hog Rider Puppet",
    "Haste Vial",
    "Rocket Spear",
    "Electro Boots",
    "Frost Flake",
  ],
  "Dragon Duke": [
    "Fire Heart",
    "Flame Blower",
    "Stun Blaster",
    "Electro Fangs",
    "Rocket Backpack",
    "Revenge Deck",
  ],
};

function ProgressBar({ level, maxLevel }) {
  const pct = maxLevel > 0 ? Math.round((level / maxLevel) * 100) : 0;
  const maxed = level >= maxLevel;
  return (
    <div className="w-full bg-[#0d121d] rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800 shadow-inner">
      <div
        className={`h-full transition-all duration-300 rounded-full ${
          maxed
            ? "bg-gradient-to-r from-amber-500 to-[#ffc800] shadow-[0_0_8px_rgba(255,200,0,0.6)]"
            : "bg-gradient-to-r from-blue-600 to-cyan-400"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Group({
  title,
  items,
  kind,
  village = "home",
  renderExtra,
  badge,
  reference,
}) {
  if (!items || items.length === 0) return null;
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
        {reference && (
          <a
            href={reference}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cyan-300 hover:underline">
            Resource reference
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const maxed = item.level >= item.maxLevel;
          return (
            <div
              key={item.name}
              className="bg-[#182030] border-2 border-slate-700/50 rounded-xl p-3 flex flex-col justify-between hover:border-slate-500/80 transition-colors shadow-md">
              <div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <ItemIcon
                      kind={kind}
                      name={item.name}
                      village={village}
                      className="w-6 h-6 shrink-0 object-contain drop-shadow"
                    />
                    <span
                      className="min-w-0 truncate text-xs sm:text-sm text-slate-100 font-semibold"
                      title={item.name}>
                      {item.name}
                    </span>
                  </span>
                  <span
                    className={`font-clash text-sm sm:text-lg shrink-0 whitespace-nowrap ${
                      maxed ? "text-[#ffc800]" : "text-slate-300"
                    }`}>
                    {item.level}
                    <span className="text-slate-500 text-[10px] sm:text-xs font-sans">
                      /{item.maxLevel}
                    </span>
                  </span>
                </div>
                <ProgressBar level={item.level} maxLevel={item.maxLevel} />
              </div>
              {renderExtra?.(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EquipmentCard({ equipment }) {
  const maxed = equipment.level >= equipment.maxLevel;
  return (
    <div className="bg-[#182030] border-2 border-slate-700/50 rounded-xl p-3 flex flex-col justify-between hover:border-slate-500/80 transition-colors shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 min-w-0">
            <ItemIcon
              kind="equipment"
              name={equipment.name}
              className="w-6 h-6 shrink-0 object-contain drop-shadow"
            />
            <span className="text-slate-100 text-sm font-semibold truncate">
              {equipment.name}
            </span>
          </span>
          <span
            className={`font-clash text-lg shrink-0 ${
              maxed ? "text-fuchsia-400" : "text-slate-300"
            }`}>
            {equipment.level}
            <span className="text-slate-500 text-xs font-sans">
              /{equipment.maxLevel}
            </span>
          </span>
        </div>
        <ProgressBar level={equipment.level} maxLevel={equipment.maxLevel} />
      </div>
    </div>
  );
}

function HeroEquipmentGroups({ equipment }) {
  if (!equipment.length) return null;

  const groupedEquipment = Object.entries(HERO_EQUIPMENT)
    .map(([hero, names]) => ({
      hero,
      equipment: equipment.filter((item) => names.includes(item.name)),
    }))
    .filter((group) => group.equipment.length > 0);
  const assignedEquipment = new Set(
    groupedEquipment.flatMap((group) => group.equipment),
  );
  const unassignedEquipment = equipment.filter(
    (item) => !assignedEquipment.has(item),
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-clash text-xl text-[#ffc800] uppercase tracking-wide drop-shadow-sm">
            Hero Equipment
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 mt-1">
            <span>Grouped by the hero that can use each item.</span>
            <a
              href="https://clashofclans.fandom.com/wiki/Hero_Equipment"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 hover:underline">
              Equipment reference
            </a>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
          {equipment.length}
        </span>
      </div>
      <div className="space-y-6">
        {groupedEquipment.map((group) => (
          <section key={group.hero}>
            <div className="flex items-center gap-2 mb-3">
              <ItemIcon
                kind="hero"
                name={group.hero}
                className="w-6 h-6 object-contain"
              />
              <h4 className="font-clash text-lg text-slate-200">
                {group.hero}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                {group.equipment.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {group.equipment.map((item) => (
                <EquipmentCard key={item.name} equipment={item} />
              ))}
            </div>
          </section>
        ))}
        {unassignedEquipment.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-clash text-lg text-slate-200">
                Other Equipment
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                {unassignedEquipment.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              The hero for these items is not in the current equipment map.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {unassignedEquipment.map((item) => (
                <EquipmentCard key={item.name} equipment={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function PlayerTroops({ player }) {
  const homeHeroes = player.heroes?.filter((h) => h.village === "home") || [];
  const builderHeroes =
    player.heroes?.filter((h) => h.village === "builderBase") || [];

  const allHomeTroops =
    player.troops?.filter((t) => t.village === "home" && !isSuperTroop(t)) ||
    [];
  const builderTroops =
    player.troops?.filter(
      (t) => t.village === "builderBase" && !isSuperTroop(t),
    ) || [];
  const spells = player.spells?.filter((s) => s.village === "home") || [];
  const heroEquipment = player.heroEquipment || [];

  // Categorize home village troops into distinct groups
  const pets = allHomeTroops.filter((t) => PET_NAMES.has(t.name));
  const siegeMachines = allHomeTroops.filter((t) => SIEGE_NAMES.has(t.name));
  const standardTroops = allHomeTroops.filter(
    (t) => !PET_NAMES.has(t.name) && !SIEGE_NAMES.has(t.name),
  );
  const elixirTroops = standardTroops.filter((t) =>
    ELIXIR_TROOP_NAMES.has(t.name),
  );
  const darkElixirTroops = standardTroops.filter((t) =>
    DARK_ELIXIR_TROOP_NAMES.has(t.name),
  );
  const otherTroops = standardTroops.filter(
    (t) =>
      !ELIXIR_TROOP_NAMES.has(t.name) &&
      !DARK_ELIXIR_TROOP_NAMES.has(t.name),
  );

  const hasAnything =
    homeHeroes.length ||
    builderHeroes.length ||
    allHomeTroops.length ||
    builderTroops.length ||
    spells.length ||
    heroEquipment.length;

  if (!hasAnything) return null;

  return (
    <div className="space-y-8">
      {/* Heroes */}
      <Group
        title="Heroes"
        items={homeHeroes}
        kind="hero"
        village="home"
      />

      {/* Hero Pets */}
      <Group
        title="Hero Pets"
        items={pets}
        kind="pet"
        village="home"
        badge={pets.length}
      />

      {/* Home Village Troops */}
      <Group
        title="Elixir Troops"
        items={elixirTroops}
        kind="troop"
        village="home"
        badge={elixirTroops.length}
        reference="https://clashofclans.fandom.com/wiki/Elixir_Troops"
      />
      <Group
        title="Dark Elixir Troops"
        items={darkElixirTroops}
        kind="troop"
        village="home"
        badge={darkElixirTroops.length}
        reference="https://clashofclans.fandom.com/wiki/Dark_Elixir_Troops"
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
      <Group title="Spells" items={spells} kind="spell" village="home" />

      <HeroEquipmentGroups equipment={heroEquipment} />
    </div>
  );
}
