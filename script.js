/* ══════════════════════════════════════════════════
   AKASH — SCIENCE LAB · main script
   ══════════════════════════════════════════════════ */

/* ── CUSTOMIZATION ─────────────────────────────
   Change your name / GitHub / facts / colors here.
   (Colors live in style.css :root block.)        */
const CONFIG = {
  name: "AKASH",
  githubUser: "YOUR_GITHUB_USERNAME",
  facts: [
    "A day on Venus is longer than a year on Venus — it rotates that slowly.",
    "Black holes are not cosmic vacuum cleaners — objects orbit them just like anything else.",
    "Your body contains around 7 × 10²⁷ atoms. That's more than the stars in the observable universe.",
    "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
    "Honey never spoils — archaeologists have tasted 3,000-year-old honey from Egyptian tombs.",
    "There is enough DNA in your body to stretch to the Sun and back more than 60 times.",
    "Neutron stars are so dense that one teaspoon would weigh about six billion tons.",
    "AI models learn the same way you do — by trial, error, and a lot of repetition.",
    "Water is the only common substance that expands when it freezes.",
    "The observable universe contains roughly two trillion galaxies."
  ]
};

// apply GitHub links
document.querySelectorAll(".js-github").forEach(a => {
  a.href = "https://github.com/" + CONFIG.githubUser;
});

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TAU = Math.PI * 2;

/* ═══════════ LOADER ═══════════ */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("done"), 900);
});
// safety fallback
setTimeout(() => document.getElementById("loader").classList.add("done"), 3500);

/* ═══════════ NAVBAR ═══════════ */
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("nav-toggle");
const navList = document.getElementById("nav-list");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

navToggle.addEventListener("click", () => {
  const open = navList.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", open);
});
navList.querySelectorAll(".nav-link").forEach(a =>
  a.addEventListener("click", () => {
    navList.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

/* ═══════════ CURSOR GLOW ═══════════ */
const glowEl = document.getElementById("cursorGlow");
window.addEventListener("pointermove", e => {
  glowEl.style.left = e.clientX + "px";
  glowEl.style.top = e.clientY + "px";
}, { passive: true });

/* ═══════════ SCROLL REVEAL ═══════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("visible"); revealObs.unobserve(en.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));

/* ═══════════ CANVAS SETUP HELPERS ═══════════ */
function fitCanvas(cv, hScale = 1) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth || cv.parentElement.clientWidth;
  const h = Math.round(w * hScale);
  cv.width = w * dpr;
  cv.height = h * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

/* ═══════════ STARFIELD (hero background) ═══════════ */
const bgCv = document.getElementById("bgCanvas");
let bgCtx, bgW, bgH, stars = [];

function initStars() {
  ({ ctx: bgCtx, w: bgW, h: bgH } = fitCanvas(bgCv, window.innerHeight / window.innerWidth));
  const count = Math.min(180, Math.round(bgW * bgH / 9000));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * bgW,
    y: Math.random() * bgH,
    r: Math.random() * 1.4 + 0.3,
    d: Math.random() * 0.6 + 0.15,      // parallax depth
    tw: Math.random() * TAU,
    ts: 0.5 + Math.random() * 1.5
  }));
}

function drawStars(t) {
  bgCtx.clearRect(0, 0, bgW, bgH);
  const px = mouseNX * 14, py = mouseNY * 10; // parallax offset
  for (const s of stars) {
    const tw = prefersReduced ? 0.8 : 0.45 + 0.55 * Math.sin(t * 0.001 * s.ts + s.tw);
    bgCtx.globalAlpha = tw * s.d;
    bgCtx.fillStyle = s.d > 0.5 ? "#d9ccff" : "#8fa8ff";
    bgCtx.beginPath();
    bgCtx.arc(s.x + px * s.d, s.y + py * s.d, s.r, 0, TAU);
    bgCtx.fill();
  }
  bgCtx.globalAlpha = 1;
}

