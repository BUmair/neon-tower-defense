(function () {
'use strict';

/* ==================== CONFIG ==================== */
const CFG = {
  W: 800,
  H: 500,
  DT_MAX: 0.05,
  START_MONEY: 500,
  START_LIVES: 20,
  SPEEDS: [1, 2, 4],
  PATH_HALF: 22,
  TOWER_R: 16,
  TOWER_GAP: 26,
  PYLON_R: 14,
  PYLON_CD: 30,
  SHOCK_R: 110,
  STUN_T: 1.5,
  SLOW_T: 2,
  SLOW_MULT: 0.6,
  SELL_RATE: 0.7,
  SPEED_CAP: 0.4,
  SPEED_PER_WAVE: 0.02,
  HP_GROWTH: 1.10,
  EVENT_MIN_WAVE: 3,
  EVENT_CHANCE: 0.35,
  EVENT_TIME: 3.2,
  AUTO_DELAY: 2.5,
  MAX_PARTICLES: 500,
  MAX_TEXTS: 40,
  THEME: 'meadow',
  PATH_PTS: [
    [-20, 80], [680, 80], [680, 160], [120, 160], [120, 240],
    [680, 240], [680, 320], [120, 320], [120, 400], [820, 400]
  ],
  PYLONS: [[50, 200], [750, 160], [50, 360], [750, 280]],
  ENEMY: {
    scout:    { name: 'Scout',    hp: 30,  speed: 130, reward: 8,  lives: 1, r: 7,  color: '#ff2d3d' },
    soldier:  { name: 'Soldier',  hp: 90,  speed: 75,  reward: 15, lives: 1, r: 10, color: '#1aa0ff' },
    tank:     { name: 'Tank',     hp: 200, speed: 62,  reward: 20, lives: 1, r: 13, color: '#2fb38a' },
    armored:  { name: 'Armored',  hp: 150, speed: 58,  reward: 22, lives: 1, r: 12, color: '#c2185b', armor: 0.35 },
    boss:     { name: 'Boss',     hp: 1500, speed: 30, reward: 150, lives: 5, r: 26, color: '#ff3d7f' },
    behemoth: { name: 'Behemoth', hp: 420, speed: 40,  reward: 60, lives: 2, r: 18, color: '#7b8594' },
    swarm:    { name: 'Swarm',    hp: 22,  speed: 175, reward: 4,  lives: 1, r: 5,  color: '#ffb020' },
    shielded: { name: 'Shielded', hp: 120, speed: 55,  reward: 18, lives: 1, r: 11, color: '#8e44ff', shield: 0.6 }
  },
  TOWER: {
    pulse:  { name: 'Pulse Laser',   cost: 100, range: 110, rate: 4,   dmg: 10, color: '#2ea8ff',
              tag: 'Fast, single target',
              desc: 'Very fast single-target laser. Tier 3 lets you pick a path.' },
    plasma: { name: 'Plasma Cannon', cost: 250, range: 130, rate: 0.8, dmg: 70, splash: 54, color: '#ff7a2f',
              tag: 'Slow, splash damage',
              desc: 'Slow shells that explode with splash damage.' },
    stasis: { name: 'Stasis Beam',   cost: 175, range: 120, rate: 1.5, dmg: 9,  color: '#b07cff',
              tag: 'Slows enemies',
              desc: 'Weak beam that slows targets to 60% speed.' },
    sniper: { name: 'Sniper Monkey', cost: 240, range: 250, rate: 0.5, dmg: 140, color: '#7bd64a',
              tag: 'Long range, big hits',
              desc: 'Slow rifle with huge range. Hits the foe furthest along the path.' },
    tack:   { name: 'Tack Shooter', cost: 210, range: 95, rate: 1.6, dmg: 9, color: '#e8e8f0',
              tag: 'Short range, hits many',
              desc: 'Flings tacks at up to 6 nearby foes at once.' }
  }
};

const EVENTS = [
  { id: 'solar', name: 'Solar Flare', desc: 'Laser towers gain +50% attack speed' },
  { id: 'emp', name: 'EMP Glitch', desc: 'Tower costs -20%, all tower range -15%' },
  { id: 'rush', name: 'Scout Rush', desc: 'Enemies move 30% faster with 40% less HP' }
];

// Tier 3 specialisations. Each tower picks A or B when it reaches Tier 3.
const PATHS = {
  pulse: {
    A: { name: 'Multi-shot', desc: 'Hits up to 3 foes at once.', targets: 3 },
    B: { name: 'Overcharge', desc: 'Fires 60% faster.', rate: 1.6 }
  },
  plasma: {
    A: { name: 'Cluster', desc: 'Splash radius x1.7.', splash: 1.7 },
    B: { name: 'Heavy', desc: 'Shells hit 50% harder.', dmg: 1.5 }
  },
  stasis: {
    A: { name: 'Deep Freeze', desc: 'Slows to 30% speed for 3s.', slowMult: 0.3, slowT: 3 },
    B: { name: 'Chain Chill', desc: 'Also chills the next foe.', chain: true }
  },
  sniper: {
    A: { name: 'Armor Piercing', desc: 'Ignores armor.', pierce: true },
    B: { name: 'Rapid Bolt', desc: 'Fires 40% faster.', rate: 1.4 }
  },
  tack: {
    A: { name: 'Razor', desc: 'Double damage tacks.', dmg: 2 },
    B: { name: 'Spread', desc: 'Range x1.35, hits up to 9 foes.', range: 1.35, targets: 9 }
  }
};

const MAPS = [
  { name: 'Meadow', theme: 'meadow',
    path: [[-20, 80], [680, 80], [680, 160], [120, 160], [120, 240], [680, 240], [680, 320], [120, 320], [120, 400], [820, 400]],
    pylons: [[50, 200], [750, 160], [50, 360], [750, 280]],
    entry: [70, 38], exit: [745, 352] },
  { name: 'Canyon', theme: 'desert',
    path: [[-20, 140], [300, 140], [300, 300], [90, 300], [90, 440], [560, 440], [560, 60], [820, 60]],
    pylons: [[200, 60], [420, 240], [660, 200], [700, 360]],
    entry: [60, 95], exit: [740, 108] },
  { name: 'Glacier', theme: 'snow',
    path: [[-20, 300], [220, 300], [220, 120], [460, 120], [460, 380], [740, 380], [740, 200], [820, 200]],
    pylons: [[120, 200], [380, 260], [600, 120], [600, 300]],
    entry: [60, 250], exit: [760, 150] }
];

const FONT = '"Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif';
const TAU = Math.PI * 2;

/* ==================== AUDIO (Web Audio, no files) ==================== */
const SFX = { ctx: null, on: true, last: {} };

function unlockAudio() {
  try {
    if (!SFX.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) SFX.ctx = new AC();
    }
    if (SFX.ctx && SFX.ctx.state === 'suspended') SFX.ctx.resume();
  } catch (e) {
    SFX.ctx = null;
  }
}

function tone(freq, dur, type, vol, slideTo, delay) {
  const a = SFX.ctx;
  if (!a || !SFX.on || a.state !== 'running') return;
  const t0 = a.currentTime + (delay || 0);
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

const SOUNDS = {
  shoot:   function () { tone(880, 0.08, 'square', 0.03, 440); },
  plasma:  function () { tone(160, 0.25, 'sawtooth', 0.05, 60); },
  stasis:  function () { tone(300, 0.2, 'sine', 0.05, 900); },
  kill:    function () { tone(520, 0.06, 'triangle', 0.05, 1040); },
  leak:    function () { tone(140, 0.4, 'sawtooth', 0.07, 50); },
  pylon:   function () { tone(90, 0.5, 'sine', 0.2, 30); },
  build:   function () { tone(440, 0.1, 'triangle', 0.06, 660); },
  upgrade: function () { tone(523, 0.1, 'triangle', 0.06, null, 0); tone(784, 0.15, 'triangle', 0.06, null, 0.09); },
  wave:    function () { tone(330, 0.15, 'square', 0.04, null, 0); tone(440, 0.15, 'square', 0.04, null, 0.12); },
  clear:   function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.18, 'triangle', 0.06, null, i * 0.1); }); },
  event:   function () { tone(200, 0.6, 'sawtooth', 0.05, 1200); },
  over:    function () { tone(300, 0.8, 'sawtooth', 0.07, 40); },
  deny:    function () { tone(180, 0.12, 'square', 0.04, 120); },
  click:   function () { tone(660, 0.03, 'square', 0.02); },
  snipe:   function () { tone(1400, 0.12, 'square', 0.04, 260); tone(90, 0.1, 'sine', 0.06, 40, 0.01); },
  pop:     function () { tone(600, 0.07, 'square', 0.05, 1500); tone(900, 0.05, 'triangle', 0.04, 1800, 0.02); },
  tier3:   function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, 'triangle', 0.06, null, i * 0.07); }); }
};

function sfx(name) {
  if (!SFX.on || !SOUNDS[name]) return;
  const now = performance.now();
  if (SFX.last[name] && now - SFX.last[name] < 45) return;
  SFX.last[name] = now;
  SOUNDS[name]();
}

/* ==================== BEST WAVE (saved per browser) ==================== */
const BEST_KEY = 'neonTD.bestWave';

function loadBest() {
  try {
    return parseInt(window.localStorage.getItem(BEST_KEY), 10) || 0;
  } catch (e) {
    return 0;
  }
}

function saveBest(w) {
  try {
    window.localStorage.setItem(BEST_KEY, String(w));
  } catch (e) {
    /* storage unavailable: best wave just won't persist */
  }
}

let best = loadBest();

