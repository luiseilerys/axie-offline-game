const SAVE_KEY = 'axie_offline_save';

let state = {
  gold: 100,
  creatures: [],
  selectedTeam: [],
  breedSelected: []
};

let battle = null;

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    gold: state.gold,
    creatures: state.creatures
  }));
  updateGold();
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      state.gold = data.gold || 100;
      state.creatures = data.creatures || [];
      return true;
    } catch (e) {}
  }
  return false;
}

function newGame() {
  state.gold = 100;
  state.creatures = [
    createCreature('wolf', 1),
    createCreature('planty', 1),
    createCreature('gecko', 1)
  ];
  saveGame();
  showScreen('home');
  updateGold();
}

function updateGold() {
  document.getElementById('gold-display').textContent = state.gold;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  if (id === 'collection') renderCollection();
  if (id === 'breed') renderBreed();
  if (id === 'home') {
    document.getElementById('btn-continue').style.display = state.creatures.length ? 'block' : 'none';
  }
}

function renderCollection() {
  const list = document.getElementById('collection-list');
  list.innerHTML = '';
  state.creatures.forEach(c => {
    const cls = CLASSES[c.class] || { emoji: '❓' };
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <span class="emoji">${cls.emoji}</span>
      <div class="name">${c.name}</div>
      <div class="class">${c.class} · Nv.${c.level}</div>
      <div class="stats">❤️${c.stats.maxHp} ⚔️${c.stats.atk} 🛡️${c.stats.def} ⚡${c.stats.spd}</div>
    `;
    div.onclick = () => showDetail(c);
    list.appendChild(div);
  });
}

function showDetail(c) {
  const cls = CLASSES[c.class] || { emoji: '❓' };
  const content = document.getElementById('detail-content');
  content.innerHTML = `
    <div class="emoji">${cls.emoji}</div>
    <h2>${c.name}</h2>
    <p>${c.class} · Nivel ${c.level}</p>
    <div class="stat-row"><span>Vida</span><span>${c.stats.maxHp}</span></div>
    <div class="stat-row"><span>Ataque</span><span>${c.stats.atk}</span></div>
    <div class="stat-row"><span>Defensa</span><span>${c.stats.def}</span></div>
    <div class="stat-row"><span>Velocidad</span><span>${c.stats.spd}</span></div>
    <h3 style="margin-top:16px">Habilidades</h3>
    ${c.skills.map(s => {
      const sk = SKILLS[s];
      return `<div class="stat-row"><span>${sk.name} (${sk.cost}⚡)</span><span>${sk.desc}</span></div>`;
    }).join('')}
  `;
  showScreen('detail');
}

function renderBreed() {
  state.breedSelected = [];
  document.getElementById('btn-do-breed').disabled = true;
  document.getElementById('breed-result').innerHTML = '';
  const list = document.getElementById('breed-list');
  list.innerHTML = '';
  state.creatures.forEach(c => {
    const cls = CLASSES[c.class] || { emoji: '❓' };
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.uid = c.uid;
    div.innerHTML = `
      <span class="emoji">${cls.emoji}</span>
      <div class="name">${c.name}</div>
      <div class="class">${c.class} · Nv.${c.level}</div>
    `;
    div.onclick = () => toggleBreed(div, c);
    list.appendChild(div);
  });
}

function toggleBreed(div, c) {
  const idx = state.breedSelected.findIndex(x => x.uid === c.uid);
  if (idx >= 0) {
    state.breedSelected.splice(idx, 1);
    div.classList.remove('selected');
  } else if (state.breedSelected.length < 2) {
    state.breedSelected.push(c);
    div.classList.add('selected');
  }
  document.getElementById('btn-do-breed').disabled = state.breedSelected.length !== 2 || state.gold < 50;
}

function doBreed() {
  if (state.breedSelected.length !== 2 || state.gold < 50) return;
  state.gold -= 50;
  const child = breedCreatures(state.breedSelected[0], state.breedSelected[1]);
  state.creatures.push(child);
  saveGame();
  const cls = CLASSES[child.class] || { emoji: '❓' };
  document.getElementById('breed-result').innerHTML = `
    <p>¡Nació una nueva criatura!</p>
    <div class="card" style="margin:12px auto;max-width:160px">
      <span class="emoji">${cls.emoji}</span>
      <div class="name">${child.name}</div>
      <div class="class">${child.class} · Nv.${child.level}</div>
      <div class="stats">❤️${child.stats.maxHp} ⚔️${child.stats.atk} 🛡️${child.stats.def} ⚡${child.stats.spd}</div>
    </div>
  `;
  state.breedSelected = [];
  document.querySelectorAll('#breed-list .card').forEach(c => c.classList.remove('selected'));
  document.getElementById('btn-do-breed').disabled = true;
  updateGold();
}

// ===== BATALLA =====
function setupBattle(mode) {
  state.selectedTeam = [];
  const max = mode === '1v1' ? 1 : 3;
  const list = document.getElementById('team-list');
  list.innerHTML = '';
  document.getElementById('team-select').style.display = 'block';
  document.getElementById('btn-start-battle').disabled = true;
  document.getElementById('btn-start-battle').dataset.mode = mode;

  state.creatures.forEach(c => {
    const cls = CLASSES[c.class] || { emoji: '❓' };
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.uid = c.uid;
    div.innerHTML = `
      <span class="emoji">${cls.emoji}</span>
      <div class="name">${c.name}</div>
      <div class="class">Nv.${c.level}</div>
    `;
    div.onclick = () => {
      const idx = state.selectedTeam.findIndex(x => x.uid === c.uid);
      if (idx >= 0) {
        state.selectedTeam.splice(idx, 1);
        div.classList.remove('selected');
      } else if (state.selectedTeam.length < max) {
        state.selectedTeam.push(c);
        div.classList.add('selected');
      }
      document.getElementById('btn-start-battle').disabled = state.selectedTeam.length !== max;
    };
    list.appendChild(div);
  });
}

function startBattle() {
  const mode = document.getElementById('btn-start-battle').dataset.mode;
  const count = mode === '1v1' ? 1 : 3;
  const playerTeam = state.selectedTeam.map(c => ({
    ...JSON.parse(JSON.stringify(c)),
    currentHp: c.stats.maxHp,
    buffDef: 0,
    buffSpd: 0,
    dot: 0,
    isPlayer: true
  }));

  const enemyTeam = [];
  for (let i = 0; i < count; i++) {
    const sp = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const lvl = Math.max(1, Math.floor(Math.random() * 3) + 1);
    const e = createCreature(sp.id, lvl);
    enemyTeam.push({
      ...e,
      currentHp: e.stats.maxHp,
      buffDef: 0,
      buffSpd: 0,
      dot: 0,
      isPlayer: false
    });
  }

  battle = {
    player: playerTeam,
    enemy: enemyTeam,
    turn: 'player',
    energy: 3,
    maxEnergy: 3,
    activeIdx: 0,
    log: []
  };

  showScreen('battle');
  renderBattle();
  logMsg('¡La batalla comienza!');
}

function logMsg(msg) {
  battle.log.push(msg);
  const el = document.getElementById('battle-log');
  el.innerHTML = battle.log.slice(-6).map(m => `<div>${m}</div>`).join('');
  el.scrollTop = el.scrollHeight;
}

function renderBattle() {
  const renderSide = (team, containerId) => {
    const cont = document.getElementById(containerId);
    cont.innerHTML = '';
    team.forEach((u, i) => {
      const cls = CLASSES[u.class] || { emoji: '❓' };
      const pct = Math.max(0, (u.currentHp / u.stats.maxHp) * 100);
      const div = document.createElement('div');
      div.className = 'battle-unit' + (u.currentHp <= 0 ? ' dead' : '') +
        (battle.turn === 'player' && u.isPlayer && i === battle.activeIdx ? ' active' : '');
      div.innerHTML = `
        <div>${cls.emoji}</div>
        <div style="font-size:0.75rem">${u.name}</div>
        <div class="hp-bar"><div class="hp-fill" style="width:${pct}%"></div></div>
        <div style="font-size:0.65rem">${Math.max(0, u.currentHp)}/${u.stats.maxHp}</div>
      `;
      cont.appendChild(div);
    });
  };
  renderSide(battle.enemy, 'enemy-side');
  renderSide(battle.player, 'player-side');

  document.getElementById('energy').textContent = battle.energy;

  const skillsDiv = document.getElementById('skill-buttons');
  skillsDiv.innerHTML = '';
  if (battle.turn === 'player') {
    const active = battle.player[battle.activeIdx];
    if (active && active.currentHp > 0) {
      active.skills.forEach(sid => {
        const sk = SKILLS[sid];
        const btn = document.createElement('button');
        btn.className = 'skill-btn';
        btn.textContent = `${sk.name} (${sk.cost}⚡)`;
        btn.disabled = battle.energy < sk.cost;
        btn.onclick = () => useSkill(sid);
        skillsDiv.appendChild(btn);
      });
    }
  }
}

function useSkill(skillId) {
  if (battle.turn !== 'player') return;
  const sk = SKILLS[skillId];
  if (battle.energy < sk.cost) return;
  const active = battle.player[battle.activeIdx];
  if (!active || active.currentHp <= 0) return;

  battle.energy -= sk.cost;
  const targets = battle.enemy.filter(e => e.currentHp > 0);
  if (!targets.length && sk.type === 'attack') return;

  applySkill(active, sk, targets);
  renderBattle();

  if (checkBattleEnd()) return;

  // Auto next unit if energy left, else end turn
  if (battle.energy <= 0) {
    endPlayerTurn();
  }
}

function applySkill(user, sk, targets) {
  if (sk.type === 'attack' || sk.type === 'dot') {
    const target = targets[Math.floor(Math.random() * targets.length)];
    if (!target) return;
    const def = target.stats.def + (target.buffDef || 0);
    let dmg = Math.max(1, Math.round(user.stats.atk * sk.power - def * 0.5));
    target.currentHp -= dmg;
    logMsg(`${user.name} usa ${sk.name} → ${target.name} (-${dmg})`);
    if (sk.type === 'dot') {
      target.dot = (target.dot || 0) + Math.round(dmg * 0.3);
    }
  } else if (sk.type === 'heal') {
    const heal = Math.round(user.stats.maxHp * sk.power);
    user.currentHp = Math.min(user.stats.maxHp, user.currentHp + heal);
    logMsg(`${user.name} se cura +${heal}`);
  } else if (sk.type === 'buff') {
    user.buffDef = (user.buffDef || 0) + Math.round(user.stats.def * sk.power);
    logMsg(`${user.name} aumenta defensa`);
  } else if (sk.type === 'buff_spd') {
    user.buffSpd = (user.buffSpd || 0) + Math.round(user.stats.spd * sk.power);
    logMsg(`${user.name} aumenta velocidad`);
  }
}

function endPlayerTurn() {
  battle.turn = 'enemy';
  document.getElementById('btn-end-turn').disabled = true;
  setTimeout(enemyTurn, 600);
}

function enemyTurn() {
  const alive = battle.enemy.filter(e => e.currentHp > 0);
  alive.forEach(e => {
    if (e.dot > 0) {
      e.currentHp -= e.dot;
      logMsg(`${e.name} sufre veneno (-${e.dot})`);
      e.dot = Math.floor(e.dot * 0.5);
    }
  });

  const playerAlive = battle.player.filter(p => p.currentHp > 0);
  if (!playerAlive.length) {
    checkBattleEnd();
    return;
  }

  alive.forEach(e => {
    if (e.currentHp <= 0) return;
    const skId = e.skills[Math.floor(Math.random() * e.skills.length)];
    const sk = SKILLS[skId];
    applySkill(e, sk, playerAlive);
  });

  renderBattle();
  if (checkBattleEnd()) return;

  // Player turn again
  battle.turn = 'player';
  battle.energy = battle.maxEnergy;
  // Apply DoT to player
  battle.player.forEach(p => {
    if (p.dot > 0 && p.currentHp > 0) {
      p.currentHp -= p.dot;
      logMsg(`${p.name} sufre veneno (-${p.dot})`);
      p.dot = Math.floor(p.dot * 0.5);
    }
  });
  // Find next alive unit
  let next = battle.activeIdx;
  for (let i = 0; i < battle.player.length; i++) {
    next = (battle.activeIdx + i) % battle.player.length;
    if (battle.player[next].currentHp > 0) break;
  }
  battle.activeIdx = next;
  document.getElementById('btn-end-turn').disabled = false;
  renderBattle();
  logMsg('Tu turno');
}

function checkBattleEnd() {
  const pAlive = battle.player.some(p => p.currentHp > 0);
  const eAlive = battle.enemy.some(e => e.currentHp > 0);
  if (!eAlive) {
    const reward = 30 + battle.enemy.length * 20;
    state.gold += reward;
    // Level up random
    state.selectedTeam.forEach(c => {
      const real = state.creatures.find(x => x.uid === c.uid);
      if (real && Math.random() > 0.4) {
        real.level++;
        const mult = 1.1;
        real.stats.maxHp = Math.round(real.stats.maxHp * mult);
        real.stats.hp = real.stats.maxHp;
        real.stats.atk = Math.round(real.stats.atk * mult);
        real.stats.def = Math.round(real.stats.def * mult);
        real.stats.spd = Math.round(real.stats.spd * mult);
      }
    });
    saveGame();
    logMsg(`¡Victoria! +${reward} 💰`);
    setTimeout(() => {
      alert('¡Victoria! Oro ganado: ' + reward);
      showScreen('home');
    }, 1200);
    return true;
  }
  if (!pAlive) {
    logMsg('Derrota...');
    setTimeout(() => {
      alert('Has perdido...');
      showScreen('home');
    }, 1200);
    return true;
  }
  return false;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const hasSave = loadGame();
  updateGold();
  if (hasSave && state.creatures.length) {
    document.getElementById('btn-continue').style.display = 'block';
  }

  document.getElementById('btn-new-game').onclick = () => {
    if (confirm('¿Empezar nueva partida? Se perderá el progreso actual.')) newGame();
  };
  document.getElementById('btn-continue').onclick = () => showScreen('home');
  document.getElementById('btn-collection').onclick = () => showScreen('collection');
  document.getElementById('btn-battle').onclick = () => {
    if (!state.creatures.length) { alert('Primero crea una partida'); return; }
    showScreen('battle-setup');
    document.getElementById('team-select').style.display = 'none';
  };
  document.getElementById('btn-breed').onclick = () => {
    if (state.creatures.length < 2) { alert('Necesitas al menos 2 criaturas'); return; }
    showScreen('breed');
  };
  document.getElementById('btn-1v1').onclick = () => setupBattle('1v1');
  document.getElementById('btn-3v3').onclick = () => setupBattle('3v3');
  document.getElementById('btn-start-battle').onclick = startBattle;
  document.getElementById('btn-end-turn').onclick = endPlayerTurn;
  document.getElementById('btn-do-breed').onclick = doBreed;

  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.onclick = () => showScreen(btn.dataset.back);
  });

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});