/* ═══════════ 3D BLACK HOLE ═══════════ */
const bhCv = document.getElementById("bhCanvas");
let bhCtx, bhW, bhH;
let bhTiltX = 0, bhTiltY = 0;         // smooth tilt
let mouseNX = 0, mouseNY = 0;         // -1..1 normalized
const disk = [];

function initBlackHole() {
  ({ ctx: bhCtx, w: bhW, h: bhH } = fitCanvas(bhCv, window.innerHeight / window.innerWidth));
  disk.length = 0;
  for (let i = 0; i < 220; i++) {
    disk.push({
      a: Math.random() * TAU,
      r: 1.16 + Math.random() * 1.15,          // radius in units of horizon R
      sp: (0.25 + Math.random() * 0.5),
      hue: 262 + Math.random() * 60,           // violet → blue
      size: 0.8 + Math.random() * 1.8
    });
  }
}

function drawBlackHole(t) {
  bhCtx.clearRect(0, 0, bhW, bhH);
  const cx = bhW / 2 + mouseNX * 18;
  const cy = bhH * 0.46 + mouseNY * 14;
  const R = Math.min(bhW, bhH) * 0.185;
  const squash = 0.34;

  // smooth tilt toward pointer
  const targetTX = mouseNY * 0.5, targetTY = mouseNX * 0.5;
  bhTiltX += (targetTX - bhTiltX) * 0.05;
  bhTiltY += (targetTY - bhTiltY) * 0.05;

  const proj = p => {
    const rot = bhTiltY * 0.6;
    const x0 = Math.cos(p.a + rot) * p.r * R;
    let y0 = Math.sin(p.a + rot) * p.r * R * squash;
    y0 = y0 * Math.cos(bhTiltX) + x0 * Math.sin(bhTiltX) * 0.15;
    return { x: cx + x0, y: cy + y0, front: Math.sin(p.a + rot) > 0 };
  };

  // outer glow
  let g = bhCtx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 3.6);
  g.addColorStop(0, "rgba(168,85,247,0.34)");
  g.addColorStop(0.4, "rgba(88,60,220,0.16)");
  g.addColorStop(0.75, "rgba(56,189,248,0.05)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  bhCtx.fillStyle = g;
  bhCtx.fillRect(cx - R * 4, cy - R * 4, R * 8, R * 8);

  // accretion disk — BACK half
  for (const p of disk) {
    const q = proj(p);
    if (!q.front) {
      const heat = 1 - Math.min(1, (p.r - 1.16) / 1.15);
      bhCtx.fillStyle = `hsla(${p.hue},90%,${45 + heat * 22}%,${0.35 + heat * 0.4})`;
      bhCtx.beginPath(); bhCtx.arc(q.x, q.y, p.size * (0.7 + heat * 0.5), 0, TAU); bhCtx.fill();
    }
  }

  // photon ring (brightest just outside horizon)
  g = bhCtx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.18);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.45, "rgba(220,200,255,0.85)");
  g.addColorStop(0.6, "rgba(140,90,255,0.5)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  bhCtx.fillStyle = g;
  bhCtx.beginPath(); bhCtx.arc(cx, cy, R * 1.2, 0, TAU); bhCtx.fill();

  // event horizon
  g = bhCtx.createRadialGradient(cx, cy, 0, cx, cy, R);
  g.addColorStop(0, "#000");
  g.addColorStop(0.85, "#000");
  g.addColorStop(1, "rgba(10,4,26,1)");
  bhCtx.fillStyle = g;
  bhCtx.beginPath(); bhCtx.arc(cx, cy, R, 0, TAU); bhCtx.fill();

  // subtle rim shadow to separate horizon from ring
  bhCtx.strokeStyle = "rgba(0,0,0,0.9)";
  bhCtx.lineWidth = 2;
  bhCtx.beginPath(); bhCtx.arc(cx, cy, R, 0, TAU); bhCtx.stroke();

  // accretion disk — FRONT half (brighter, slightly larger)
  for (const p of disk) {
    const q = proj(p);
    if (q.front) {
      const heat = 1 - Math.min(1, (p.r - 1.16) / 1.15);
      bhCtx.fillStyle = `hsla(${p.hue - 12},95%,${52 + heat * 22}%,${0.5 + heat * 0.5})`;
      bhCtx.shadowColor = `hsla(${p.hue},95%,60%,0.8)`;
      bhCtx.shadowBlur = heat > 0.7 ? 10 : 4;
      bhCtx.beginPath(); bhCtx.arc(q.x, q.y, p.size * (0.8 + heat * 0.6), 0, TAU); bhCtx.fill();
      bhCtx.shadowBlur = 0;
    }
  }

  // advance particles
  if (!prefersReduced) {
    for (const p of disk) p.a += 0.008 * p.sp * (1.6 / p.r);
  }
}

