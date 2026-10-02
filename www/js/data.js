const CLASSES = {
  Bestia: { emoji: '🦁', color: '#f59e0b' },
  Planta: { emoji: '🌿', color: '#22c55e' },
  Reptil: { emoji: '🦎', color: '#10b981' },
  Acuatico: { emoji: '🐟', color: '#3b82f6' },
  Pajaro: { emoji: '🐦', color: '#8b5cf6' },
  Bicho: { emoji: '🐛', color: '#a3e635' }
};

const SKILLS = {
  mordida: { name: 'Mordida', cost: 1, power: 1.0, type: 'attack', desc: 'Ataque básico' },
  embestida: { name: 'Embestida', cost: 2, power: 1.5, type: 'attack', desc: 'Golpe fuerte' },
  curar: { name: 'Curar', cost: 2, power: 0.3, type: 'heal', desc: 'Restaura vida' },
  escudo: { name: 'Escudo', cost: 1, power: 0.2, type: 'buff', desc: 'Aumenta defensa' },
  veneno: { name: 'Veneno', cost: 2, power: 0.8, type: 'dot', desc: 'Daño por turno' },
  rapidez: { name: 'Rapidez', cost: 1, power: 0.15, type: 'buff_spd', desc: 'Aumenta velocidad' },
  tsunami: { name: 'Tsunami', cost: 3, power: 2.0, type: 'attack', desc: 'Ataque devastador' },
  picotazo: { name: 'Picotazo', cost: 1, power: 1.1, type: 'attack', desc: 'Ataque rápido' }
};

const SPECIES = [
  { id: 'wolf', name: 'Lobo', class: 'Bestia', base: { hp: 40, atk: 12, def: 6, spd: 10 }, skills: ['mordida', 'embestida', 'rapidez'] },
  { id: 'planty', name: 'Planty', class: 'Planta', base: { hp: 50, atk: 7, def: 10, spd: 6 }, skills: ['curar', 'escudo', 'mordida'] },
  { id: 'gecko', name: 'Gecko', class: 'Reptil', base: { hp: 35, atk: 10, def: 8, spd: 12 }, skills: ['veneno', 'mordida', 'rapidez'] },
  { id: 'fishy', name: 'Fishy', class: 'Acuatico', base: { hp: 45, atk: 9, def: 7, spd: 9 }, skills: ['tsunami', 'curar', 'mordida'] },
  { id: 'sparrow', name: 'Sparrow', class: 'Pajaro', base: { hp: 30, atk: 11, def: 5, spd: 14 }, skills: ['picotazo', 'rapidez', 'embestida'] },
  { id: 'beetle', name: 'Beetle', class: 'Bicho', base: { hp: 55, atk: 8, def: 12, spd: 5 }, skills: ['escudo', 'mordida', 'veneno'] }
];

function createCreature(speciesId, level = 1, overrides = {}) {
  const sp = SPECIES.find(s => s.id === speciesId) || SPECIES[0];
  const mult = 1 + (level - 1) * 0.15;
  const stats = {
    hp: Math.round(sp.base.hp * mult),
    maxHp: Math.round(sp.base.hp * mult),
    atk: Math.round(sp.base.atk * mult),
    def: Math.round(sp.base.def * mult),
    spd: Math.round(sp.base.spd * mult)
  };
  return {
    uid: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    speciesId: sp.id,
    name: overrides.name || sp.name,
    class: sp.class,
    level,
    stats,
    skills: [...sp.skills],
    parents: overrides.parents || null
  };
}

function breedCreatures(a, b) {
  const classes = [a.class, b.class];
  const newClass = classes[Math.floor(Math.random() * 2)];
  const baseSpecies = SPECIES.filter(s => s.class === newClass);
  const sp = baseSpecies[Math.floor(Math.random() * baseSpecies.length)] || SPECIES[0];
  const avgLevel = Math.floor((a.level + b.level) / 2);
  const level = Math.max(1, avgLevel + (Math.random() > 0.5 ? 1 : 0));
  const stats = {
    hp: Math.round((a.stats.maxHp + b.stats.maxHp) / 2 * (0.9 + Math.random() * 0.2)),
    atk: Math.round((a.stats.atk + b.stats.atk) / 2 * (0.9 + Math.random() * 0.2)),
    def: Math.round((a.stats.def + b.stats.def) / 2 * (0.9 + Math.random() * 0.2)),
    spd: Math.round((a.stats.spd + b.stats.spd) / 2 * (0.9 + Math.random() * 0.2))
  };
  stats.maxHp = stats.hp;
  const skillPool = [...new Set([...a.skills, ...b.skills])];
  const skills = [];
  while (skills.length < 3 && skillPool.length) {
    const idx = Math.floor(Math.random() * skillPool.length);
    skills.push(skillPool.splice(idx, 1)[0]);
  }
  return {
    uid: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    speciesId: sp.id,
    name: sp.name + ' Jr',
    class: newClass,
    level,
    stats,
    skills,
    parents: [a.uid, b.uid]
  };
}