const PREF_KEY = 'neonTD.prefs';
function loadPrefs() {
  try {
    return JSON.parse(window.localStorage.getItem(PREF_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function savePrefs(p) {
  try {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch (e) {
    /* storage unavailable: preferences just won't persist */
  }
}
const prefs = loadPrefs();
SFX.on = prefs.sfx !== false;

/* ==================== STATE ==================== */
const mouse = { x: -100, y: -100, inside: false };

function newState() {
  return {
    money: CFG.START_MONEY,
    lives: CFG.START_LIVES,
    wave: 0,
    waveActive: false,
    toSpawn: 0,
    spawnTimer: 0,
    spawnInterval: 1,
    auto: false,
    autoTimer: 0,
    speedIdx: 0,
    speed: 1,
    event: null,
    eventTimer: 0,
    enemies: [],
    towers: [],
    shots: [],
    lasers: [],
    darts: [],
    sold: [],
    pops: [],
    shake: 0,
    banner: null,
    rings: [],
    shocks: [],
    particles: [],
    texts: [],
    pylons: CFG.PYLONS.map(function (p) { return { x: p[0], y: p[1], cd: 0 }; }),
    selectedId: null,
    placing: null,
    over: false,
    paused: false,
    time: 0,
    nextId: 1,
    kills: 0,
    waveEarned: 0,
    waveKills: 0,
    waveLost: 0,
    bossNext: false,
    rand: Math.random,
    dealt: {},
    popsBy: {},
    daily: false
  };
}

let S = newState();

/* ==================== PATH ==================== */
const PATH = { segs: [], total: 0 };

function buildPath() {
  let acc = 0;
  for (let i = 0; i < CFG.PATH_PTS.length - 1; i++) {
    const a = CFG.PATH_PTS[i];
    const b = CFG.PATH_PTS[i + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    PATH.segs.push({
      ax: a[0], ay: a[1], bx: b[0], by: b[1],
      len: len, start: acc, ang: Math.atan2(b[1] - a[1], b[0] - a[0])
    });
    acc += len;
  }
  PATH.total = acc;
}

function posAt(d) {
  if (d < 0) d = 0;
  if (d > PATH.total) d = PATH.total;
  const segs = PATH.segs;
  let s = segs[segs.length - 1];
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i].start + segs[i].len) { s = segs[i]; break; }
  }
  const t = (d - s.start) / s.len;
  return { x: s.ax + (s.bx - s.ax) * t, y: s.ay + (s.by - s.ay) * t, ang: s.ang };
}

function distToPath(px, py) {
  let best = Infinity;
  for (const s of PATH.segs) {
    const dx = s.bx - s.ax;
    const dy = s.by - s.ay;
    let t = ((px - s.ax) * dx + (py - s.ay) * dy) / (s.len * s.len);
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(px - (s.ax + dx * t), py - (s.ay + dy * t));
    if (d < best) best = d;
  }
  return best;
}

/* ==================== HELPERS ==================== */
function angDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

function evId() {
  return S.event ? S.event.id : null;
}

function towerCost(type) {
  return Math.floor(CFG.TOWER[type].cost * (evId() === 'emp' ? 0.8 : 1));
}

function upgradeCost(t) {
  return Math.floor(CFG.TOWER[t.type].cost * 0.75 * (t.tier + 1));
}

function towerStats(t) {
  const d = CFG.TOWER[t.type];
  const id = evId();
  const pm = (t.path && PATHS[t.type] && PATHS[t.type][t.path]) || {};
  let range = d.range * (1 + 0.1 * t.tier) * (pm.range || 1);
  if (id === 'emp') range *= 0.85;
  let rate = d.rate * (1 + 0.25 * t.tier) * (pm.rate || 1);
  if (id === 'solar' && (t.type === 'pulse' || t.type === 'stasis')) rate *= 1.5;
  const dmg = d.dmg * (1 + 0.5 * t.tier) * (pm.dmg || 1);
  return {
    range: range,
    rate: rate,
    dmg: dmg,
    splash: (d.splash || 0) * (1 + 0.1 * t.tier) * (pm.splash || 1),
    targets: pm.targets || (t.type === 'tack' ? 6 : 1),
    slowMult: pm.slowMult || CFG.SLOW_MULT,
    slowT: pm.slowT || CFG.SLOW_T,
    chain: !!pm.chain,
    pierce: !!pm.pierce
  };
}

function selectedTower() {
  if (S.selectedId === null) return null;
  const t = S.towers.find(function (x) { return x.id === S.selectedId; });
  if (!t) S.selectedId = null;
  return t || null;
}

// Nearest tower under the pointer, so clicks still pick the right one when towers sit close together.
function towerAt(x, y) {
  let best = null;
  let bestD = 18;
  for (const t of S.towers) {
    const d = Math.hypot(t.x - x, t.y - y);
    if (d <= bestD) { best = t; bestD = d; }
  }
  return best;
}

function pylonAt(x, y) {
  for (const p of S.pylons) if (Math.hypot(p.x - x, p.y - y) <= 18) return p;
  return null;
}

function addText(x, y, text, color, life, size) {
  if (S.texts.length >= CFG.MAX_TEXTS) S.texts.shift();
  S.texts.push({ x: x, y: y, text: text, color: color, life: life, max: life, size: size || 13 });
}

function burst(x, y, color, n) {
  const room = CFG.MAX_PARTICLES - S.particles.length;
  const count = Math.min(n, room);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * TAU;
    const sp = 40 + Math.random() * 140;
    const life = 0.35 + Math.random() * 0.4;
    S.particles.push({
      x: x, y: y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: life, max: life,
      s: 1.5 + Math.random() * 2.5,
      color: color,
      rot: Math.random() * TAU,
      spin: (Math.random() * 2 - 1) * 12,
      shard: Math.random() < 0.6
    });
  }
}

/* ==================== ENTITIES ==================== */
function spawnChances(w) {
  const pBeh = w >= 5 ? Math.min(0.35, 0.05 + (w - 5) * 0.03) : 0;
  const pTank = w >= 4 ? Math.min(0.2, 0.04 + (w - 4) * 0.02) : 0;
  const pArm = w >= 6 ? Math.min(0.15, 0.03 + (w - 6) * 0.02) : 0;
  const pSwarm = w >= 7 ? Math.min(0.3, 0.1 + (w - 7) * 0.02) : 0;
  const pShield = w >= 8 ? Math.min(0.2, 0.04 + (w - 8) * 0.02) : 0;
  const pSol = Math.min(0.6, 0.35 + w * 0.02);
  return { pBeh: pBeh, pTank: pTank, pArm: pArm, pSwarm: pSwarm, pShield: pShield, pSol: pSol };
}

// Enemy HP: gentle growth for the first 5 waves, then steeper so later waves get hard.
function hpMult(w) {
  return Math.pow(CFG.HP_GROWTH, Math.min(w, 5)) * Math.pow(1.14, Math.max(0, w - 5));
}

function waveCount(w) {
  // Counts keep climbing; waves past 6 add two extra foes per wave.
  return 6 + w * 2 + Math.max(0, w - 6) * 2;
}

function spawnEnemy(forced) {
  const c = spawnChances(S.wave);
  const r = S.rand();
  let type = forced || 'scout';
  if (!forced) {
    const table = [['behemoth', c.pBeh], ['tank', c.pTank], ['armored', c.pArm], ['swarm', c.pSwarm], ['shielded', c.pShield], ['soldier', c.pSol]];
    let acc = 0;
    for (const row of table) {
      acc += row[1];
      if (r < acc) { type = row[0]; break; }
    }
  }
  const def = CFG.ENEMY[type];
  const rush = evId() === 'rush';
  const hp = def.hp * hpMult(S.wave) * (rush ? 0.6 : 1);
  const spd = (1 + Math.min(CFG.SPEED_CAP, CFG.SPEED_PER_WAVE * S.wave)) * (rush ? 1.3 : 1);
  const p = posAt(0);
  S.enemies.push({
    id: S.nextId++,
    type: type,
    name: def.name,
    hp: hp,
    maxHp: hp,
    base: def.speed * spd,
    dist: 0,
    x: p.x,
    y: p.y,
    ang: p.ang,
    r: def.r,
    color: def.color,
    reward: def.reward,
    lives: def.lives,
    armor: def.armor || 0,
    shield: def.shield ? hp * def.shield : 0,
    slowT: 0,
    slowTxtCd: 0,
    dmgCd: 0,
    squash: 0,
    stunT: 0,
    hitFlash: 0,
    dead: false
  });
}

function damage(e, amt, src, pierce) {
  if (e.dead) return;
  if (!pierce) amt *= 1 - (e.armor || 0);
  if (src) S.dealt[src.type] = (S.dealt[src.type] || 0) + Math.min(amt, e.hp + (e.shield || 0));
  if (e.shield > 0) {
    const soak = Math.min(e.shield, amt);
    e.shield -= soak;
    amt -= soak;
  }
  e.hitFlash = 1;
  e.squash = 1;
  if (amt <= 0) {
    burst(e.x, e.y, '#9fe3ff', 3);
    return;
  }
  e.hp -= amt;
  if (e.hp <= 0) {
    e.dead = true;
    if (src) S.popsBy[src.type] = (S.popsBy[src.type] || 0) + 1;
    S.money += e.reward;
    S.kills++;
    S.waveEarned += e.reward;
    S.waveKills++;
    sfx('pop');
    addText(e.x, e.y - 14, '+$' + e.reward, '#b35c00', 1.1, 14);
    addText(e.x, e.y - 34, 'POP!', '#ffffff', 0.5, 20);
    S.pops.push({ x: e.x, y: e.y, t: 0.45, max: 0.45, color: e.color });
    burst(e.x, e.y, e.color, 26);
    burst(e.x, e.y, '#ffffff', 8);
  } else {
    burst(e.x, e.y, e.color, 3);
    if ((e.dmgCd || 0) <= 0) {
      addText(e.x + (Math.random() * 12 - 6), e.y - 22, String(Math.round(amt)), '#ffffff', 0.7, 12);
      e.dmgCd = 0.2;
    }
  }
}

function applySlow(e, mult, dur) {
  burst(e.x, e.y, '#cdf6ff', 3);
  if (e.slowTxtCd <= 0) {
    addText(e.x, e.y - 14, 'Slowed', '#b07cff', 0.9, 12);
    e.slowTxtCd = 1.5;
  }
  e.slowT = dur || CFG.SLOW_T;
  e.slowMult = mult || CFG.SLOW_MULT;
}

function startWave(callEarly) {
  if (S.over || S.waveActive || S.paused) return;
  // Calling a wave during the auto-start countdown skips the wait for a small bonus.
  if (callEarly && S.auto && S.wave > 0 && S.autoTimer > 0) {
    const bonus = 5 + S.wave * 2;
    S.money += bonus;
    addText(CFG.W / 2, 130, 'Early call +$' + bonus, '#ffd54a', 1.4, 14);
  }
  S.autoTimer = 0;
  S.wave++;
  S.waveActive = true;
  S.bossNext = S.wave % 5 === 0;
  S.waveEarned = 0;
  S.waveKills = 0;
  S.waveLost = 0;
  S.banner = S.bossNext
    ? { text: 'BOSS WAVE ' + S.wave, t: 2.2, max: 2.2, color: '#ff6a9a' }
    : { text: 'WAVE ' + S.wave, t: 1.8, max: 1.8, color: '#ffe14d' };
  sfx('wave');
  S.toSpawn = waveCount(S.wave);
  if (S.bossNext) {
    // The boss leads the wave so the escort arrives behind it.
    spawnEnemy('boss');
    S.toSpawn--;
  }
  S.spawnTimer = S.bossNext ? 1.6 : 0.6;
  S.spawnInterval = Math.max(0.4, 1.1 - S.wave * 0.03);
  S.event = null;
  S.eventTimer = 0;
  if (S.wave >= CFG.EVENT_MIN_WAVE && S.rand() < CFG.EVENT_CHANCE) {
    S.event = EVENTS[Math.floor(S.rand() * EVENTS.length)];
    S.eventTimer = CFG.EVENT_TIME;
    sfx('event');
  }
}

function endWave() {
  S.waveActive = false;
  sfx('clear');
  S.banner = { text: 'WAVE CLEARED', t: 1.8, max: 1.8, color: '#6fe05a' };
  const bonus = 20 + S.wave * 4;
  const interest = Math.min(60, Math.floor(S.money * 0.05));
  S.money += bonus + interest;
  addText(CFG.W / 2, 215, 'Wave Cleared!', '#43c44b', 2.2, 24);
  addText(CFG.W / 2, 242, '+$' + bonus + ' bonus' + (interest ? ' · +$' + interest + ' interest' : ''), '#ffd54a', 1.8, 14);
  addText(CFG.W / 2, 264, S.waveKills + ' popped · $' + S.waveEarned + ' earned · ' +
    (S.waveLost ? '-' + S.waveLost + ' lives' : 'no leaks'), '#ffffff', 2.6, 13);
  S.event = null;
  S.eventTimer = 0;
  S.autoTimer = CFG.AUTO_DELAY;
}

// Post-run breakdown: damage and pops per tower, plus totals.
function renderStats() {
  const box = $('ovStats');
  box.innerHTML = '';
  const rows = Object.keys(CFG.TOWER).map(function (k) {
    return [CFG.TOWER[k].name, S.dealt[k] || 0, S.popsBy[k] || 0];
  });
  rows.push(['Overload pylons', S.dealt.pylon || 0, S.popsBy.pylon || 0]);
  rows.sort(function (a, b) { return b[1] - a[1]; });
  for (const r of rows) {
    const cell = document.createElement('div');
    const name = document.createElement('span');
    name.textContent = r[0] + ': ';
    const val = document.createElement('b');
    val.textContent = Math.round(r[1]).toLocaleString() + ' dmg · ' + r[2] + ' pops';
    cell.appendChild(name);
    cell.appendChild(val);
    box.appendChild(cell);
  }
  const tot = document.createElement('div');
  tot.className = 'tot';
  tot.textContent = 'Waves cleared: ' + (S.waveActive ? S.wave - 1 : S.wave) +
    ' · Lives lost: ' + (CFG.START_LIVES - S.lives) + ' · Total pops: ' + S.kills;
  box.appendChild(tot);
}

function gameOver() {
  S.over = true;
  S.placing = null;
  S.selectedId = null;
  if (S.wave > best) {
    best = S.wave;
    saveBest(best);
  }
  const top = recordScore();
  const isNew = top[0] && top[0].wave === S.wave && top[0].kills === S.kills;
  $('ovNew').textContent = isNew ? 'NEW HIGH SCORE!' : '';
  renderScores(top);
  el.ovWave.textContent = S.wave;
  el.ovBest.textContent = best;
  renderStats();
  el.over.style.display = 'flex';
  sfx('over');
}

function canPlaceAt(type, x, y) {
  const r = CFG.TOWER_R;
  if (x < r || x > CFG.W - r || y < r || y > CFG.H - r) return { ok: false, why: 'Edge' };
  if (distToPath(x, y) < CFG.PATH_HALF + r) return { ok: false, why: 'Path' };
  for (const t of S.towers) {
    if (Math.hypot(t.x - x, t.y - y) < CFG.TOWER_GAP) return { ok: false, why: 'Tower' };
  }
  for (const p of S.pylons) {
    if (Math.hypot(p.x - x, p.y - y) < r + CFG.PYLON_R) return { ok: false, why: 'Pylon' };
  }
  if (S.money < towerCost(type)) return { ok: false, why: 'Funds' };
  return { ok: true, why: '' };
}

function placeTower(type, x, y) {
  const c = towerCost(type);
  S.money -= c;
  S.towers.push({
    id: S.nextId++,
    type: type,
    x: x,
    y: y,
    tier: 0,
    invested: c,
    cd: 0,
    angle: -Math.PI / 2,
    target: 'first'
  });
  burst(x, y, CFG.TOWER[type].color, 10);
  sfx('build');
}

function upgradeTower(t, path) {
  if (!t || t.tier >= 3 || S.over) return;
  if (t.tier === 2 && !PATHS[t.type][path]) {
    sfx('deny');
    addText(t.x, t.y - 22, 'Pick path A or B', '#c62828', 0.9, 12);
    return;
  }
  const c = upgradeCost(t);
  if (S.money < c) {
    sfx('deny');
    addText(t.x, t.y - 22, 'Not enough $', '#c62828', 0.9, 12);
    return;
  }
  S.money -= c;
  t.invested += c;
  t.tier++;
  if (t.tier === 3) t.path = path;
  t.hop = 1;
  addText(t.x, t.y - 22, 'Tier ' + t.tier, '#b35c00', 1.2, 13);
  sfx('upgrade');
  burst(t.x, t.y, CFG.TOWER[t.type].color, 14);
  if (t.tier === 3) {
    addText(t.x, t.y - 44, PATHS[t.type][path].name.toUpperCase() + '!', '#ffe14d', 1.6, 16);
    sfx('tier3');
    burst(t.x, t.y, '#ffffff', 22);
  }
}

function sellTower(t) {
  if (!t) return;
  const refund = Math.floor(t.invested * CFG.SELL_RATE);
  S.money += refund;
  addText(t.x, t.y - 22, '+$' + refund, '#b35c00', 1.2, 13);
  burst(t.x, t.y, CFG.TOWER[t.type].color, 12);
  burst(t.x, t.y, '#ffd54a', 10);
  sfx('click');
  S.sold.push({ type: t.type, tier: t.tier, angle: t.angle, x: t.x, y: t.y, t: 0.5, max: 0.5 });
  S.towers = S.towers.filter(function (x) { return x !== t; });
  S.selectedId = null;
}

function triggerPylon(p) {
  p.cd = CFG.PYLON_CD;
  S.shocks.push({ x: p.x, y: p.y, r: 0, maxR: CFG.SHOCK_R, life: 0.6, max: 0.6 });
  const dmg = 60 + S.wave * 25;
  for (const e of S.enemies) {
    if (e.dead) continue;
    if (Math.hypot(e.x - p.x, e.y - p.y) > CFG.SHOCK_R) continue;
    damage(e, dmg, { type: 'pylon' });
    if (!e.dead) {
      e.stunT = CFG.STUN_T;
      addText(e.x, e.y - 16, 'Stunned!', '#ffe14d', 1.2, 13);
    }
  }
  burst(p.x, p.y, '#ffe14d', 20);
  sfx('pylon');
}

/* ==================== UPDATE ==================== */
function sortTargets(list, t) {
  const arr = list.slice();
  if (t.target === 'last') {
    arr.sort(function (a, b) { return a.dist - b.dist; });
  } else if (t.target === 'strong') {
    arr.sort(function (a, b) { return b.hp - a.hp; });
  } else if (t.target === 'close') {
    arr.sort(function (a, b) {
      return Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y);
    });
  } else {
    arr.sort(function (a, b) { return b.dist - a.dist; });
  }
  return arr;
}

function fire(t, ordered, st) {
  const d = CFG.TOWER[t.type];
  t.recoil = 1;
  if (t.type === 'pulse' || t.type === 'tack') {
    const n = Math.min(st.targets, ordered.length);
    for (let i = 0; i < n; i++) {
      const e = ordered[i];
      S.darts.push({ x1: t.x, y1: t.y, x2: e.x, y2: e.y, life: 0.16, max: 0.16 });
      sfx('shoot');
      damage(e, st.dmg, t);
    }
  } else if (t.type === 'stasis') {
    const hits = ordered.slice(0, st.chain ? 2 : 1);
    for (const e of hits) {
      S.lasers.push({ x1: t.x, y1: t.y, x2: e.x, y2: e.y, life: 0.15, max: 0.15, color: d.color, beam: true });
      damage(e, st.dmg, t);
      applySlow(e, st.slowMult, st.slowT);
    }
    sfx('stasis');
  } else if (t.type === 'sniper') {
    const e = ordered[0];
    S.lasers.push({ x1: t.x, y1: t.y, x2: e.x, y2: e.y, life: 0.22, max: 0.22, color: d.color, beam: 'snipe' });
    sfx('snipe');
    damage(e, st.dmg, t, st.pierce);
  } else if (t.type === 'plasma') {
    const e = ordered[0];
    S.shots.push({
      x: t.x, y: t.y, tx: e.x, ty: e.y, target: e, src: t,
      speed: 420, dmg: st.dmg, splash: st.splash, color: d.color, life: 3, done: false,
      d0: Math.max(1, Math.hypot(e.x - t.x, e.y - t.y)),
      ember: 2 + Math.random() * 2
    });
    sfx('plasma');
  }
}

function updateTowers(dt) {
  for (const t of S.towers) {
    const st = towerStats(t);
    t.cd = Math.max(-0.2, t.cd - dt);
    t.recoil = Math.max(0, (t.recoil || 0) - dt * 7);
    t.hop = Math.max(0, (t.hop || 0) - dt * 2.4);
    const inRange = [];
    for (const e of S.enemies) {
      if (!e.dead && Math.hypot(e.x - t.x, e.y - t.y) <= st.range) inRange.push(e);
    }
    if (inRange.length === 0) continue;
    const ordered = sortTargets(inRange, t);
    const want = Math.atan2(ordered[0].y - t.y, ordered[0].x - t.x);
    t.angle += angDiff(t.angle, want) * Math.min(1, dt * 14);
    if (t.cd <= 0) {
      t.cd = 1 / st.rate;
      fire(t, ordered, st);
    }
  }
}

function explode(p) {
  S.rings.push({ x: p.tx, y: p.ty, r: 0, maxR: p.splash, life: 0.4, max: 0.4, color: p.color });
  for (const e of S.enemies) {
    if (e.dead) continue;
    const d = Math.hypot(e.x - p.tx, e.y - p.ty);
    if (d <= p.splash) damage(e, p.dmg * (1 - 0.4 * (d / p.splash)), p.src);
  }
  burst(p.tx, p.ty, p.color, 16);
}

function updateShots(dt) {
  for (const p of S.shots) {
    p.life -= dt;
    if (p.target && !p.target.dead) {
      p.tx = p.target.x;
      p.ty = p.target.y;
    }
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const dd = Math.hypot(dx, dy);
    const step = p.speed * dt;
    if (dd <= step + 4 || p.life <= 0) {
      explode(p);
      p.done = true;
    } else {
      p.x += dx / dd * step;
      p.y += dy / dd * step;
    }
  }
  S.shots = S.shots.filter(function (p) { return !p.done; });
}

function updateEnemies(dt) {
  for (const e of S.enemies) {
    if (e.dead) continue;
    e.slowT = Math.max(0, e.slowT - dt);
    e.stunT = Math.max(0, e.stunT - dt);
    e.slowTxtCd = Math.max(0, e.slowTxtCd - dt);
    e.hitFlash = Math.max(0, e.hitFlash - dt * 4);
    e.squash = Math.max(0, (e.squash || 0) - dt * 8);
    e.dmgCd = Math.max(0, (e.dmgCd || 0) - dt);
    let sp = e.base;
    if (e.slowT > 0) sp *= e.slowMult || CFG.SLOW_MULT;
    if (e.stunT > 0) sp = 0;
    e.dist += sp * dt;
    if (e.dist >= PATH.total) {
      e.dead = true;
      S.lives -= e.lives;
      S.waveLost += e.lives;
      sfx('leak');
      S.shake = 0.35;
      addText(e.x, e.y - 10, '-' + e.lives + ' ♥', '#c62828', 1.4, 16);
      burst(e.x, e.y, '#c62828', 14);
      if (S.lives <= 0) {
        S.lives = 0;
        gameOver();
        return;
      }
      continue;
    }
    const p = posAt(e.dist);
    e.x = p.x;
    e.y = p.y;
    e.ang = p.ang;
  }
}

function updateFx(dt) {
  S.lasers = S.lasers.filter(function (l) { return (l.life -= dt) > 0; });
  S.darts = S.darts.filter(function (d) { return (d.life -= dt) > 0; });
  S.sold = S.sold.filter(function (s) { return (s.t -= dt) > 0; });
  S.pops = S.pops.filter(function (p) { return (p.t -= dt) > 0; });
  S.rings = S.rings.filter(function (r) { return (r.life -= dt) > 0; });
  S.shocks = S.shocks.filter(function (s) { return (s.life -= dt) > 0; });
  for (const r of S.rings) r.r = r.maxR * (1 - r.life / r.max);
  for (const s of S.shocks) s.r = s.maxR * (1 - s.life / s.max);
  S.particles = S.particles.filter(function (p) { return (p.life -= dt) > 0; });
  for (const p of S.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= (1 - 2 * dt);
    p.vy = p.vy * (1 - 2 * dt) + 30 * dt;
    if (p.spin) p.rot += p.spin * dt;
  }
  S.texts = S.texts.filter(function (t) { return (t.life -= dt) > 0; });
  for (const t of S.texts) t.y -= 28 * dt;
}

function update(dt) {
  S.time += dt;
  S.shake = Math.max(0, S.shake - dt);
  if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }

  if (S.waveActive) {
    if (S.toSpawn > 0) {
      S.spawnTimer -= dt;
      if (S.spawnTimer <= 0) {
        spawnEnemy(null);
        S.toSpawn--;
        S.spawnTimer = S.spawnInterval;
      }
    }
  } else if (S.auto) {
    S.autoTimer -= dt;
    if (S.autoTimer <= 0) startWave();
  }

  if (S.event) S.eventTimer = Math.max(0, S.eventTimer - dt);

  for (const p of S.pylons) p.cd = Math.max(0, p.cd - dt);

  updateEnemies(dt);
  if (S.over) return;
  updateTowers(dt);
  updateShots(dt);
  updateFx(dt);
  S.enemies = S.enemies.filter(function (e) { return !e.dead; });

  if (S.waveActive && S.toSpawn === 0 && S.enemies.length === 0) endWave();
}

