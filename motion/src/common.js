// Shared helpers for the INTERMISSION logo motion pieces.
const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
const C = { bg: '#0A0A0B', fg: '#F2F0EB', blue: '#2B50FF', dim: '#2A2A2E' };
const canvas = document.getElementById('c');
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d');

const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => cl((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  outExpo: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: x => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  inOutExpo: x => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
  outCubic: x => 1 - Math.pow(1 - x, 3),
  inCubic: x => x * x * x,
  inOutCubic: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outBack: x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};

function setFont(size, weight = 700, ls = 0, family = 'Inter Display') {
  ctx.font = `${weight} ${size}px "${family}"`;
  ctx.letterSpacing = ls + 'px';
}

// Per-letter layout of a string centred on cx. Returns {x, w, ch}[] and total width.
function layout(text, size, weight, ls, cx = CX) {
  setFont(size, weight, ls);
  const total = ctx.measureText(text).width - ls;
  const left = cx - total / 2;
  const g = [...text].map((ch, i) => {
    const x = left + ctx.measureText(text.slice(0, i)).width;
    return { ch, x, w: ctx.measureText(ch).width - ls };
  });
  return { g, total, left };
}

function bg(color = C.bg) { ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); }

// Seeded PRNG so every render is identical.
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
