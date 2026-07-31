'use strict';

const canvas = document.getElementById('flag');
const ctx    = canvas.getContext('2d');

const rawDPR         = window.devicePixelRatio || 1;
const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
const isSmallScreen   = Math.min(window.innerWidth, window.innerHeight) < 700;
const isLowPowerDevice = isCoarsePointer || isSmallScreen;

const QUALITY = isLowPowerDevice ? Math.min(rawDPR, 2) : Math.min(rawDPR * 1.5, 3);
const CLIP_STEP = isLowPowerDevice ? 6 : 3;

let S, DW, DH, PX, FX, FY, FW, FH, SH, CR, AMP;
let bg = {};

const C_SAF  = '#C94B00';
const C_WHT  = '#EDE8DB';
const C_GRN  = '#0A6B1C';
const C_NAVY = '#000080';

const WFRQ = 2.0;
const WSPD = 2.3;
const CSPD = 0.50;

const d = v => Math.round(v * S);

function wave(x, t)
{
  const n   = x / FW;
  const env = Math.pow(n, 0.78) * (1 + 0.25 * Math.sin(n * Math.PI));
  return AMP * env * (
    Math.sin(WFRQ * 2 * Math.PI * n - WSPD * t) +
    0.22 * Math.sin(3.1 * 2 * Math.PI * n - 3.8 * t)
  );
}

function measureReservedHeight()
{
  const wrapper = document.querySelector('.canvas-wrapper');
  const wrapperStyle = getComputedStyle(wrapper);
  const gap = parseFloat(wrapperStyle.rowGap || wrapperStyle.gap) || 0;
  const paddingTop = parseFloat(wrapperStyle.paddingTop) || 0;
  const paddingBottom = parseFloat(wrapperStyle.paddingBottom) || 0;

  const children = Array.from(wrapper.children);
  let othersHeight = 0;
  children.forEach((el) => {
    if (el !== canvas) othersHeight += el.offsetHeight;
  });

  const gapsCount = Math.max(0, children.length - 1);
  return paddingTop + paddingBottom + othersHeight + gapsCount * gap;
}