/* pointer → normalized coords (hero area) */
const hero = document.getElementById("home");
hero.addEventListener("pointermove", e => {
  const r = hero.getBoundingClientRect();
  mouseNX = ((e.clientX - r.left) / r.width - 0.5) * 2;
  mouseNY = ((e.clientY - r.top) / r.height - 0.5) * 2;
}, { passive: true });
hero.addEventListener("pointerleave", () => { mouseNX = 0; mouseNY = 0; });

/* ═══════════ MAIN ANIMATION LOOP ═══════════ */
function loop(t) {
  if (!document.hidden) {
    drawStars(t);
    drawBlackHole(t);
    drawOrbGame();
    drawAtom();
  }
  requestAnimationFrame(loop);
}

function initCanvases() {
  initStars();
  initBlackHole();
  initOrbGame();
  initAtom();
}
window.addEventListener("resize", initCanvases);
initCanvases();
requestAnimationFrame(loop);

/* ═══════════ LAB MODAL ═══════════ */
const LAB_DATA = {
  astronomy: {
    icon: "✦", title: "ASTRONOMY MODULE",
    body: "Ever since I was a kid, the night sky has been my favorite question. Astronomy is where I started: black holes bending time, galaxies colliding across billions of years, light that left its star before Earth even existed. Every photon that hits your eye is a time machine. This module is my attempt to hold a tiny piece of that infinity.",
    tags: ["BLACK HOLES", "GALAXIES", "DEEP TIME"]
  },
  physics: {
    icon: "◉", title: "PHYSICS MODULE",
    body: "Physics is the rulebook of the universe — and I've always wanted to read it. From Newton's falling apple to particles that exist in two places at once, physics turns 'that's weird' into 'that's math.' It's the subject that taught me the universe doesn't have to make sense to my intuition… only to its own equations.",
    tags: ["QUANTUM", "RELATIVITY", "ENERGY"]
  },
  chemistry: {
    icon: "⚗", title: "CHEMISTRY MODULE",
    body: "Chemistry is alchemy with a periodic table. It's the reason fireworks burn gold, why rust forms, and how a handful of elements rearrange themselves into everything — including you. Reactions are tiny stories: reactants meet, bonds break, something new is born. I've always loved that narrative hidden in the equations.",
    tags: ["ATOMS", "BONDS", "REACTIONS"]
  },
  biology: {
    icon: "❋", title: "BIOLOGY MODULE",
    body: "Biology is the study of the most improbable thing in the universe: life. Every cell in your body runs on code older than the dinosaurs, written in DNA. Evolution spent 3.8 billion years debugging that code without a single meeting. Understanding biology feels like reading the source code of existence itself.",
    tags: ["DNA", "EVOLUTION", "CELLS"]
  },
  ai: {
    icon: "⌬", title: "AI MODULE",
    body: "Artificial intelligence is where my curiosity becomes hands-on. For the first time in history, we can build minds — or at least very good imitations of parts of them. I explore how machines learn from data, why they sometimes fail hilariously, and what it means to create something that thinks. This website itself is a small artifact of that journey.",
    tags: ["MACHINE LEARNING", "NEURAL NETS", "FUTURE"]
  }
};