/* ==================== RENDER ==================== */
let LAYOUT = null;
let MAP_INDEX = 0;
let dailyMode = false;
let mapBtnEls = [];

// Today's date as YYYY-MM-DD (local time). Everyone who plays today gets the same enemy sequence.
function dailyDate() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function dailySeed() {
  return parseInt(dailyDate().replace(/-/g, ''), 10);
}
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const DPR = Math.max(1, window.devicePixelRatio || 1);
canvas.width = CFG.W * DPR;
canvas.height = CFG.H * DPR;
ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

const INK = '#231a3a';
const BLOON_SCALE = 1.3;
const TOWER_SCALE = 1.3;

/* ---------- helpers ---------- */
function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(hex, other, t) {
  const a = hexToRgb(hex);
  const b = hexToRgb(other);
  const c = a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); });
  return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

function roundRectPath(g, x, y, w, h, r) {
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function tracePathOn(g) {
  g.beginPath();
  CFG.PATH_PTS.forEach(function (p, i) {
    if (i === 0) g.moveTo(p[0], p[1]);
    else g.lineTo(p[0], p[1]);
  });
}

// Cartoon text: bold face with a thick dark outline.
function outlined(g, text, x, y, size, color, lw) {
  g.font = 'bold ' + size + 'px ' + FONT;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineJoin = 'round';
  if (lw > 0) {
    g.lineWidth = lw;
    g.strokeStyle = INK;
    g.strokeText(text, x, y);
  }
  g.fillStyle = color;
  g.fillText(text, x, y);
}

// Union of circles with one thick outline and a single glossy highlight per circle.
function blob(g, list, fill, hi) {
  g.lineJoin = 'round';
  g.strokeStyle = INK;
  g.lineWidth = 4.5;
  for (const c of list) {
    g.beginPath();
    g.arc(c[0], c[1], c[2], 0, TAU);
    g.stroke();
  }
  g.fillStyle = fill;
  for (const c of list) {
    g.beginPath();
    g.arc(c[0], c[1], c[2], 0, TAU);
    g.fill();
  }
  g.fillStyle = hi;
  for (const c of list) {
    g.beginPath();
    g.arc(c[0] - c[2] * 0.3, c[1] - c[2] * 0.35, c[2] * 0.35, 0, TAU);
    g.fill();
  }
}

/* ---------- map (painted every frame onto the main canvas) ---------- */
function drawScenery(g, s) {
  g.save();
  g.translate(s.x, s.y);
  g.scale(s.r, s.r);
  g.strokeStyle = INK;
  if (s.kind === 'tree') {
    g.fillStyle = 'rgba(20,45,10,0.3)';
    g.beginPath(); g.ellipse(6, 15, 20, 9, 0, 0, TAU); g.fill();
    g.fillStyle = '#7a4d26';
    g.lineWidth = 2.5;
    g.fillRect(-3.5, 0, 7, 15);
    g.strokeRect(-3.5, 0, 7, 15);
    blob(g, [[-9, -12, 11], [9, -12, 11], [0, -22, 13], [0, -8, 12]], '#3c9a3c', '#8fe07a');
  } else if (s.kind === 'bush') {
    g.fillStyle = 'rgba(20,45,10,0.28)';
    g.beginPath(); g.ellipse(2, 9, 17, 7, 0, 0, TAU); g.fill();
    blob(g, [[-8, 0, 8], [7, -1, 9], [0, -7, 8]], '#2e8b3e', '#9ae07a');
    const cols = ['#ff6b8b', '#ffe066', '#ffffff', '#ff9a3c'];
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.arc(-7 + i * 5, -4 + (i % 2) * 5, 1.9, 0, TAU);
      g.fillStyle = cols[i];
      g.fill();
    }
  } else {
    g.fillStyle = 'rgba(20,45,10,0.28)';
    g.beginPath(); g.ellipse(2, 6, 14, 6, 0, 0, TAU); g.fill();
    blob(g, [[-4, 0, 8], [5, 1, 6]], '#8f969d', '#eef1f4');
  }
  g.restore();
}

