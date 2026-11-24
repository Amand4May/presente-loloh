/* A carta são as imagens img/carta-1.jpg e img/carta-2.jpg (páginas do PDF) */
const gift = document.getElementById('gift');
const giftWrap = document.getElementById('giftWrap');
const bow = document.getElementById('bow');
const envelope = document.getElementById('envelope');
const hint = document.getElementById('hint');
const overlay = document.getElementById('overlay');
const paper = document.getElementById('paper');

/* ---------- abrir o presente: puxar o laço ---------- */
let dragging = false, start = null, opened = false, taps = 0;
const THRESHOLD = 90;

bow.addEventListener('pointerdown', e => {
  if (opened) return;
  dragging = true; start = { x: e.clientX, y: e.clientY };
  bow.setPointerCapture(e.pointerId);
  bow.classList.add('dragging');
});

bow.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - start.x, dy = e.clientY - start.y;
  const dist = Math.hypot(dx, dy);
  const k = Math.min(1, 140 / Math.max(dist, 1)) * 0.7;
  const tilt = Math.max(-25, Math.min(25, dx / 4));
  bow.style.transform = `translate(${dx * k}px, ${dy * k}px) rotate(${tilt}deg) scale(${1 + Math.min(dist, 140) / 500})`;
  giftWrap.style.transform = `rotate(${Math.sin(dist / 6) * Math.min(dist / 40, 2.5)}deg)`;
  hint.textContent = dist > THRESHOLD * 0.6 ? 'quase lá…' : 'puxa!';
  if (dist >= THRESHOLD) { endDrag(); openGift(); }
});

function endDrag() {
  dragging = false;
  bow.classList.remove('dragging');
  bow.style.transform = '';
  giftWrap.style.transform = '';
}

bow.addEventListener('pointerup', e => {
  if (!dragging) return;
  const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
  endDrag();
  if (moved < 6) {                       // só tocou: balança e, se insistir, abre
    gift.classList.remove('shake'); void gift.offsetWidth; gift.classList.add('shake');
    hint.textContent = ++taps >= 4 ? '' : 'não é de tocar, é de puxar! ↑';
    if (taps >= 4) openGift();
  } else if (!opened) hint.textContent = 'puxe mais forte ↑';
});
bow.addEventListener('pointercancel', endDrag);
bow.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGift(); }
});

function openGift() {
  if (opened) return;
  opened = true;
  gift.classList.add('opened');
  hint.textContent = '';
  const r = giftWrap.getBoundingClientRect();
  window.burst(r.left + r.width / 2, r.top + r.height * 0.4, 90);
  setTimeout(() => window.burst(r.left + r.width / 2, r.top + r.height * 0.4, 50), 350);
  setTimeout(() => {
    envelope.classList.add('out');
    envelope.tabIndex = 0;
  }, 800);
  setTimeout(() => { hint.textContent = 'tem uma carta pra você ♥'; readBtn.classList.add('show'); }, 1900);
}

/* ---------- abrir a carta ---------- */
const readBtn = document.getElementById('readBtn');
let letterBusy = false;
function openLetter() {
  if (!envelope.classList.contains('out') || letterBusy || overlay.classList.contains('show')) return;
  letterBusy = true;
  hint.textContent = '';
  const wasOpen = envelope.classList.contains('open');
  envelope.classList.add('open');
  setTimeout(() => { showLetter(); letterBusy = false; }, wasOpen ? 0 : 900);
}
// qualquer toque na área do presente (ou no botão) abre a carta
giftWrap.addEventListener('click', openLetter);
readBtn.addEventListener('click', openLetter);

function showLetter() {
  overlay.classList.remove('show'); void overlay.offsetWidth;
  paper.scrollTop = 0;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.getElementById('close').focus();
}

function hideLetter() {
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  hint.textContent = 'toque para ler de novo ♥';
  readBtn.focus();
}

document.getElementById('close').addEventListener('click', hideLetter);
overlay.addEventListener('click', e => { if (e.target === overlay) hideLetter(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('show')) hideLetter(); });