function setupCanvas()
{
  const reserved     = measureReservedHeight();
  const safetyMargin = 6;
  const availableH   = Math.max(140, window.innerHeight - reserved - safetyMargin);

  S = Math.min(
    (window.innerWidth * 0.92) / 1060,
    availableH / 690,
    1
  );

  DW = Math.round(1060 * S);
  DH = Math.round(690  * S);

  canvas.width        = Math.round(DW * QUALITY);
  canvas.height       = Math.round(DH * QUALITY);
  canvas.style.width  = DW + 'px';
  canvas.style.height = DH + 'px';

  ctx.setTransform(QUALITY, 0, 0, QUALITY, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  PX  = d(72);
  FX  = d(88);
  FY  = d(52);
  FW  = d(900);
  FH  = d(600);
  SH  = FH / 3;
  AMP = d(24);
  CR  = SH * 0.43;

  buildBackgroundGradients();
}

function buildBackgroundGradients()
{
  const sky = ctx.createLinearGradient(0, 0, 0, DH);
  sky.addColorStop(0.00, '#0e0100');
  sky.addColorStop(0.18, '#3a0500');
  sky.addColorStop(0.38, '#7a1a00');
  sky.addColorStop(0.56, '#b03a00');
  sky.addColorStop(0.72, '#cc5800');
  sky.addColorStop(0.84, '#d97010');
  sky.addColorStop(0.92, '#e8901a');
  sky.addColorStop(1.00, '#c05818');

  const sunY  = DH * 0.88;
  const sunGl = ctx.createRadialGradient(DW * 0.5, sunY, 0, DW * 0.5, sunY, DW * 0.45);
  sunGl.addColorStop(0.00, 'rgba(255, 230, 120, 0.50)');
  sunGl.addColorStop(0.18, 'rgba(255, 160,  40, 0.32)');
  sunGl.addColorStop(0.40, 'rgba(220, 100,  10, 0.14)');
  sunGl.addColorStop(1.00, 'rgba(0,     0,   0, 0)');

  const haze = ctx.createLinearGradient(0, DH * 0.76, 0, DH * 0.96);
  haze.addColorStop(0,   'rgba(255,190,80,0)');
  haze.addColorStop(0.4, 'rgba(255,190,80,0.10)');
  haze.addColorStop(1,   'rgba(255,190,80,0)');

  const lit = ctx.createLinearGradient(0, FY - AMP, 0, FY + FH + AMP);
  lit.addColorStop(0,   'rgba(255,220,160,0.10)');
  lit.addColorStop(0.5, 'rgba(0,0,0,0)');
  lit.addColorStop(1,   'rgba(0,0,0,0.16)');

  const edg = ctx.createLinearGradient(FX, 0, FX + FW, 0);
  edg.addColorStop(0.000, 'rgba(0,0,0,0.45)');
  edg.addColorStop(0.040, 'rgba(0,0,0,0.04)');
  edg.addColorStop(0.920, 'rgba(0,0,0,0.04)');
  edg.addColorStop(1.000, 'rgba(0,0,0,0.32)');

  bg = { sky, sunGl, haze, lit, edg };
}

function drawBackground()
{
  ctx.fillStyle = bg.sky;
  ctx.fillRect(0, 0, DW, DH);

  ctx.fillStyle = bg.sunGl;
  ctx.fillRect(0, 0, DW, DH);

  ctx.fillStyle = bg.haze;
  ctx.fillRect(0, DH * 0.76, DW, DH * 0.20);

  ctx.fillStyle = '#FFE5AA';
  ctx.fillRect(0, DH * 0.99, DW, DH * 0.02);
}

function drawPole()
{
  const pw = d(11);
  const py = d(30);
  const ph = DH - d(32);

  const mg = ctx.createLinearGradient(PX - pw/2, 0, PX + pw/2, 0);
  mg.addColorStop(0,    '#2a2a2a');
  mg.addColorStop(0.20, '#a0a0a0');
  mg.addColorStop(0.50, '#f0f0f0');
  mg.addColorStop(0.80, '#888888');
  mg.addColorStop(1,    '#1a1a1a');
  ctx.fillStyle = mg;
  ctx.fillRect(PX - pw/2, py, pw, ph);

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PX - pw/2 + d(3), py + d(2));
  ctx.lineTo(PX - pw/2 + d(3), py + ph - d(2));
  ctx.stroke();

  ctx.fillStyle = '#444';
  ctx.fillRect(PX - pw/2 - d(2), py + ph - d(5), pw + d(5), d(5));

  const fr = d(10);
  const fg = ctx.createRadialGradient(PX - d(3), py - d(3), d(1), PX, py, fr);
  fg.addColorStop(0,    '#fffde0');
  fg.addColorStop(0.40, '#f0c830');
  fg.addColorStop(0.80, '#a07000');
  fg.addColorStop(1,    '#604000');
  ctx.beginPath(); ctx.arc(PX, py, fr, 0, 2 * Math.PI);
  ctx.fillStyle = fg; ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,80,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawRope(t)
{
  const pw = d(11);
  const x1 = PX + pw / 2;
  const x2 = FX;
  const cpX = (x1 + x2) / 2;

  const topY = FY      + wave(0, t);
  const botY = FY + FH + wave(0, t);

  const wavePhase = Math.sin(WSPD * t - Math.PI * 0.25);
  const sag = d(9) + wavePhase * d(3);

  function bezP(ax, ay, bx, by, cx2, cy, tt)
  {
    const m = 1 - tt;
    return { x: m*m*ax + 2*m*tt*bx + tt*tt*cx2,
             y: m*m*ay + 2*m*tt*by + tt*tt*cy };
  }

  function bezT(ax, ay, bx, by, cx2, cy, tt)
  {
    const m = 1 - tt;
    return { x: 2*m*(bx-ax) + 2*tt*(cx2-bx),
             y: 2*m*(by-ay) + 2*tt*(cy-by) };
  }

  ctx.save();

  function drawTwistedRope(y, sagDir)
  {
    const cpY = y + sagDir * sag;
    const N   = 55;
    const TWISTS   = 2;
    const CORE_W   = d(4.2);
    const STRAND_W = d(1.5);

    const pts = [], nor = [];
    for (let i = 0; i <= N; i++)
    {
      const tt = i / N;
      const p  = bezP(x1, y, cpX, cpY, x2, y, tt);
      const tg = bezT(x1, y, cpX, cpY, x2, y, tt);
      const len = Math.hypot(tg.x, tg.y) || 1;
      pts.push(p);
      nor.push({ x: -tg.y / len, y: tg.x / len });
    }

    function strokePts(offFn)
    {
      ctx.beginPath();
      for (let i = 0; i <= N; i++)
      {
        const o  = offFn(i);
        const px = pts[i].x + nor[i].x * o;
        const py = pts[i].y + nor[i].y * o;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(d(1.2), d(1.2));
    ctx.strokeStyle = 'rgba(0,0,0,0.32)';
    ctx.lineWidth   = CORE_W + d(1);
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    strokePts(() => 0);
    ctx.restore();

    ctx.strokeStyle = '#3b2208';
    ctx.lineWidth   = CORE_W;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    strokePts(() => 0);

    const strandCols = ['#6b3a1f', '#c47a45'];
    const strandAmp  = d(1.6);

    strandCols.forEach((col, s) =>
    {
      ctx.strokeStyle = col;
      ctx.lineWidth   = STRAND_W;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      const phOff = s * Math.PI;
      strokePts(i => {
        const phase = (i / N) * TWISTS * Math.PI * 2 + phOff;
        return Math.sin(phase) * strandAmp;
      });
    });

    ctx.strokeStyle = 'rgba(200,140,90,0.45)';
    ctx.lineWidth   = d(0.7);
    strokePts(i => -sagDir * d(1.4));

    const rR  = d(4.2);
    const rRi = d(2.4);

    ctx.beginPath();
    ctx.arc(x1, y, rR, 0, Math.PI * 2);
    const clampG = ctx.createRadialGradient(x1 - d(1.2), y - d(1.2), d(0.5),
                                            x1, y, rR);
    clampG.addColorStop(0,   '#d0d0d0');
    clampG.addColorStop(0.4, '#909090');
    clampG.addColorStop(1,   '#404040');
    ctx.fillStyle = clampG;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x1, y, rRi, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0c04';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x1, y, rR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth   = d(0.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x1 - d(1), y - d(1), rR * 0.65, Math.PI * 1.1, Math.PI * 1.65);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth   = d(0.9);
    ctx.stroke();

    const gR  = d(3.5);
    const gRi = d(1.6);

    ctx.beginPath();
    ctx.arc(x2, y, gR, 0, Math.PI * 2);
    const brassG = ctx.createRadialGradient(x2 - d(1), y - d(1), d(0.4),
                                            x2, y, gR);
    brassG.addColorStop(0,   '#f0c040');
    brassG.addColorStop(0.5, '#a07018');
    brassG.addColorStop(1,   '#5a3a08');
    ctx.fillStyle = brassG;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x2, y, gRi, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0c04';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x2, y, gR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth   = d(0.7);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x2 - d(0.9), y - d(0.9), d(0.8), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,240,160,0.80)';
    ctx.fill();
  }

  drawTwistedRope(topY, -1);
  drawTwistedRope(botY, +1);

  ctx.restore();
}

function drawChakra(cx, cy, R, angle)
{
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const N = 24;
  const TAU = Math.PI * 2;
  const hubR = R * 0.085;
  const innerR = R * 0.88;
  const outerR = R;

  ctx.fillStyle = C_NAVY;
  ctx.beginPath();
  ctx.arc(0, 0, outerR, 0, TAU);
  ctx.fill();
  ctx.beginPath();

  for (let i = 0; i < N; i++)
  {
    const a0 = (i * TAU) / N;
    const a1 = ((i + 1) * TAU) / N;
    const mid = (a0 + a1) / 2;
    let x0 = Math.cos(a0) * innerR;
    let y0 = Math.sin(a0) * innerR;
    if (i === 0) ctx.moveTo(x0, y0);
    let cx1 = Math.cos(mid) * (innerR - R * 0.12);
    let cy1 = Math.sin(mid) * (innerR - R * 0.12);
    let x1 = Math.cos(a1) * innerR;
    let y1 = Math.sin(a1) * innerR;
    ctx.quadraticCurveTo(cx1, cy1, x1, y1);
  }

  ctx.closePath();
  ctx.fillStyle = C_WHT;
  ctx.fill();
  ctx.fillStyle = C_NAVY;

  const ri = R * 0.115;
  const ro = R * 0.88;
  const w0 = R * 0.010;
  const w1 = R * 0.045;
  const w2 = R * 0.050;

  for (let i = 0; i < 24; i++)
  {
    ctx.save();
    ctx.rotate((i / 24) * 2 * Math.PI);
    ctx.beginPath();
    ctx.moveTo(-w0, ri);
    ctx.bezierCurveTo(
      -w1, ri + (ro - ri) * 0.45,
      -w2, ri + (ro - ri) * 0.105,
      0,  ro
      );
    ctx.bezierCurveTo(
      w2, ri + (ro - ri) * 0.105,
      w1, ri + (ro - ri) * 0.45,
      w0, ri
      );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, hubR, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function buildFlagClip(t)
{
  ctx.beginPath();
  ctx.moveTo(FX, FY + wave(0, t));
  for (let x = 0; x < FW; x += CLIP_STEP) ctx.lineTo(FX + x, FY + wave(x, t));
  ctx.lineTo(FX + FW, FY + wave(FW, t));
  ctx.lineTo(FX + FW, FY + FH + wave(FW, t));
  for (let x = FW; x > 0; x -= CLIP_STEP) ctx.lineTo(FX + x, FY + FH + wave(x, t));
  ctx.lineTo(FX, FY + FH + wave(0, t));
  ctx.closePath(); ctx.clip();
}

function drawFlagBand(f0, f1, color, t)
{
  ctx.beginPath();
  ctx.moveTo(FX, FY + wave(0, t) + f0 * FH);
  for (let x = 0; x < FW; x += CLIP_STEP) {
    ctx.lineTo(FX + x, FY + wave(x, t) + f0 * FH);
  }
  ctx.lineTo(FX + FW, FY + wave(FW, t) + f0 * FH);
  ctx.lineTo(FX + FW, FY + wave(FW, t) + f1 * FH);
  for (let x = FW; x > 0; x -= CLIP_STEP) {
    ctx.lineTo(FX + x, FY + wave(x, t) + f1 * FH);
  }
  ctx.lineTo(FX, FY + wave(0, t) + f1 * FH);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawFlagFabric(t)
{
  drawFlagBand(0,     1 / 3, C_SAF, t);
  drawFlagBand(1 / 3, 2 / 3, C_WHT, t);
  drawFlagBand(2 / 3, 1,     C_GRN, t);
}

let lastTs   = null;
let simTime  = 0;
let isVisible = true;
let rafId = null;

function frame(ts)
{
  if (!isVisible) return;

  if (lastTs === null) lastTs = ts;
  let dt = (ts - lastTs) / 1000;
  lastTs = ts;
  dt = Math.max(0, Math.min(dt, 1 / 30));
  simTime += dt;
  const t = simTime;

  ctx.clearRect(0, 0, DW, DH);
  drawBackground();

  ctx.save();
  ctx.filter = 'blur(' + d(5) + 'px)';
  ctx.fillStyle = 'rgba(20,5,0,0.55)';
  ctx.beginPath();
  ctx.ellipse(PX + d(4), DH - d(16), d(7), d(3), 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();

  drawPole();
  drawRope(t);

  drawFlagFabric(t);

  ctx.save();
  buildFlagClip(t);

  const period = FW / WFRQ;
  const phOff  = (((WSPD * t) / (2 * Math.PI * WFRQ)) % 1) * period;

  for (let b = -1; b <= Math.ceil(FW / period) + 1; b++) {
    const bx = FX + b * period - phOff;
    const sg = ctx.createLinearGradient(bx, 0, bx + period, 0);
    sg.addColorStop(0.00, 'rgba(255,255,255,0.15)');
    sg.addColorStop(0.25, 'rgba(255,255,255,0.01)');
    sg.addColorStop(0.50, 'rgba(0,0,0,0.20)');
    sg.addColorStop(0.75, 'rgba(255,255,255,0.01)');
    sg.addColorStop(1.00, 'rgba(255,255,255,0.15)');
    ctx.fillStyle = sg;
    ctx.fillRect(bx, FY - AMP, period, FH + 2 * AMP);
  }

  ctx.fillStyle = bg.lit;
  ctx.fillRect(FX, FY - AMP, FW, FH + 2 * AMP);

  ctx.fillStyle = bg.edg;
  ctx.fillRect(FX, FY - AMP, FW, FH + 2 * AMP);

  ctx.restore();

  drawChakra(
    FX + FW * 0.5,
    FY + FH * 0.5 + wave(FW * 0.5, t),
    CR,
    t * CSPD
  );

  rafId = requestAnimationFrame(frame);
}

function startLoop()
{
  if (rafId !== null) return;
  lastTs = null;
  rafId = requestAnimationFrame(frame);
}

function stopLoop()
{
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
}

document.addEventListener('visibilitychange', () => {
  isVisible = document.visibilityState === 'visible';
  if (isVisible) startLoop();
  else stopLoop();
});

let resizeTimer = null;
function onResize()
{
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setupCanvas, 150);
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

setupCanvas();
startLoop();

const DEFAULT_CREDIT_TEXT = 'Proudly Made For India/Bharat by Shivam Thaker';
const STORAGE_KEY_NAME    = 'bharatFlagCreditName';
const STORAGE_KEY_FAB_SEEN = 'bharatFlagFabSeen';

const creditlineEl = document.getElementById('creditline');
const editNameBtn  = document.getElementById('editNameBtn');
let customCreditText = null;

function safeStorageGet(key)
{
  try { return window.localStorage.getItem(key); } catch (err) { return null; }
}

function safeStorageSet(key, value)
{
  try { window.localStorage.setItem(key, value); } catch (err) {}
}

function safeStorageRemove(key)
{
  try { window.localStorage.removeItem(key); } catch (err) {}
}

(function restoreSavedCreditName() {
  const saved = safeStorageGet(STORAGE_KEY_NAME);
  if (saved && saved.trim()) {
    customCreditText = saved.trim();
    creditlineEl.textContent = customCreditText;
  }
})();

function getDownloadCreditText()
{
  return (customCreditText && customCreditText.trim()) ? customCreditText.trim() : null;
}

function slugify(text)
{
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'Custom';
}

function buildFileName(kind, ext)
{
  const creditText = getDownloadCreditText();
  const suffix = creditText ? `_${slugify(creditText)}` : '';
  return `National_Flag_${kind}${suffix}.${ext}`;
}

const nameModalOverlay = document.getElementById('nameModalOverlay');
const nameModalInput   = document.getElementById('nameModalInput');
const nameModalCount   = document.getElementById('nameModalCount');
const nameModalSave    = document.getElementById('nameModalSave');
const nameModalCancel  = document.getElementById('nameModalCancel');
const nameModalReset   = document.getElementById('nameModalReset');
const MAX_NAME_LENGTH  = 60;

function openNameModal()
{
  nameModalInput.value = customCreditText || '';
  nameModalCount.textContent = nameModalInput.value.length;
  nameModalOverlay.classList.add('active');
  nameModalOverlay.setAttribute('aria-hidden', 'false');
  setTimeout(() => nameModalInput.focus(), 50);

  if (editNameBtn.classList.contains('nudge')) {
    editNameBtn.classList.remove('nudge');
    safeStorageSet(STORAGE_KEY_FAB_SEEN, '1');
  }
}

function closeNameModal()
{
  nameModalOverlay.classList.remove('active');
  nameModalOverlay.setAttribute('aria-hidden', 'true');
}

function saveNameModal()
{
  const trimmed = nameModalInput.value.trim().slice(0, MAX_NAME_LENGTH);

  if (!trimmed) {
    customCreditText = null;
    creditlineEl.textContent = DEFAULT_CREDIT_TEXT;
    safeStorageRemove(STORAGE_KEY_NAME);
  } else {
    customCreditText = trimmed;
    creditlineEl.textContent = trimmed;
    safeStorageSet(STORAGE_KEY_NAME, trimmed);
  }

  closeNameModal();
}

function resetNameModal()
{
  customCreditText = null;
  creditlineEl.textContent = DEFAULT_CREDIT_TEXT;
  safeStorageRemove(STORAGE_KEY_NAME);
  closeNameModal();
}

nameModalInput.addEventListener('input', () => {
  nameModalCount.textContent = nameModalInput.value.length;
});

nameModalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); saveNameModal(); }
  if (e.key === 'Escape') { e.preventDefault(); closeNameModal(); }
});

nameModalSave.addEventListener('click', saveNameModal);
nameModalCancel.addEventListener('click', closeNameModal);
nameModalReset.addEventListener('click', resetNameModal);

nameModalOverlay.addEventListener('click', (e) => {
  if (e.target === nameModalOverlay) closeNameModal();
});

editNameBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  openNameModal();
});

if (!safeStorageGet(STORAGE_KEY_FAB_SEEN)) {
  editNameBtn.classList.add('nudge');
}

const menu = document.getElementById('menu');
let menuOpen = false;

function openMenuAt(pageX, pageY)
{
  menu.style.visibility = 'hidden';
  menu.style.display = 'block';

  const menuWidth  = menu.offsetWidth;
  const menuHeight = menu.offsetHeight;

  const maxX = window.scrollX + window.innerWidth  - menuWidth  - 4;
  const maxY = window.scrollY + window.innerHeight - menuHeight - 4;

  const x = Math.max(4, Math.min(pageX, maxX));
  const y = Math.max(4, Math.min(pageY, maxY));

  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
  menu.style.visibility = 'visible';
  menuOpen = true;
}

function closeMenu()
{
  if (!menuOpen) return;
  menu.style.display = 'none';
  menuOpen = false;
}

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  openMenuAt(e.pageX, e.pageY);
});