function drawSign(g, text, x, y) {
  g.save();
  g.translate(x, y);
  g.beginPath();
  roundRectPath(g, -34, -10, 68, 20, 5);
  g.fillStyle = '#7a4a22';
  g.fill();
  g.lineWidth = 2.5;
  g.strokeStyle = INK;
  g.stroke();
  g.font = 'bold 12px ' + FONT;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#f7e6c0';
  g.fillText(text, 0, 1);
  g.restore();
}

const MAP_THEME = {
  meadow: {
    g0: '#9be65a', g1: '#5ec43a', tuft: '#3a9126',
    patch: ['rgba(255,255,200,0.08)', 'rgba(40,90,20,0.08)'],
    rut: 'rgba(90,50,20,0.45)', edge: '#4e2c12', dirt: '#8a5424', top: '#a86c35',
    kinds: ['tree', 'bush', 'rock']
  },
  desert: {
    g0: '#ffe08a', g1: '#f2b453', tuft: '#c98a33',
    patch: ['rgba(255,255,220,0.12)', 'rgba(160,90,20,0.08)'],
    rut: 'rgba(120,70,20,0.4)', edge: '#6b4420', dirt: '#b57a3c', top: '#cf9a58',
    kinds: ['cactus', 'rock']
  },
  snow: {
    g0: '#f4fbff', g1: '#cfe6f5', tuft: '#9cc3dd',
    patch: ['rgba(255,255,255,0.5)', 'rgba(120,160,200,0.12)'],
    rut: 'rgba(40,70,100,0.35)', edge: '#2f4a63', dirt: '#7d9bb5', top: '#a9c4d9',
    kinds: ['pine', 'pine', 'rock']
  }
};

/* Everything random about a map is generated once here, so painting each frame is cheap. */
function buildLayout() {
  const rnd = rng(7 + MAP_INDEX * 13);
  const H = CFG.PATH_HALF;
  const L = { patches: [], tufts: [], flowers: [], pebbles: [], ruts: [], edge: [], spots: [] };
  const T = MAP_THEME[CFG.THEME];

  for (let i = 0; i < 90; i++) {
    L.patches.push({ x: rnd() * CFG.W, y: rnd() * CFG.H, r: 20 + rnd() * 60, light: rnd() < 0.5, k: rnd() * 3 });
  }
  for (let i = 0; i < 420; i++) {
    const x = rnd() * CFG.W;
    const y = rnd() * CFG.H;
    if (distToPath(x, y) < H + 6) continue;
    L.tufts.push({ x: x, y: y });
  }
  for (let i = 0; i < 70; i++) {
    const x = rnd() * CFG.W;
    const y = rnd() * CFG.H;
    if (distToPath(x, y) < H + 10) continue;
    L.flowers.push({ x: x, y: y, c: ['#ff6b8b', '#ffe066', '#ffffff', '#b58cff'][Math.floor(rnd() * 4)] });
  }
  for (let i = 0; i < 520; i++) {
    const p = posAt(rnd() * PATH.total);
    const off = (rnd() * 2 - 1) * (H - 3);
    L.pebbles.push({
      x: p.x + Math.cos(p.ang + Math.PI / 2) * off,
      y: p.y + Math.sin(p.ang + Math.PI / 2) * off,
      r: 0.8 + rnd() * 1.6,
      dark: rnd() < 0.5
    });
  }
  for (const o of [-H * 0.45, H * 0.45]) {
    const pts = [];
    for (let d = 0; d <= PATH.total; d += 6) {
      const p = posAt(d);
      pts.push([p.x + Math.cos(p.ang + Math.PI / 2) * o, p.y + Math.sin(p.ang + Math.PI / 2) * o]);
    }
    L.ruts.push(pts);
  }
  for (let d = 0; d < PATH.total; d += 12) {
    const p = posAt(d);
    for (const side of [-1, 1]) {
      if (rnd() < 0.35) continue;
      L.edge.push({
        x: p.x + Math.cos(p.ang + Math.PI / 2) * side * (H + 1),
        y: p.y + Math.sin(p.ang + Math.PI / 2) * side * (H + 1),
        s: 0.8 + rnd() * 0.5
      });
    }
  }
  let tries = 0;
  while (L.spots.length < 34 && tries++ < 4000) {
    const x = 12 + rnd() * (CFG.W - 24);
    const y = 12 + rnd() * (CFG.H - 24);
    if (distToPath(x, y) < H + 20) continue;
    let ok = true;
    for (const s of L.spots) if (Math.hypot(s.x - x, s.y - y) < 36) { ok = false; break; }
    for (const p of CFG.PYLONS) if (Math.hypot(p[0] - x, p[1] - y) < 36) ok = false;
    if (!ok) continue;
    L.spots.push({ x: x, y: y, kind: T.kinds[Math.floor(rnd() * T.kinds.length)], r: 0.85 + rnd() * 0.3 });
  }
  return L;
}

function drawCactus(g, s) {
  g.save();
  g.translate(s.x, s.y);
  g.scale(s.r, s.r);
  g.lineCap = 'round';
  g.fillStyle = 'rgba(90,50,20,0.28)';
  g.beginPath();
  g.ellipse(5, 8, 12, 5, 0, 0, TAU);
  g.fill();
  const pill = function (x1, y1, x2, y2, w) {
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.lineWidth = w + 4;
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = w;
    g.strokeStyle = '#3f9a4a';
    g.stroke();
  };
  pill(0, 0, 0, -22, 7);
  pill(0, -10, -8, -10, 4);
  pill(-8, -10, -8, -18, 4);
  pill(0, -6, 7, -6, 4);
  pill(7, -6, 7, -14, 4);
  g.restore();
}

function drawPine(g, s) {
  g.save();
  g.translate(s.x, s.y);
  g.scale(s.r, s.r);
  g.fillStyle = 'rgba(40,70,100,0.25)';
  g.beginPath();
  g.ellipse(6, 14, 16, 7, 0, 0, TAU);
  g.fill();
  g.fillStyle = '#6b4a2e';
  g.strokeStyle = INK;
  g.lineWidth = 2.5;
  g.fillRect(-3, 8, 6, 10);
  g.strokeRect(-3, 8, 6, 10);
  const tri = function (yb, hw, ay, fill) {
    g.beginPath();
    g.moveTo(-hw, yb);
    g.lineTo(0, ay);
    g.lineTo(hw, yb);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    g.stroke();
  };
  tri(10, 16, -14, '#2e7d5b');
  tri(-4, 13, -30, '#2e7d5b');
  tri(-14, 9, -42, '#2e7d5b');
  tri(-30, 4, -44, '#f4fbff');
  g.restore();
}

function paintTerrain(g) {
  const L = LAYOUT;
  const T = MAP_THEME[CFG.THEME];
  const H = CFG.PATH_HALF;

  const grad = g.createLinearGradient(0, 0, 0, CFG.H);
  grad.addColorStop(0, T.g0);
  grad.addColorStop(1, T.g1);
  g.fillStyle = grad;
  g.fillRect(0, 0, CFG.W, CFG.H);

  for (const p of L.patches) {
    g.fillStyle = p.light ? T.patch[0] : T.patch[1];
    g.beginPath();
    g.ellipse(p.x, p.y, p.r, p.r * 0.6, p.k, 0, TAU);
    g.fill();
  }
  g.strokeStyle = T.tuft;
  g.lineWidth = 1.6;
  g.lineCap = 'round';
  for (const t of L.tufts) {
    for (let k = -1; k <= 1; k++) {
      g.beginPath();
      g.moveTo(t.x + k * 2, t.y);
      g.quadraticCurveTo(t.x + k * 3, t.y - 4, t.x + k * 4.5, t.y - 7);
      g.stroke();
    }
  }
  for (const f of L.flowers) {
    g.fillStyle = f.c;
    g.beginPath();
    g.arc(f.x, f.y, 2.2, 0, TAU);
    g.fill();
  }

  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.save();
  g.translate(0, 5);
  tracePathOn(g);
  g.strokeStyle = 'rgba(30,50,15,0.3)';
  g.lineWidth = H * 2 + 16;
  g.stroke();
  g.restore();
  tracePathOn(g);
  g.strokeStyle = T.edge;
  g.lineWidth = H * 2 + 8;
  g.stroke();
  tracePathOn(g);
  g.strokeStyle = T.dirt;
  g.lineWidth = H * 2;
  g.stroke();
  tracePathOn(g);
  g.strokeStyle = T.top;
  g.lineWidth = H * 2 - 10;
  g.stroke();
  tracePathOn(g);
  g.strokeStyle = 'rgba(255,200,130,0.12)';
  g.lineWidth = H * 2 - 24;
  g.stroke();

  g.strokeStyle = T.rut;
  g.lineWidth = 2;
  for (const pts of L.ruts) {
    g.beginPath();
    pts.forEach(function (q, i) {
      if (i === 0) g.moveTo(q[0], q[1]);
      else g.lineTo(q[0], q[1]);
    });
    g.stroke();
  }
  for (const p of L.pebbles) {
    g.fillStyle = p.dark ? 'rgba(90,55,25,0.35)' : 'rgba(255,240,205,0.5)';
    g.beginPath();
    g.arc(p.x, p.y, p.r, 0, TAU);
    g.fill();
  }

  // grass tufts poking over the path border
  g.strokeStyle = T.tuft;
  g.lineWidth = 1.6;
  for (const e of L.edge) {
    g.beginPath();
    g.moveTo(e.x - 2, e.y);
    g.quadraticCurveTo(e.x - 1, e.y - 4 * e.s, e.x + 1, e.y - 7 * e.s);
    g.moveTo(e.x + 2, e.y);
    g.quadraticCurveTo(e.x + 3, e.y - 4 * e.s, e.x + 4, e.y - 6 * e.s);
    g.stroke();
  }

  for (const s of L.spots) {
    if (s.kind === 'cactus') drawCactus(g, s);
    else if (s.kind === 'pine') drawPine(g, s);
    else drawScenery(g, s);
  }

  const M = MAPS[MAP_INDEX];
  drawSign(g, 'ENTRY', M.entry[0], M.entry[1]);
  drawSign(g, 'EXIT', M.exit[0], M.exit[1]);
}