const modal = document.getElementById("labModal");
let lastFocus = null;

function openModal(key) {
  const d = LAB_DATA[key];
  if (!d) return;
  document.getElementById("modalIcon").textContent = d.icon;
  document.getElementById("modalTitle").textContent = d.title;
  document.getElementById("modalBody").textContent = d.body;
  document.getElementById("modalTags").innerHTML =
    d.tags.map(t => `<span>${t}</span>`).join("");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  lastFocus = document.activeElement;
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-close").focus();
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
document.querySelectorAll(".lab-card").forEach(card => {
  card.addEventListener("click", () => openModal(card.dataset.lab));
  // 3D tilt
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--mx", x * 100 + "%");
    card.style.setProperty("--my", y * 100 + "%");
    if (e.pointerType === "mouse") {
      card.style.transform =
        `rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 12}deg) translateZ(8px)`;
    }
  });
  card.addEventListener("pointerleave", () => { card.style.transform = ""; });
});
modal.querySelectorAll("[data-close]").forEach(el =>
  el.addEventListener("click", closeModal));
window.addEventListener("keydown", e => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

/* ═══════════ DID YOU KNOW ═══════════ */
const factText = document.getElementById("factText");
const factBtn = document.getElementById("factBtn");
let factIdx = Math.floor(Math.random() * CONFIG.facts.length);
factText.textContent = CONFIG.facts[factIdx];

factBtn.addEventListener("click", () => {
  factText.classList.add("fading");
  setTimeout(() => {
    let next;
    do { next = Math.floor(Math.random() * CONFIG.facts.length); } while (next === factIdx);
    factIdx = next;
    factText.textContent = CONFIG.facts[factIdx];
    factText.classList.remove("fading");
  }, 360);
});

/* ══════════════════════════════════════════
   GAME 1 — ORBITAL RUN
   ══════════════════════════════════════════ */
const orbCv = document.getElementById("orbCanvas");
let orbCtx, orbW = 480, orbH = 340;
const ship = { x: 240, y: 170, vx: 0, vy: 0 };
const keys = {};
const touchDir = { up: false, down: false, left: false, right: false };
let orbs = [], orbScore = 0, orbWon = false;
const g1Msg = document.getElementById("g1Msg");
const g1ScoreEl = document.getElementById("g1Score");

function initOrbGame() {
  orbCtx = orbCv.getContext("2d");
  resetOrbGame();
}
function resetOrbGame() {
  ship.x = orbW / 2; ship.y = orbH / 2; ship.vx = 0; ship.vy = 0;
  orbScore = 0; orbWon = false;
  orbs = [];
  while (orbs.length < 3) {
    const o = { x: 40 + Math.random() * (orbW - 80), y: 40 + Math.random() * (orbH - 80) };
    if (Math.hypot(o.x - ship.x, o.y - ship.y) > 110 &&
        orbs.every(q => Math.hypot(o.x - q.x, o.y - q.y) > 70)) orbs.push(o);
  }
  g1ScoreEl.textContent = "0";
  g1Msg.classList.remove("show");
}
document.getElementById("g1Reset").addEventListener("click", resetOrbGame);

window.addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });

document.querySelectorAll(".tp-btn").forEach(btn => {
  const dir = btn.dataset.dir;
  const on = e => { e.preventDefault(); touchDir[dir] = true; btn.classList.add("pressed"); };
  const off = () => { touchDir[dir] = false; btn.classList.remove("pressed"); };
  btn.addEventListener("pointerdown", on);
  btn.addEventListener("pointerup", off);
  btn.addEventListener("pointerleave", off);
  btn.addEventListener("pointercancel", off);
});