document.addEventListener('click', () => {
  closeMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuOpen) closeMenu();
});

window.addEventListener('scroll', () => { if (menuOpen) closeMenu(); }, { passive: true });
window.addEventListener('resize', () => { if (menuOpen) closeMenu(); });

menu.querySelectorAll('[role="menuitem"]').forEach((item) => {
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
});

const LONG_PRESS_MS = 500;
const MOVE_CANCEL_PX = 10;
let longPressTimer = null;
let longPressFired  = false;
let touchStartX = 0;
let touchStartY = 0;

function clearLongPressTimer()
{
  if (longPressTimer !== null) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) { clearLongPressTimer(); return; }

  const touch = e.touches[0];
  touchStartX = touch.pageX;
  touchStartY = touch.pageY;
  longPressFired = false;

  clearLongPressTimer();
  longPressTimer = setTimeout(() => {
    longPressFired = true;
    if (navigator.vibrate) { try { navigator.vibrate(15); } catch (err) {} }
    openMenuAt(touchStartX, touchStartY);
  }, LONG_PRESS_MS);
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  if (!longPressTimer && !longPressFired) return;
  const touch = e.touches[0];
  if (!touch) return;
  const dx = touch.pageX - touchStartX;
  const dy = touch.pageY - touchStartY;
  if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
    clearLongPressTimer();
  }
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  clearLongPressTimer();
  if (longPressFired) {
    e.preventDefault();
    longPressFired = false;
  }
});