function selectMap(i) {
  if (S.wave > 0 || S.waveActive) return;
  MAP_INDEX = i;
  CFG.PATH_PTS = MAPS[i].path;
  CFG.PYLONS = MAPS[i].pylons;
  CFG.THEME = MAPS[i].theme;
  PATH.segs = [];
  PATH.total = 0;
  buildPath();
  LAYOUT = buildLayout();
  resetGame();
  sfx('click');
}

function drawDarts(g) {
  for (const d of S.darts) {
    const prog = Math.min(1, 1 - d.life / d.max);
    const x = d.x1 + (d.x2 - d.x1) * prog;
    const y = d.y1 + (d.y2 - d.y1) * prog;
    const a = Math.atan2(d.y2 - d.y1, d.x2 - d.x1);
    g.save();
    g.globalAlpha = 0.35;
    g.beginPath();
    g.moveTo(d.x1, d.y1);
    g.lineTo(x, y);
    g.strokeStyle = '#ffffff';
    g.lineWidth = 1;
    g.stroke();
    g.globalAlpha = 1;
    g.translate(x, y);
    g.rotate(a);
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-10, 0);
    g.lineTo(0, 0);
    g.lineWidth = 3.5;
    g.strokeStyle = INK;
    g.stroke();
    g.beginPath();
    g.moveTo(-9, 0);
    g.lineTo(-1, 0);
    g.lineWidth = 1.5;
    g.strokeStyle = '#c98a4a';
    g.stroke();
    g.beginPath();
    g.moveTo(0, -3);
    g.lineTo(5, 0);
    g.lineTo(0, 3);
    g.closePath();
    g.fillStyle = '#e3eaf2';
    g.fill();
    g.lineWidth = 1.2;
    g.strokeStyle = INK;
    g.stroke();
    g.restore();
  }
}

function drawPops(g) {
  for (const p of S.pops) {
    const prog = 1 - p.t / p.max;
    const r = 8 + 26 * prog;
    g.save();
    g.globalAlpha = 1 - prog;
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = i * TAU / 16;
      const rr = i % 2 ? r * 0.55 : r;
      const px = p.x + Math.cos(a) * rr;
      const py = p.y + Math.sin(a) * rr;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fillStyle = '#ffffff';
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = INK;
    g.stroke();
    g.beginPath();
    g.arc(p.x, p.y, Math.max(1, r * 0.35), 0, TAU);
    g.fillStyle = p.color;
    g.fill();
    g.restore();
  }
}

function drawSold(g) {
  for (const s of S.sold) {
    const p = 1 - s.t / s.max;
    g.save();
    g.globalAlpha = Math.max(0, 1 - p);
    g.translate(s.x, s.y);
    g.rotate(p * 2.5);
    g.scale(1 - p * 0.7, 1 - p * 0.7);
    drawTower(g, 0, 0, s.type, s.tier, s.angle, false, 0, 0);
    g.restore();
  }
}

function drawWaveBanner(g) {
  const b = S.banner;
  if (!b) return;
  const age = b.max - b.t;
  const k = Math.min(1, age / 0.2);
  const sc = 0.7 + 0.3 * k;
  g.save();
  g.globalAlpha = Math.min(1, b.t / 0.3);
  g.translate(CFG.W / 2, 150);
  g.scale(sc, sc);
  g.beginPath();
  roundRectPath(g, -170, -28, 340, 56, 14);
  g.fillStyle = '#2b2a6b';
  g.fill();
  g.lineWidth = 4;
  g.strokeStyle = INK;
  g.stroke();
  outlined(g, b.text, 0, 1, 30, b.color, 6);
  g.restore();
}

/* ---------- monkey towers ---------- */
function drawMonkey(g, type, tier) {
  const FUR = '#8c5a33';
  const FACE = '#f2d7ae';
  const PINK = '#f286a2';
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.strokeStyle = INK;

  // Weapon sits behind the head
  if (type === 'pulse') {
    const n = 1 + Math.min(tier, 2);
    const offs = n === 1 ? [0] : (n === 2 ? [-3.5, 3.5] : [-5, 0, 5]);
    for (const o of offs) {
      g.beginPath();
      roundRectPath(g, 4, o - 1.7, 17, 3.4, 1.7);
      g.fillStyle = '#7a4a22';
      g.lineWidth = 1.6;
      g.fill();
      g.stroke();
      g.beginPath();
      g.moveTo(20, o - 3.3);
      g.lineTo(27, o);
      g.lineTo(20, o + 3.3);
      g.closePath();
      g.fillStyle = '#e3eaf2';
      g.fill();
      g.stroke();
    }
  } else if (type === 'plasma') {
    g.beginPath();
    roundRectPath(g, 0, -5, 19, 10, 4);
    g.fillStyle = '#30323c';
    g.lineWidth = 2;
    g.fill();
    g.stroke();
    g.fillStyle = '#f08a24';
    g.fillRect(12, -5.5, 3, 11);
    g.beginPath();
    g.ellipse(19, 0, 2.5, 5.5, 0, 0, TAU);
    g.fillStyle = '#15161b';
    g.fill();
    g.stroke();
    if (tier >= 2) {
      g.fillStyle = '#ffd54a';
      g.fillRect(6, -5.5, 2.5, 11);
    }
  } else if (type === 'tack') {
    // Ring of tacks around the monkey
    for (let i = 0; i < 4; i++) {
      g.save();
      g.rotate(i * Math.PI / 2 + 0.4);
      g.beginPath();
      g.moveTo(6, -2.5); g.lineTo(15, 0); g.lineTo(6, 2.5); g.closePath();
      g.fillStyle = '#e8e8f0';
      g.lineWidth = 1.4;
      g.fill();
      g.stroke();
      g.restore();
    }
  } else if (type === 'sniper') {
    // Long scoped rifle
    g.beginPath();
    roundRectPath(g, 2, -2, 24, 4, 1.6);
    g.fillStyle = '#5a3a1e';
    g.lineWidth = 1.6;
    g.fill();
    g.stroke();
    g.beginPath();
    roundRectPath(g, 8, -5, 7, 3.5, 1.2);
    g.fillStyle = '#2a2d36';
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(24, 0, 2, 0, TAU);
    g.fillStyle = tier >= 2 ? '#ffe14d' : '#9fe3ff';
    g.fill();
  } else {
    const k = tier >= 2 ? 1.25 : 1;
    g.beginPath();
    g.moveTo(9, 0);
    g.lineTo(15, -6 * k);
    g.lineTo(24, 0);
    g.lineTo(15, 6 * k);
    g.closePath();
    g.fillStyle = '#a6ecff';
    g.lineWidth = 2;
    g.fill();
    g.stroke();
    g.beginPath();
    g.moveTo(11, -1.5);
    g.lineTo(20, -2.5);
    g.strokeStyle = 'rgba(255,255,255,0.95)';
    g.lineWidth = 1.5;
    g.stroke();
    g.strokeStyle = INK;
    if (tier >= 2) {
      g.beginPath();
      g.moveTo(14, -10); g.lineTo(18, -14); g.lineTo(21, -9); g.closePath();
      g.fillStyle = '#c9f3ff';
      g.lineWidth = 1.6;
      g.fill();
      g.stroke();
    }
  }

  // Body (shoulders)
  g.lineWidth = 2.5;
  g.beginPath();
  g.ellipse(-3, 0, 9, 8, 0, 0, TAU);
  g.fillStyle = FUR;
  g.fill();
  g.stroke();

  // Ears
  for (const sy of [-7.5, 7.5]) {
    g.beginPath();
    g.arc(1, sy, 3.6, 0, TAU);
    g.fillStyle = FUR;
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(1.4, sy, 1.9, 0, TAU);
    g.fillStyle = PINK;
    g.fill();
  }

  // Head
  g.beginPath();
  g.arc(3, 0, 7.5, 0, TAU);
  g.fillStyle = FUR;
  g.fill();
  g.stroke();

  // Headgear
  if (type === 'pulse') {
    g.beginPath();
    g.ellipse(-0.5, 0, 2.6, 7.6, 0, 0, TAU);
    g.fillStyle = '#e8323c';
    g.lineWidth = 1.5;
    g.fill();
    g.stroke();
  } else if (type === 'plasma') {
    g.beginPath();
    g.ellipse(0.5, 0, 5.2, 8.3, 0, 0, TAU);
    g.fillStyle = '#d9622b';
    g.lineWidth = 1.8;
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(0.5, 0, 6.6, -0.9, 0.9);
    g.strokeStyle = '#ffd54a';
    g.lineWidth = 1.6;
    g.stroke();
    g.strokeStyle = INK;
  } else if (type === 'tack') {
    g.beginPath();
    g.ellipse(0.5, 0, 5, 8, 0, 0, TAU);
    g.fillStyle = '#ff8fab';
    g.lineWidth = 1.8;
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(-4, 0, 1.8, 0, TAU);
    g.fillStyle = '#ffffff';
    g.fill();
  } else if (type === 'sniper') {
    g.beginPath();
    g.ellipse(0.5, 0, 5, 8, 0, 0, TAU);
    g.fillStyle = '#4f9a2e';
    g.lineWidth = 1.8;
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(-4, 0, 1.8, 0, TAU);
    g.fillStyle = '#ffffff';
    g.fill();
  } else {
    g.beginPath();
    g.ellipse(0.5, 0, 5, 8, 0, 0, TAU);
    g.fillStyle = '#4fb4ff';
    g.lineWidth = 1.8;
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(-4, 0, 1.8, 0, TAU);
    g.fillStyle = '#ffffff';
    g.fill();
  }

  // Face, big cartoon eyes, nose and smile
  g.beginPath();
  g.ellipse(6.5, 0, 4.6, 5.2, 0, 0, TAU);
  g.fillStyle = FACE;
  g.lineWidth = 1.5;
  g.fill();
  g.stroke();
  for (const ey of [-2.6, 2.6]) {
    g.beginPath();
    g.arc(7.4, ey, 2.4, 0, TAU);
    g.fillStyle = '#ffffff';
    g.lineWidth = 1.4;
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(8.1, ey + 0.2, 1.2, 0, TAU);
    g.fillStyle = INK;
    g.fill();
  }
  g.beginPath();
  g.ellipse(9.6, 0, 1.2, 0.9, 0, 0, TAU);
  g.fillStyle = '#6b3d22';
  g.fill();
  g.beginPath();
  g.arc(8.4, 0, 2.6, 0.5, 2.6);
  g.lineWidth = 1.3;
  g.stroke();
}