function drawOrbGame() {
  if (!orbCtx) return;
  const c = orbCtx;
  c.clearRect(0, 0, orbW, orbH);

  // starfield
  c.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 40; i++) {
    const sx = (i * 97.3) % orbW, sy = (i * 57.7) % orbH;
    c.globalAlpha = 0.15 + 0.25 * Math.sin(i * 3.3);
    c.fillRect(sx, sy, 1.4, 1.4);
  }
  c.globalAlpha = 1;

  // grid glow lines
  c.strokeStyle = "rgba(124,58,237,0.07)";
  for (let x = 0; x < orbW; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, orbH); c.stroke(); }
  for (let y = 0; y < orbH; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(orbW, y); c.stroke(); }

  if (!orbWon) {
    // input
    const ax = (keys["arrowright"] || keys["d"] || touchDir.right ? 1 : 0) -
               (keys["arrowleft"] || keys["a"] || touchDir.left ? 1 : 0);
    const ay = (keys["arrowdown"] || keys["s"] || touchDir.down ? 1 : 0) -
               (keys["arrowup"] || keys["w"] || touchDir.up ? 1 : 0);
    ship.vx += ax * 0.32; ship.vy += ay * 0.32;
    ship.vx *= 0.93; ship.vy *= 0.93;
    ship.x = Math.max(12, Math.min(orbW - 12, ship.x + ship.vx));
    ship.y = Math.max(12, Math.min(orbH - 12, ship.y + ship.vy));
  }

  // energy nodes
  orbs.forEach(o => {
    const pulse = 6 + Math.sin(performance.now() * 0.004 + o.x) * 1.6;
    const g = c.createRadialGradient(o.x, o.y, 0, o.x, o.y, pulse * 3);
    g.addColorStop(0, "rgba(56,189,248,0.9)");
    g.addColorStop(0.4, "rgba(124,58,237,0.5)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.beginPath(); c.arc(o.x, o.y, pulse * 3, 0, TAU); c.fill();
    c.fillStyle = "#bfe9ff";
    c.beginPath(); c.arc(o.x, o.y, 4, 0, TAU); c.fill();

    if (!orbWon && Math.hypot(ship.x - o.x, ship.y - o.y) < 17) {
      orbs.splice(orbs.indexOf(o), 1);
      orbScore++;
      g1ScoreEl.textContent = orbScore;
      if (orbScore >= 3) {
        orbWon = true;
        g1Msg.textContent = "⚡ ALL ENERGY COLLECTED — MISSION COMPLETE";
        g1Msg.classList.remove("bad");
        g1Msg.classList.add("show");
      }
    }
  });

  // ship
  c.save();
  c.translate(ship.x, ship.y);
  c.rotate(Math.atan2(ship.vy, ship.vx || 0.0001) * (Math.abs(ship.vx) + Math.abs(ship.vy) > 0.4 ? 1 : 0));
  // engine flame
  if (!orbWon && (Math.abs(ship.vx) + Math.abs(ship.vy) > 0.6)) {
    c.fillStyle = "rgba(56,189,248,0.8)";
    c.beginPath(); c.moveTo(-8, -3); c.lineTo(-16 - Math.random() * 6, 0); c.lineTo(-8, 3); c.fill();
  }
  c.fillStyle = "#e9e2ff";
  c.strokeStyle = "rgba(168,85,247,0.9)";
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(12, 0); c.lineTo(-8, -8); c.lineTo(-4, 0); c.lineTo(-8, 8);
  c.closePath(); c.fill(); c.stroke();
  c.restore();
}

/* ══════════════════════════════════════════
   GAME 2 — ATOM BUILDER
   ══════════════════════════════════════════ */
const atomCv = document.getElementById("atomCanvas");
let atomCtx;
const atom = { p: 0, n: 0, e: 0 };
const pVal = document.getElementById("pVal");
const nVal = document.getElementById("nVal");
const eVal = document.getElementById("eVal");
const g2Msg = document.getElementById("g2Msg");
let g2Won = false;