canvas.addEventListener('touchcancel', () => {
  clearLongPressTimer();
  longPressFired = false;
});

const progressEl    = document.getElementById('dl-progress');
const progressFill  = progressEl.querySelector('.dl-progress-fill');
const progressLabel = progressEl.querySelector('.dl-progress-label');
let downloadActive  = false;

function showProgress(label)
{
  progressEl.classList.add('active');
  progressEl.setAttribute('aria-hidden', 'false');
  setProgress(0, label);
}

function setProgress(pct, label)
{
  progressFill.style.width = Math.max(0, Math.min(100, pct)) + '%';
  progressLabel.textContent = label ? `${label} ${Math.round(pct)}%` : `${Math.round(pct)}%`;
}

function hideProgress()
{
  setTimeout(() => {
    progressEl.classList.remove('active');
    progressEl.setAttribute('aria-hidden', 'true');
    setTimeout(() => setProgress(0, ''), 300);
  }, 500);
}

function drawCreditBanner(targetCtx, x, y, w, h, text)
{
  targetCtx.save();

  const bg = targetCtx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, 'rgba(12,8,6,0.94)');
  bg.addColorStop(1, 'rgba(22,10,4,0.98)');
  targetCtx.fillStyle = bg;
  targetCtx.fillRect(x, y, w, h);

  const lineH = Math.max(2, Math.round(h * 0.045));
  const stripeW = w / 3;
  targetCtx.fillStyle = '#FF9933';
  targetCtx.fillRect(x, y, stripeW, lineH);
  targetCtx.fillStyle = '#FFFFFF';
  targetCtx.fillRect(x + stripeW, y, stripeW, lineH);
  targetCtx.fillStyle = '#138808';
  targetCtx.fillRect(x + 2 * stripeW, y, w - 2 * stripeW, lineH);

  const upperText = text.toUpperCase();
  const maxTextWidth = w * 0.92;
  let fontSize = Math.round(h * 0.34);
  const minFontSize = Math.round(h * 0.14);

  targetCtx.textAlign = 'center';
  targetCtx.textBaseline = 'middle';

  targetCtx.font = `bold ${fontSize}px Georgia, 'Palatino Linotype', serif`;
  while (targetCtx.measureText(upperText).width > maxTextWidth && fontSize > minFontSize) {
    fontSize -= 1;
    targetCtx.font = `bold ${fontSize}px Georgia, 'Palatino Linotype', serif`;
  }

  const textX = x + w / 2;
  const textY = y + h * 0.62;

  const tgrad = targetCtx.createLinearGradient(0, textY - fontSize * 0.6, 0, textY + fontSize * 0.6);
  tgrad.addColorStop(0.00, '#FF9933');
  tgrad.addColorStop(0.33, '#FF9933');
  tgrad.addColorStop(0.33, '#FFFFFF');
  tgrad.addColorStop(0.66, '#FFFFFF');
  tgrad.addColorStop(0.66, '#138808');
  tgrad.addColorStop(1.00, '#138808');

  targetCtx.shadowColor = 'rgba(255,160,40,0.55)';
  targetCtx.shadowBlur = fontSize * 0.3;
  targetCtx.fillStyle = tgrad;
  targetCtx.fillText(upperText, textX, textY, maxTextWidth);

  targetCtx.restore();
}