function drawTower(g, x, y, type, tier, angle, bad, recoil, hop) {
  g.save();
  const jump = (hop || 0) > 0 ? Math.sin((1 - hop) * Math.PI) * 9 : 0;
  g.translate(x, y - jump);
  const breathe = 1 + 0.02 * Math.sin(S.time * 3 + x * 0.05);
  g.scale(TOWER_SCALE * breathe, TOWER_SCALE * breathe);
  g.lineJoin = 'round';

  // Shadow
  g.fillStyle = 'rgba(20,45,10,0.3)';
  g.beginPath();
  g.ellipse(3, 6, 18, 14, 0, 0, TAU);
  g.fill();

  // Wooden platform
  g.lineWidth = 3;
  g.strokeStyle = INK;
  g.beginPath();
  g.arc(0, 0, 17, 0, TAU);
  g.fillStyle = '#7d5230';
  g.fill();
  g.stroke();
  g.beginPath();
  g.arc(-1, -1, 13.5, 0, TAU);
  g.fillStyle = '#a56e3c';
  g.fill();
  g.lineWidth = 1.2;
  g.strokeStyle = 'rgba(60,35,15,0.45)';
  g.beginPath();
  g.moveTo(-12, -5); g.lineTo(12, -5);
  g.moveTo(-12, 4); g.lineTo(12, 4);
  g.stroke();

  // Tier stars on the platform rim
  const spots = [[-8, 11], [0, 13], [8, 11]];
  for (let i = 0; i < tier && i < 3; i++) {
    g.beginPath();
    g.arc(spots[i][0], spots[i][1], 2.8, 0, TAU);
    g.fillStyle = '#ffd54a';
    g.lineWidth = 1.2;
    g.strokeStyle = INK;
    g.fill();
    g.stroke();
  }

  g.save();
  g.rotate(angle);
  g.translate(-(recoil || 0) * 4, 0);
  drawMonkey(g, type, tier);
  g.restore();

  if (bad) {
    g.beginPath();
    g.arc(0, 0, 17, 0, TAU);
    g.fillStyle = 'rgba(255,40,60,0.35)';
    g.fill();
  }
  g.restore();
}

function drawRange(g, x, y, r, fill, stroke) {
  g.save();
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fillStyle = fill;
  g.fill();
  g.setLineDash([7, 6]);
  g.strokeStyle = stroke;
  g.lineWidth = 2;
  g.stroke();
  g.restore();
}

/* ---------- overload pylons (stone totems) ---------- */
function drawPylon(g, p) {
  const ready = p.cd <= 0;
  const pulse = 0.5 + 0.5 * Math.sin(S.time * 5);
  g.save();
  g.translate(p.x, p.y);
  g.fillStyle = 'rgba(20,45,10,0.3)';
  g.beginPath();
  g.ellipse(2, 8, 18, 10, 0, 0, TAU);
  g.fill();
  if (ready) {
    g.beginPath();
    g.arc(0, 0, 23 + pulse * 4, 0, TAU);
    g.fillStyle = 'rgba(255,215,64,' + (0.16 + 0.14 * pulse) + ')';
    g.fill();
  }
  g.lineWidth = 3;
  g.strokeStyle = INK;
  g.beginPath();
  g.arc(0, 0, 15, 0, TAU);
  g.fillStyle = '#9b9488';
  g.fill();
  g.stroke();
  g.beginPath();
  g.arc(-2, -3, 10, 0, TAU);
  g.fillStyle = '#c4bdb0';
  g.fill();
  g.beginPath();
  g.arc(0, 0, 7, 0, TAU);
  g.fillStyle = ready ? '#ffd54a' : '#6f6a60';
  g.lineWidth = 2.5;
  g.fill();
  g.stroke();
  g.beginPath();
  g.arc(-2.5, -2.5, 2.2, 0, TAU);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.fill();

  if (!ready) {
    const frac = p.cd / CFG.PYLON_CD;
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, 15, -Math.PI / 2, -Math.PI / 2 + TAU * frac);
    g.closePath();
    g.fillStyle = 'rgba(20,15,10,0.45)';
    g.fill();
    outlined(g, Math.ceil(p.cd) + 's', 0, 28, 12, '#ffffff', 4);
  } else {
    outlined(g, 'READY', 0, 28, 11, '#ffe066', 4);
  }
  g.restore();
}

/* ---------- bloon enemies ---------- */
const BLOON_LETTER = { scout: 'S', soldier: 'G', tank: 'T', armored: 'A', behemoth: 'B', boss: 'K', swarm: 'W', shielded: 'D' };
function drawBloon(g, e) {
  const rb = e.r * BLOON_SCALE;
  const bob = Math.sin(S.time * 6 + e.id * 1.7) * 1.2;
  const top = -rb * 0.15;
  const hit = e.hitFlash > 0.5;

  // Ground shadow
  g.fillStyle = 'rgba(20,45,10,0.3)';
  g.beginPath();
  g.ellipse(e.x + 2, e.y + rb * 1.5 + 4, rb * 0.85, rb * 0.36, 0, 0, TAU);
  g.fill();

  g.save();
  g.translate(e.x, e.y + bob);
  g.lineJoin = 'round';
  const sq = e.squash || 0;
  g.scale(1 + 0.18 * sq, 1 - 0.18 * sq);

  const body = function () {
    g.beginPath();
    g.ellipse(0, top, rb, rb * 1.15, 0, 0, TAU);
  };
  const tail = function () {
    g.beginPath();
    g.moveTo(-rb * 0.22, rb * 0.8);
    g.lineTo(rb * 0.22, rb * 0.8);
    g.lineTo(0, rb * 1.5);
    g.closePath();
  };

  // Outline
  g.strokeStyle = INK;
  g.lineWidth = 4;
  body(); g.stroke();
  tail(); g.stroke();

  // Body fill with glossy shading
  const grad = g.createRadialGradient(-rb * 0.35, top - rb * 0.4, rb * 0.1, 0, top, rb * 1.2);
  grad.addColorStop(0, hit ? '#ffffff' : mix(e.color, '#ffffff', 0.5));
  grad.addColorStop(0.5, hit ? '#f2f2f2' : e.color);
  grad.addColorStop(1, hit ? '#cfcfcf' : mix(e.color, '#000000', 0.4));
  g.fillStyle = grad;
  body(); g.fill();
  tail(); g.fill();

  // Knot
  g.beginPath();
  g.arc(0, rb * 1.42, rb * 0.1, 0, TAU);
  g.fillStyle = mix(e.color, '#000000', 0.45);
  g.lineWidth = 2;
  g.fill();
  g.stroke();

  // Lead-style metal band on behemoths
  if ((e.type === 'behemoth' || e.type === 'armored' || e.type === 'boss') && !hit) {
    g.save();
    body();
    g.clip();
    g.beginPath();
    g.rect(-rb * 1.2, top + rb * 0.2, rb * 2.4, rb * 0.22);
    g.fillStyle = 'rgba(40,44,52,0.55)';
    g.fill();
    g.restore();
  }
  // Highlights
  g.beginPath();
  g.ellipse(-rb * 0.42, top - rb * 0.38, rb * 0.2, rb * 0.3, -0.5, 0, TAU);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.fill();
  g.beginPath();
  g.arc(-rb * 0.18, top - rb * 0.72, rb * 0.07, 0, TAU);
  g.fillStyle = 'rgba(255,255,255,0.8)';
  g.fill();

  // Type letter, so enemy types read without relying on colour
  outlined(g, BLOON_LETTER[e.type] || '?', 0, top, Math.round(rb * 0.85), '#ffffff', 3);

  // String
  g.beginPath();
  g.moveTo(0, rb * 1.55);
  g.bezierCurveTo(-rb * 0.4, rb * 1.9, rb * 0.4, rb * 2.1, 0, rb * 2.4);
  g.strokeStyle = 'rgba(29,20,16,0.5)';
  g.lineWidth = 1.2;
  g.stroke();
  g.restore();

  // Status rings
  if (e.stunT > 0) {
    g.save();
    g.beginPath();
    g.arc(e.x, e.y + bob, rb * 1.4 + 6, 0, TAU);
    g.strokeStyle = '#ffd54a';
    g.lineWidth = 2.5;
    g.setLineDash([4, 4]);
    g.stroke();
    g.restore();
  } else if (e.slowT > 0) {
    g.save();
    g.beginPath();
    g.arc(e.x, e.y + bob, rb * 1.4 + 5, 0, TAU);
    g.fillStyle = 'rgba(160,235,255,0.22)';
    g.fill();
    g.strokeStyle = '#e8fbff';
    g.lineWidth = 4;
    g.stroke();
    g.strokeStyle = '#4fc3f7';
    g.lineWidth = 2;
    g.stroke();
    g.translate(e.x, e.y + bob - rb * 1.5 - 14);
    g.rotate(S.time * 2.5);
    g.strokeStyle = '#e8fbff';
    g.lineWidth = 2;
    g.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      g.beginPath();
      g.moveTo(-6, 0);
      g.lineTo(6, 0);
      g.stroke();
      g.rotate(Math.PI / 3);
    }
    g.restore();
  }

  // Shield bubble
  if (e.shield > 0) {
    g.beginPath();
    g.arc(e.x, e.y + bob, rb * 1.35 + 4, 0, TAU);
    g.fillStyle = 'rgba(159,227,255,0.22)';
    g.fill();
    g.strokeStyle = '#9fe3ff';
    g.lineWidth = 2.5;
    g.stroke();
  }

  // Health bar (only when damaged)
  if (e.hp < e.maxHp) {
    const pct = Math.max(0, e.hp / e.maxHp);
    const bw = Math.max(22, rb * 2.4);
    const bx = e.x - bw / 2;
    const by = e.y + bob - rb * 1.15 - 14;
    g.fillStyle = '#2b1d14';
    g.fillRect(bx - 1, by - 1, bw + 2, 7);
    g.fillStyle = pct > 0.6 ? '#5ddc4f' : (pct > 0.3 ? '#ffc53d' : '#ff4d4d');
    g.fillRect(bx, by, bw * pct, 5);
  }
}

/* ---------- projectiles & effects ---------- */
function drawLasers(g) {
  for (const l of S.lasers) {
    g.save();
    g.globalAlpha = Math.max(0, l.life / l.max);
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(l.x1, l.y1);
    g.lineTo(l.x2, l.y2);
    if (l.beam === 'snipe') {
      g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
      g.strokeStyle = '#7bd64a'; g.lineWidth = 3.5; g.stroke();
      g.strokeStyle = '#f4ffe0'; g.lineWidth = 1.4; g.stroke();
    } else if (l.beam) {
      g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
      g.strokeStyle = '#9fe3ff'; g.lineWidth = 4.5; g.stroke();
      g.strokeStyle = '#ffffff'; g.lineWidth = 1.8; g.stroke();
    } else {
      g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
      g.strokeStyle = '#f0c27a'; g.lineWidth = 2.2; g.stroke();
    }
    g.restore();
  }
}

function drawShots(g) {
  for (const p of S.shots) {
    const rem = Math.hypot(p.tx - p.x, p.ty - p.y);
    const prog = Math.max(0, Math.min(1, 1 - rem / (p.d0 || 1)));
    const lift = Math.sin(prog * Math.PI) * 18;
    g.save();
    g.fillStyle = 'rgba(20,45,10,0.3)';
    g.beginPath();
    g.ellipse(p.x, p.y + 3, Math.max(2, 6 - lift * 0.1), Math.max(1, 3 - lift * 0.05), 0, 0, TAU);
    g.fill();
    g.translate(p.x, p.y - lift);
    g.beginPath();
    g.arc(0, 0, 6.5, 0, TAU);
    g.fillStyle = '#262931';
    g.lineWidth = 2;
    g.strokeStyle = INK;
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(-2.2, -2.4, 1.8, 0, TAU);
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.fill();
    g.beginPath();
    g.arc(4, -6, p.ember, 0, TAU);
    g.fillStyle = '#ffd54a';
    g.fill();
    g.restore();
  }
}

function drawRings(g) {
  for (const r of S.rings) {
    g.save();
    g.globalAlpha = Math.max(0, r.life / r.max);
    g.beginPath();
    g.arc(r.x, r.y, Math.max(1, r.r), 0, TAU);
    g.fillStyle = 'rgba(255,170,60,0.4)';
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = INK;
    g.stroke();
    g.beginPath();
    g.arc(r.x, r.y, Math.max(1, r.r * 0.55), 0, TAU);
    g.fillStyle = 'rgba(255,230,120,0.8)';
    g.fill();
    g.restore();
  }
  for (const s of S.shocks) {
    g.save();
    g.globalAlpha = Math.max(0, s.life / s.max);
    g.beginPath();
    g.arc(s.x, s.y, Math.max(1, s.r), 0, TAU);
    g.fillStyle = 'rgba(255,215,64,0.18)';
    g.fill();
    g.lineWidth = 5;
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = 3;
    g.strokeStyle = '#ffd54a';
    g.stroke();
    g.restore();
  }
}