function initAtom() {
  atomCtx = atomCv.getContext("2d");
}
function resetAtom() {
  atom.p = 0; atom.n = 0; atom.e = 0; g2Won = false;
  updateAtomUI();
  g2Msg.classList.remove("show");
}
document.getElementById("g2Reset").addEventListener("click", resetAtom);

document.querySelectorAll(".ctrl-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    const d = parseInt(btn.dataset.delta, 10);
    atom[type] = Math.max(0, Math.min(12, atom[type] + d));
    updateAtomUI();
  });
});
function updateAtomUI() {
  pVal.textContent = atom.p;
  nVal.textContent = atom.n;
  eVal.textContent = atom.e;
  if (atom.p === 6 && atom.n === 6 && atom.e === 6 && !g2Won) {
    g2Won = true;
    g2Msg.textContent = "⚛ CARBON-12 ACHIEVED — PERFECT ATOM";
    g2Msg.classList.remove("bad");
    g2Msg.classList.add("show");
  } else if (g2Won && !(atom.p === 6 && atom.n === 6 && atom.e === 6)) {
    g2Won = false;
    g2Msg.classList.remove("show");
  }
}
function drawAtom() {
  if (!atomCtx) return;
  const c = atomCtx;
  const W = 300, H = 300, cx = W / 2, cy = H / 2;
  c.clearRect(0, 0, W, H);
  const t = prefersReduced ? 0 : performance.now() * 0.001;

  // orbit rings
  c.strokeStyle = "rgba(168,130,255,0.25)";
  c.setLineDash([4, 6]);
  [50, 95].forEach(r => { c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke(); });
  c.setLineDash([]);

  // nucleus
  const nuc = [];
  for (let i = 0; i < atom.p; i++) nuc.push({ type: "p", k: i });
  for (let i = 0; i < atom.n; i++) nuc.push({ type: "n", k: i });
  nuc.forEach((q, i) => {
    const ang = (i / Math.max(nuc.length, 1)) * TAU + 0.7;
    const rad = nuc.length > 1 ? 11 : 0;
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad;
    c.shadowBlur = 12;
    if (q.type === "p") {
      c.shadowColor = "#ff5f8f"; c.fillStyle = "#ff87ab";
    } else {
      c.shadowColor = "#38bdf8"; c.fillStyle = "#7dd3fc";
    }
    c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill();
    c.shadowBlur = 0;
    c.fillStyle = "rgba(5,4,10,0.85)";
    c.font = "bold 8px Inter,sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(q.type === "p" ? "+" : "", x, y);
  });

  // electrons — 2 on inner shell, up to 8 on outer
  for (let i = 0; i < atom.e; i++) {
    const inner = i < 2;
    const idx = inner ? i : i - 2;
    const shellR = inner ? 50 : 95;
    const speed = inner ? 1.5 : 0.8;
    const ang = t * speed + (idx / (inner ? 2 : 6)) * TAU;
    const x = cx + Math.cos(ang) * shellR;
    const y = cy + Math.sin(ang) * shellR;
    c.shadowColor = "#a855f7"; c.shadowBlur = 12;
    c.fillStyle = "#d8b4fe";
    c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill();
    c.shadowBlur = 0;
    c.fillStyle = "rgba(5,4,10,0.85)";
    c.font = "bold 8px Inter,sans-serif";
    c.fillText("−", x, y);
  }
}

/* ══════════════════════════════════════════
   GAME 3 — REACTION LAB
   ══════════════════════════════════════════ */