function captureFlagImageBlob()
{
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const creditText = getDownloadCreditText();
      const bannerH = creditText ? Math.round(canvas.height * 0.16) : 0;

      const out  = document.createElement('canvas');
      out.width  = canvas.width;
      out.height = canvas.height + bannerH;
      const octx = out.getContext('2d');
      octx.drawImage(canvas, 0, 0);

      if (creditText) {
        drawCreditBanner(octx, 0, canvas.height, out.width, bannerH, creditText);
      }

      setProgress(35, 'Encoding image…');

      let shown = 35;
      const creep = setInterval(() => {
        shown = Math.min(shown + 4, 92);
        setProgress(shown, 'Encoding image…');
      }, 60);

      out.toBlob((blob) => {
        clearInterval(creep);
        resolve(blob);
      }, 'image/png');
    });
  });
}

function getSupportedMimeType()
{
  if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return null;
  const candidates = [
    'video/webm; codecs=vp9',
    'video/webm; codecs=vp8',
    'video/webm',
    'video/mp4'
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return null;
}

function recordFlagVideo()
{
  return new Promise((resolve, reject) => {
    const captureStreamFn = canvas.captureStream || canvas.mozCaptureStream;
    if (!captureStreamFn) {
      reject(new Error('Video recording is not supported in this browser. Try Chrome, Edge, or Firefox.'));
      return;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      reject(new Error('Video recording is not supported in this browser. Try Chrome, Edge, or Firefox.'));
      return;
    }

    const creditText = getDownloadCreditText();
    let sourceCanvas = canvas;
    let exportCanvas = null;
    let exportCtx = null;
    let bannerH = 0;
    let compositeRafId = null;

    if (creditText) {
      bannerH = Math.round(canvas.height * 0.16);
      exportCanvas = document.createElement('canvas');
      exportCanvas.width  = canvas.width;
      exportCanvas.height = canvas.height + bannerH;
      exportCanvas.style.position = 'fixed';
      exportCanvas.style.left = '-99999px';
      exportCanvas.style.top  = '0';
      exportCanvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(exportCanvas);
      exportCtx = exportCanvas.getContext('2d');
      sourceCanvas = exportCanvas;

      function compositeFrame() {
        exportCtx.drawImage(canvas, 0, 0);
        drawCreditBanner(exportCtx, 0, canvas.height, exportCanvas.width, bannerH, creditText);
        compositeRafId = requestAnimationFrame(compositeFrame);
      }
      compositeFrame();
    }

    function cleanupExportCanvas()
    {
      if (compositeRafId !== null) cancelAnimationFrame(compositeRafId);
      if (exportCanvas && exportCanvas.parentNode) exportCanvas.parentNode.removeChild(exportCanvas);
    }

    const DURATION = 6;
    const stream = captureStreamFn.call(sourceCanvas, 60);
    const chunks = [];

    let recorder;
    try {
      recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 15000000
      });
    } catch (err) {
      cleanupExportCanvas();
      reject(new Error('Video recording could not be started on this browser.'));
      return;
    }

    showProgress('Recording video…');

    const startTime = performance.now();
    let progressHandle = null;

    function tickProgress()
    {
      const elapsedSec = (performance.now() - startTime) / 1000;
      const pct = Math.min((elapsedSec / DURATION) * 96, 96);
      setProgress(pct, 'Recording video…');
      if (elapsedSec < DURATION) {
        progressHandle = requestAnimationFrame(tickProgress);
      }
    }
    progressHandle = requestAnimationFrame(tickProgress);

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      if (progressHandle !== null) cancelAnimationFrame(progressHandle);
      cleanupExportCanvas();
      setProgress(97, 'Finalizing video…');

      const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      resolve({ blob, ext });
    };

    recorder.onerror = () => {
      if (progressHandle !== null) cancelAnimationFrame(progressHandle);
      cleanupExportCanvas();
      reject(new Error('Video recording failed.'));
    };

    recorder.start();
    setTimeout(() => recorder.stop(), DURATION * 1000);
  });
}

function triggerBlobDownload(blob, filename)
{
  setProgress(97, 'Saving…');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  setProgress(100, 'Downloaded');
}

async function downloadPNG()
{
  if (downloadActive) return;
  downloadActive = true;
  showProgress('Preparing image…');

  const blob = await captureFlagImageBlob();

  if (!blob) {
    setProgress(0, 'Failed');
    downloadActive = false;
    hideProgress();
    return;
  }

  triggerBlobDownload(blob, buildFileName('Image', 'png'));
  downloadActive = false;
  hideProgress();
}

async function downloadVID()
{
  if (downloadActive) return;
  downloadActive = true;

  try {
    const { blob, ext } = await recordFlagVideo();
    triggerBlobDownload(blob, buildFileName('Video', ext));
  } catch (err) {
    setProgress(0, 'Failed');
    if (err && err.message) alert(err.message);
  } finally {
    downloadActive = false;
    hideProgress();
  }
}