function drawParticles(g) {
  for (const p of S.particles) {
    g.globalAlpha = Math.max(0, p.life / p.max);
    g.fillStyle = p.color;
    if (p.shard) {
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot || 0);
      g.fillRect(-p.s * 0.9, -p.s * 0.45, p.s * 1.8, p.s * 0.9);
      g.restore();
    } else {
      g.beginPath();
      g.arc(p.x, p.y, p.s * 0.8, 0, TAU);
      g.fill();
    }
  }
  g.globalAlpha = 1;
}

function drawTexts(g) {
  for (const t of S.texts) {
    g.save();
    g.globalAlpha = Math.max(0, t.life / t.max);
    outlined(g, t.text, t.x, t.y, t.size, t.color, 4);
    g.restore();
  }
}

function drawBanner(g) {
  if (!S.event || S.eventTimer <= 0) return;
  const t = S.eventTimer;
  const prog = 1 - t / CFG.EVENT_TIME;
  const alpha = Math.min(1, t / 0.4, prog * 6);
  const slide = Math.max(0, 1 - prog * 5) * 120;
  g.save();
  g.globalAlpha = Math.max(0, alpha);
  g.fillStyle = '#ffd54a';
  g.fillRect(0, 196, CFG.W, 104);
  g.lineWidth = 4;
  g.strokeStyle = INK;
  g.beginPath();
  g.moveTo(0, 198); g.lineTo(CFG.W, 198);
  g.moveTo(0, 298); g.lineTo(CFG.W, 298);
  g.stroke();
  outlined(g, S.event.name.toUpperCase(), CFG.W / 2 + slide, 236, 40, '#ffffff', 7);
  outlined(g, S.event.desc, CFG.W / 2 - slide, 276, 16, '#1d1410', 0);
  g.restore();
}

const LABELS = {
  Edge: 'Off map', Path: 'On the path', Tower: 'Too close to tower',
  Pylon: 'Pylon here', Funds: 'Not enough $'
};

function drawGhost(g) {
  if (!S.placing || !mouse.inside || S.over) return;
  const type = S.placing;
  const x = mouse.x;
  const y = mouse.y;
  const v = canPlaceAt(type, x, y);
  const range = CFG.TOWER[type].range * (evId() === 'emp' ? 0.85 : 1);
  g.save();
  if (v.ok) drawRange(g, x, y, range, 'rgba(255,255,255,0.16)', 'rgba(255,255,255,0.9)');
  else drawRange(g, x, y, range, 'rgba(255,60,80,0.14)', 'rgba(255,120,130,0.95)');
  g.globalAlpha = 0.75;
  drawTower(g, x, y, type, 0, -Math.PI / 2, !v.ok);
  g.globalAlpha = 1;
  if (!v.ok) outlined(g, LABELS[v.why] || 'Blocked', x, y - 30, 12, '#ffb3b8', 4);
  g.restore();
}

function drawPaused(g) {
  if (!S.paused || S.over) return;
  g.save();
  g.fillStyle = 'rgba(30,20,10,0.35)';
  g.fillRect(0, 0, CFG.W, CFG.H);
  g.beginPath();
  roundRectPath(g, CFG.W / 2 - 160, CFG.H / 2 - 70, 320, 120, 18);
  g.fillStyle = '#fff6df';
  g.fill();
  g.lineWidth = 4;
  g.strokeStyle = INK;
  g.stroke();
  outlined(g, 'PAUSED', CFG.W / 2, CFG.H / 2 - 18, 44, '#ffb020', 7);
  outlined(g, 'Press Space to resume', CFG.W / 2, CFG.H / 2 + 24, 15, '#1d1410', 0);
  g.restore();
}

// Health bar across the top of the field while a boss is alive.
function drawBossBar(g) {
  let boss = null;
  for (const e of S.enemies) {
    if (e.type === 'boss' && !e.dead) { boss = e; break; }
  }
  if (!boss || S.over) return;
  const w = 380;
  const h = 16;
  const x = (CFG.W - w) / 2;
  const y = 10;
  const pct = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
  g.save();
  g.beginPath();
  roundRectPath(g, x - 4, y - 4, w + 8, h + 8, 10);
  g.fillStyle = '#14112e';
  g.fill();
  g.lineWidth = 3;
  g.strokeStyle = INK;
  g.stroke();
  if (pct > 0) {
    g.beginPath();
    roundRectPath(g, x, y, w * pct, h, 6);
    g.fillStyle = '#ff3d7f';
    g.fill();
  }
  outlined(g, 'BOSS · ' + Math.ceil(Math.max(0, boss.hp)) + ' HP', CFG.W / 2, y + h / 2 + 1, 12, '#ffffff', 3);
  g.restore();
}

function render() {
  // Re-apply the device-pixel scale every frame (the context transform was being lost on high-DPI screens).
  const jx = S.shake > 0 ? (Math.random() * 2 - 1) * S.shake * 10 : 0;
  const jy = S.shake > 0 ? (Math.random() * 2 - 1) * S.shake * 10 : 0;
  ctx.setTransform(DPR, 0, 0, DPR, jx * DPR, jy * DPR);
  ctx.clearRect(0, 0, CFG.W, CFG.H);
  ctx.save();
  paintTerrain(ctx);
  ctx.restore();
  for (const p of S.pylons) drawPylon(ctx, p);
  const sel = selectedTower();
  if (sel) {
    const st = towerStats(sel);
    drawRange(ctx, sel.x, sel.y, st.range, 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0.85)');
  }
  for (const t of S.towers) drawTower(ctx, t.x, t.y, t.type, t.tier, t.angle, false, t.recoil, t.hop);
  drawSold(ctx);
  for (const e of S.enemies) drawBloon(ctx, e);
  drawShots(ctx);
  drawDarts(ctx);
  drawLasers(ctx);
  drawRings(ctx);
  drawPops(ctx);
  drawParticles(ctx);
  drawGhost(ctx);
  drawTexts(ctx);
  drawBanner(ctx);
  drawWaveBanner(ctx);
  drawBossBar(ctx);
  drawPaused(ctx);
}

/* ==================== UI ==================== */
const $ = function (id) { return document.getElementById(id); };
const el = {
  money: $('money'),
  lives: $('lives'),
  wave: $('wave'),
  evt: $('evt'),
  speedBtn: $('speedBtn'),
  pauseBtn: $('pauseBtn'),
  sfxBtn: $('sfxBtn'),
  preview: $('preview'),
  best: $('best'),
  ovBest: $('ovBest'),
  startBtn: $('startBtn'),
  autoChk: $('autoChk'),
  shop: $('shop'),
  noSel: $('noSel'),
  selBox: $('selBox'),
  selName: $('selName'),
  pips: Array.prototype.slice.call(document.querySelectorAll('#selPips .pip')),
  stDmg: $('stDmg'),
  stRange: $('stRange'),
  stRate: $('stRate'),
  stInv: $('stInv'),
  stNote: $('stNote'),
  upBtn: $('upBtn'),
  upPrev: $('upPrev'),
  sellBtn: $('sellBtn'),
  tgtBtns: Array.prototype.slice.call(document.querySelectorAll('#tgt button')),
  over: $('over'),
  ovWave: $('ovWave'),
  restartBtn: $('restartBtn'),
  dailyBtn: $('dailyBtn'),
  pathRow: $('pathRow'),
  pathA: $('pathA'),
  pathB: $('pathB')
};

const shopCards = {};

function drawIcon(g, type) {
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.clearRect(0, 0, 48, 48);
  g.save();
  g.translate(24, 24);
  g.beginPath();
  roundRectPath(g, -23, -23, 46, 46, 10);
  g.fillStyle = '#f7e3b5';
  g.fill();
  g.lineWidth = 2.5;
  g.strokeStyle = INK;
  g.stroke();
  g.scale(0.62, 0.62);
  drawTower(g, 0, 0, type, 0, 0, false);
  g.restore();
}

function tipText(type) {
  const d = CFG.TOWER[type];
  const st = towerStats({ type: type, tier: 0 });
  return d.name + ': range ' + Math.round(st.range) + ', damage ' + (Math.round(st.dmg * 10) / 10) +
    ', ' + (Math.round(st.rate * 100) / 100) + ' shots/s. ' + d.desc;
}

function buildShop() {
  el.shop.innerHTML = '';
  for (const type of Object.keys(CFG.TOWER)) {
    const d = CFG.TOWER[type];
    const card = document.createElement('div');
    card.className = 'card';
    card.title = tipText(type);
    const ic = document.createElement('canvas');
    ic.width = 48 * DPR;
    ic.height = 48 * DPR;
    ic.style.width = '48px';
    ic.style.height = '48px';
    ic.className = 'icon';
    drawIcon(ic.getContext('2d'), type);
    const info = document.createElement('div');
    info.className = 'cinfo';
    const row = document.createElement('div');
    row.className = 'crow';
    const nm = document.createElement('div');
    nm.className = 'cname';
    nm.textContent = d.name;
    const cost = document.createElement('div');
    cost.className = 'ccost';
    const desc = document.createElement('div');
    desc.className = 'cdesc';
    desc.textContent = d.tag;
    row.appendChild(nm);
    row.appendChild(cost);
    info.appendChild(row);
    info.appendChild(desc);
    card.appendChild(ic);
    card.appendChild(info);
    card.addEventListener('click', function () {
      pickTower(type);
    });
    el.shop.appendChild(card);
    shopCards[type] = { card: card, cost: cost };
  }
}

const SCORE_KEY = 'neonTD.scores';