const RXN = [
  {
    q: "2H₂ + O₂ → ?",
    opts: ["2H₂O", "CO₂", "H₂O₂", "O₃"],
    correct: 0,
    expl: "Hydrogen burns in oxygen to form water — 2H₂ + O₂ → 2H₂O. This reaction powers rockets!"
  },
  {
    q: "CH₄ + 2O₂ → ?",
    opts: ["CO₂ + 2H₂O", "2CO + H₂O", "C₂H₆ + O₂", "CH₂O + H₂"],
    correct: 0,
    expl: "Complete combustion of methane (natural gas) gives carbon dioxide and water."
  },
  {
    q: "NaCl + AgNO₃ → ?",
    opts: ["AgCl + NaNO₃", "AgNO₂ + Cl₂", "NaNO₃ + Cl₂", "AgNa + ClNO₃"],
    correct: 0,
    expl: "A double displacement: silver chloride (AgCl) precipitates as a white solid — a classic test for chloride ions."
  },
  {
    q: "CaCO₃ —heat→ ?",
    opts: ["CaO + CO₂", "Ca + CO₃", "CaC₂ + O₂", "Ca(OH)₂ + CO"],
    correct: 0,
    expl: "Heating limestone drives off carbon dioxide, leaving calcium oxide (quicklime). This built the pyramids' mortar."
  }
];
const g3Q = document.getElementById("g3Q");
const g3Opts = document.getElementById("g3Opts");
const g3Msg = document.getElementById("g3Msg");
const g3Next = document.getElementById("g3Next");
const g3ScoreEl = document.getElementById("g3Score");
const g3TotalEl = document.getElementById("g3Total");
let g3Idx = 0, g3Score = 0, g3Answered = false;

function loadRxn() {
  g3Answered = false;
  const q = RXN[g3Idx];
  g3Q.textContent = q.q;
  g3Msg.textContent = "Choose the correct product.";
  g3Msg.className = "rxn-expl";
  g3Next.disabled = true;
  g3Opts.innerHTML = "";
  // shuffle display order, remember correct button by text
  const order = q.opts.map((text, i) => ({ text, i }))
    .sort(() => Math.random() - 0.5);
  order.forEach(o => {
    const b = document.createElement("button");
    b.className = "rxn-opt";
    b.textContent = o.text;
    b.addEventListener("click", () => answerRxn(b, o.i));
    g3Opts.appendChild(b);
  });
}
function answerRxn(btn, optIdx) {
  if (g3Answered) return;
  g3Answered = true;
  const q = RXN[g3Idx];
  const buttons = g3Opts.querySelectorAll(".rxn-opt");
  buttons.forEach(b => b.disabled = true);
  buttons.forEach(b => { if (b.textContent === q.opts[q.correct]) b.classList.add("correct"); });
  if (optIdx === q.correct) {
    g3Score++;
    g3Msg.textContent = "✔ CORRECT — " + q.expl;
    g3Msg.classList.add("good");
  } else {
    btn.classList.add("wrong");
    g3Msg.textContent = "✘ INCORRECT — " + q.expl;
    g3Msg.classList.add("bad");
  }
  g3ScoreEl.textContent = g3Score;
  g3Next.disabled = false;
  g3Next.textContent = g3Idx === RXN.length - 1 ? "FINISH" : "NEXT →";
}
g3Next.addEventListener("click", () => {
  if (g3Idx < RXN.length - 1) {
    g3Idx++;
    loadRxn();
  } else {
    g3Q.textContent = `LAB COMPLETE — SCORE: ${g3Score} / ${RXN.length}`;
    g3Opts.innerHTML = "";
    g3Msg.textContent = g3Score === RXN.length
      ? "Perfect run. You're a certified reaction master. ⚗"
      : "Good effort — hit REPLAY to master the reactions.";
    g3Msg.className = "rxn-expl " + (g3Score === RXN.length ? "good" : "bad");
    g3Next.disabled = true;
  }
});
document.getElementById("g3Reset").addEventListener("click", () => {
  g3Idx = 0; g3Score = 0;
  g3ScoreEl.textContent = "0";
  loadRxn();
});
g3TotalEl.textContent = RXN.length;
loadRxn();