function loadScores() {
  try {
    const v = JSON.parse(window.localStorage.getItem(SCORE_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

function saveScores(list) {
  try {
    window.localStorage.setItem(SCORE_KEY, JSON.stringify(list));
  } catch (e) {
    /* storage unavailable: scores just won't persist */
  }
}

function recordScore() {
  const list = loadScores();
  list.push({ wave: S.wave, kills: S.kills, map: MAPS[MAP_INDEX].name, daily: S.daily, date: new Date().toISOString().slice(0, 10) });
  list.sort(function (a, b) { return (b.wave - a.wave) || (b.kills - a.kills); });
  const top = list.slice(0, 5);
  saveScores(top);
  return top;
}

function renderScores(top) {
  const lists = [$('hsList'), $('ovHs')];
  lists.forEach(function (ol) {
    ol.innerHTML = '';
    if (!top.length) {
      const li = document.createElement('li');
      li.textContent = 'No runs yet';
      ol.appendChild(li);
      return;
    }
    top.forEach(function (r) {
      const li = document.createElement('li');
      li.textContent = 'Wave ' + r.wave + ' \u00b7 ' + r.kills + ' pops ';
      const meta = document.createElement('span');
      meta.textContent = (r.daily ? 'Daily · ' : '') + r.map + ' ' + r.date.slice(5);
      li.appendChild(meta);
      ol.appendChild(li);
    });
  });
}

function buildMapBtns() {
  const row = $('mapBtns');
  MAPS.forEach(function (m, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = m.name;
    b.addEventListener('click', function () {
      dailyMode = false;
      selectMap(i);
    });
    row.appendChild(b);
    mapBtnEls.push(b);
  });
}

function setText(node, value) {
  const str = String(value);
  if (node.textContent !== str) node.textContent = str;
}

let previewWave = -1;

function setPreview() {
  const w = S.wave + 1;
  if (w === previewWave) return;
  previewWave = w;
  const total = waveCount(w);
  const c = spawnChances(w);
  const boss = w % 5 === 0 ? 1 : 0;
  let left = total - boss;
  const counts = {};
  const order = [['behemoth', c.pBeh], ['tank', c.pTank], ['armored', c.pArm], ['swarm', c.pSwarm], ['shielded', c.pShield], ['soldier', c.pSol]];
  for (const x of order) {
    const n = Math.min(left, Math.round(total * x[1]));
    counts[x[0]] = n;
    left -= n;
  }
  counts.scout = left;
  counts.boss = boss;
  const row = ['scout', 'soldier', 'armored', 'tank', 'swarm', 'shielded', 'behemoth', 'boss']
    .filter(function (k) { return counts[k] > 0; })
    .map(function (k) {
      return '<span class="dotN"><i class="dot" style="background:' + CFG.ENEMY[k].color + '"></i>' + counts[k] + '</span>';
    }).join(' ');
  let html = 'Wave ' + w + ': <b>' + total + '</b> foes' + (boss ? ', <b>BOSS</b> leads' : '') +
    '<br>' + row + '<br>Enemy HP x' + hpMult(w).toFixed(1);
  if (w >= CFG.EVENT_MIN_WAVE) html += ' · ' + Math.round(CFG.EVENT_CHANCE * 100) + '% event';
  el.preview.innerHTML = html;
}

function fmt1(v) {
  return String(Math.round(v * 10) / 10);
}

function refreshUI() {
  setText(el.money, '$' + S.money);
  setText(el.lives, S.lives);
  setText(el.wave, S.wave);
  setText(el.best, best);
  setText(el.evt, S.event ? (S.event.name + ': ' + S.event.desc) : 'No event');
  el.evt.classList.toggle('on', !!S.event);
  setText(el.speedBtn, 'SPEED ' + S.speed + 'x');
  setText(el.pauseBtn, S.paused ? 'RESUME' : 'PAUSE');
  el.pauseBtn.classList.toggle('on', S.paused);
  setText(el.sfxBtn, SFX.on ? 'SOUND ON' : 'SOUND OFF');
  el.sfxBtn.classList.toggle('off', !SFX.on);
  setPreview();
  el.startBtn.disabled = S.waveActive || S.over || S.paused;
  const nextWave = S.wave + 1;
  let startLabel = 'START WAVE ' + nextWave;
  if (nextWave % 5 === 0) startLabel = 'START BOSS WAVE ' + nextWave;
  if (S.auto && !S.waveActive && S.wave > 0 && S.autoTimer > 0 && !S.over) {
    startLabel = 'CALL WAVE ' + nextWave + ' EARLY +$' + (5 + S.wave * 2);
  }
  if (S.waveActive) startLabel = 'WAVE ' + S.wave + ' IN PROGRESS';
  setText(el.startBtn, startLabel);

  for (const type of Object.keys(shopCards)) {
    const sc = shopCards[type];
    const c = towerCost(type);
    // During EMP the original price is struck through beside the discounted one, so the label stays short.
    const emp = evId() === 'emp';
    const base = CFG.TOWER[type].cost;
    const key = emp ? base + '>' + c : String(c);
    if (sc.cost.dataset.k !== key) {
      sc.cost.dataset.k = key;
      sc.cost.innerHTML = emp ? '<s>$' + base + '</s> $' + c : '$' + c;
    }
    sc.card.classList.toggle('sel', S.placing === type);
    sc.card.classList.toggle('poor', S.money < c);
  }

  const lockMaps = S.wave > 0 || S.waveActive;
  mapBtnEls.forEach(function (b, i) {
    b.disabled = lockMaps;
    b.classList.toggle('active', !dailyMode && i === MAP_INDEX);
  });
  setText(el.dailyBtn, dailyMode ? 'Daily ON · ' + dailyDate() : 'Daily challenge');
  el.dailyBtn.disabled = lockMaps;
  el.dailyBtn.classList.toggle('on', dailyMode);
  const t = selectedTower();
  el.noSel.style.display = t ? 'none' : 'flex';
  el.selBox.style.display = t ? 'grid' : 'none';
  if (!t) return;

  const st = towerStats(t);
  const d = CFG.TOWER[t.type];
  setText(el.selName, d.name);
  el.pips.forEach(function (p, i) { p.classList.toggle('on', i < t.tier); });
  setText(el.stDmg, fmt1(st.dmg));
  setText(el.stRange, Math.round(st.range));
  setText(el.stRate, (Math.round(st.rate * 100) / 100) + '/s');
  setText(el.stInv, '$' + t.invested);
  let note;
  if (t.type === 'plasma') note = 'Splash radius ' + Math.round(st.splash);
  else if (t.type === 'stasis') note = 'Slows to ' + Math.round(st.slowMult * 100) + '% for ' + st.slowT + 's';
  else if (t.type === 'sniper') note = st.pierce ? 'Ignores armor' : 'Targets the furthest foe';
  else if (t.type === 'tack') note = 'Hits up to ' + st.targets + ' foes';
  else note = st.targets > 1 ? 'Hits up to ' + st.targets + ' foes' : '';
  if (t.path) note = PATHS[t.type][t.path].name;
  else if (t.tier === 2) note = 'A ' + PATHS[t.type].A.name + ' / B ' + PATHS[t.type].B.name;
  setText(el.stNote, note);
  el.stNote.title = t.path ? PATHS[t.type][t.path].desc : '';
  const pathing = t.tier === 2 && !t.path;
  el.upBtn.style.display = pathing ? 'none' : '';
  el.pathRow.style.display = pathing ? 'flex' : 'none';
  if (pathing) {
    const uc = upgradeCost(t);
    const opts = PATHS[t.type];
    el.pathA.title = opts.A.name + ': ' + opts.A.desc + ' ($' + uc + ')';
    el.pathB.title = opts.B.name + ': ' + opts.B.desc + ' ($' + uc + ')';
    el.pathA.disabled = S.over || S.money < uc;
    el.pathB.disabled = S.over || S.money < uc;
    setText(el.upPrev, 'Choose a path for $' + uc);
  } else if (t.tier >= 3) {
    setText(el.upBtn, 'Max tier');
    setText(el.upPrev, 'Fully upgraded');
    el.upBtn.title = '';
    el.upBtn.disabled = true;
  } else {
    const uc = upgradeCost(t);
    const nx = towerStats({ type: t.type, tier: t.tier + 1 });
    setText(el.upBtn, 'Tier ' + (t.tier + 1) + ' · $' + uc);
    setText(el.upPrev, 'Next: dmg ' + fmt1(st.dmg) + ' → ' + fmt1(nx.dmg) +
      ' · range ' + Math.round(st.range) + ' → ' + Math.round(nx.range));
    el.upBtn.title = 'Upgrade to Tier ' + (t.tier + 1) + ' for $' + uc;
    el.upBtn.disabled = S.over || S.money < uc;
  }
  setText(el.sellBtn, 'Sell $' + Math.floor(t.invested * CFG.SELL_RATE));
  el.tgtBtns.forEach(function (x) { x.classList.toggle('active', x.dataset.t === t.target); });
}

function cycleSpeed() {
  S.speedIdx = (S.speedIdx + 1) % CFG.SPEEDS.length;
  S.speed = CFG.SPEEDS[S.speedIdx];
  sfx('click');
}

function togglePause() {
  if (S.over) return;
  S.paused = !S.paused;
  sfx('click');
}

function toggleSfx() {
  SFX.on = !SFX.on;
  prefs.sfx = SFX.on;
  savePrefs(prefs);
  sfx('click');
}

function toggleDaily() {
  if (S.wave > 0 || S.waveActive) return;
  dailyMode = !dailyMode;
  if (dailyMode && MAP_INDEX !== 0) selectMap(0);
  else resetGame();
  sfx('click');
}

function pickTower(type) {
  if (S.over) return;
  S.placing = S.placing === type ? null : type;
  S.selectedId = null;
}

function cancelAll() {
  S.placing = null;
  S.selectedId = null;
}

function setupInput() {
  canvas.addEventListener('pointermove', function (e) {
    const p = toCanvas(e);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.inside = true;
    canvas.style.cursor = (!S.over && pylonAt(p.x, p.y)) ? 'pointer' : 'crosshair';
  });
  canvas.addEventListener('pointerleave', function (e) {
    if (e.pointerType === 'mouse') mouse.inside = false;
  });
  canvas.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button === 2) { cancelAll(); return; }
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const p = toCanvas(e);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.inside = true;
    onCanvasClick(p, e.shiftKey);
  });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', function (e) {
    unlockAudio();
    const a = document.activeElement;
    if (a && (a.tagName === 'BUTTON' || a.tagName === 'INPUT')) a.blur();
    if (e.key === 'Escape') { cancelAll(); return; }
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
    if (e.key === ' ') togglePause();
    else if (e.key === 'Enter') startWave(true);
    else if (k === 's') cycleSpeed();
    else if (k === 'm') toggleSfx();
    else if (k === 'u') upgradeTower(selectedTower());
    else if (/^[1-5]$/.test(e.key)) pickTower(Object.keys(CFG.TOWER)[Number(e.key) - 1]);
  });

  el.startBtn.addEventListener('click', function () { startWave(true); });
  el.dailyBtn.addEventListener('click', toggleDaily);
  el.pathA.addEventListener('click', function () { upgradeTower(selectedTower(), 'A'); });
  el.pathB.addEventListener('click', function () { upgradeTower(selectedTower(), 'B'); });
  el.speedBtn.addEventListener('click', cycleSpeed);
  el.pauseBtn.addEventListener('click', togglePause);
  el.sfxBtn.addEventListener('click', toggleSfx);
  el.autoChk.addEventListener('change', function () {
    S.auto = el.autoChk.checked;
    prefs.auto = S.auto;
    savePrefs(prefs);
    S.autoTimer = CFG.AUTO_DELAY;
  });
  el.upBtn.addEventListener('click', function () { upgradeTower(selectedTower()); });
  el.sellBtn.addEventListener('click', function () {
    const t = selectedTower();
    if (t) sellTower(t);
  });
  el.tgtBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      const t = selectedTower();
      if (t) t.target = b.dataset.t;
    });
  });
  el.restartBtn.addEventListener('click', resetGame);
  // Pause automatically when the tab is hidden so waves don't run unseen.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !S.paused && !S.over) S.paused = true;
  });
}

function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (CFG.W / r.width),
    y: (e.clientY - r.top) * (CFG.H / r.height)
  };
}

function onCanvasClick(p, shift) {
  if (S.over) return;
  const py = pylonAt(p.x, p.y);
  if (py) {
    if (py.cd <= 0) triggerPylon(py);
    else addText(py.x, py.y - 26, 'Recharging ' + Math.ceil(py.cd) + 's', '#5a6b8c', 1, 12);
    return;
  }
  const tw = towerAt(p.x, p.y);
  if (tw) {
    S.selectedId = tw.id;
    S.placing = null;
    return;
  }
  if (S.placing) {
    const v = canPlaceAt(S.placing, p.x, p.y);
    if (v.ok) {
      placeTower(S.placing, p.x, p.y);
      if (!shift) S.placing = null;
    } else {
      sfx('deny');
      addText(p.x, p.y - 22, v.why === 'Funds' ? 'Not enough $' : 'Blocked', '#c62828', 0.9, 12);
    }
    return;
  }
  S.selectedId = null;
}

/* ==================== INIT / RESET / LOOP ==================== */
function resetGame() {
  S = newState();
  if (dailyMode) {
    S.rand = rng(dailySeed());
    S.daily = true;
  }
  el.over.style.display = 'none';
  S.auto = !!prefs.auto;
  el.autoChk.checked = S.auto;
  el.ovWave.textContent = '0';
  refreshUI();
}

let lastTs = 0;
function frame(ts) {
  const raw = lastTs ? (ts - lastTs) / 1000 : 0;
  lastTs = ts;
  const dt = Math.min(Math.max(raw, 0), CFG.DT_MAX);
  if (!S.over && !S.paused) {
    const steps = S.speed;
    for (let i = 0; i < steps && !S.over; i++) update(dt);
  }
  render();
  refreshUI();
  requestAnimationFrame(frame);
}

buildPath();
LAYOUT = buildLayout();
buildShop();
buildMapBtns();
renderScores(loadScores());
setupInput();
resetGame();
requestAnimationFrame(frame);

})();
