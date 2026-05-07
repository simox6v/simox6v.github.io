// ===== MATRIX RAIN =====
const mc = document.getElementById('matrix');
const mx = mc.getContext('2d');
let mW, mH, cols, drops;
const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]=/\\';

function mResize() {
  mW = mc.width = window.innerWidth;
  mH = mc.height = window.innerHeight;
  cols = Math.floor(mW / 18);
  drops = Array(cols).fill(1).map(() => Math.random() * -100);
}
mResize();
window.addEventListener('resize', mResize);

function drawMatrix() {
  mx.fillStyle = 'rgba(3,7,18,.06)';
  mx.fillRect(0, 0, mW, mH);
  mx.font = '14px JetBrains Mono, monospace';

  for (let i = 0; i < cols; i++) {
    const ch = chars[Math.floor(Math.random() * chars.length)];
    const x = i * 18;
    const y = drops[i] * 18;

    // head of trail - soft teal
    mx.fillStyle = 'rgba(94,234,212,.6)';
    mx.fillText(ch, x, y);

    // trail chars dimmer blue
    if (Math.random() > .97) {
      mx.fillStyle = 'rgba(125,211,252,.25)';
      mx.fillText(ch, x, y - 18);
    }

    if (y > mH && Math.random() > .98) drops[i] = 0;
    drops[i] += .3 + Math.random() * .4;
  }
  requestAnimationFrame(drawMatrix);
}
drawMatrix();

// ===== CURSOR GLOW =====
const glow = document.getElementById('glow');
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

// ===== NAVBAR =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('sc', scrollY > 40));

// ===== MOBILE MENU =====
const nb = document.getElementById('nb');
const mm = document.getElementById('mm');
nb.addEventListener('click', () => {
  nb.classList.toggle('o'); mm.classList.toggle('o');
  document.body.style.overflow = mm.classList.contains('o') ? 'hidden' : '';
});
mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nb.classList.remove('o'); mm.classList.remove('o');
  document.body.style.overflow = '';
}));

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ===== TERMINAL TYPING =====
function typeText(el, text, cb) {
  let i = 0; el.textContent = '';
  const c = document.createElement('span');
  c.className = 'cur';
  el.appendChild(c);
  (function tick() {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i++]), c);
      setTimeout(tick, 50 + Math.random() * 40);
    } else setTimeout(() => { c.remove(); cb && cb(); }, 400);
  })();
}

async function runTerminal() {
  const show = (id, ms, cmd) => new Promise(r => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return r();
      el.classList.remove('hidden');
      if (cmd) { const s = el.querySelector('.cmd'); s ? typeText(s, s.dataset.text, r) : r(); }
      else r();
    }, ms);
  });
  await show('t1', 400, true);
  await show('t2', 120, false);
  await show('t3', 450, true);
  await show('t4', 120, false);
  await show('t5', 450, true);
  await show('t6', 120, false);
  show('t7', 200, false);
}

// ===== COUNTER =====
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    let cur = 0;
    const step = () => {
      cur++;
      el.textContent = cur + '+';
      if (cur < target) setTimeout(step, 250);
    };
    setTimeout(step, 1000);
  });
}

// ===== SCROLL REVEAL =====
function initAO() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.querySelectorAll('.ao:not(.in)')];
      const idx = Math.max(0, siblings.indexOf(entry.target));
      setTimeout(() => entry.target.classList.add('in'), idx * 100);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.ao').forEach(el => obs.observe(el));
}

// ===== 3D TILT =====
function initTilt() {
  document.querySelectorAll('.pcard, .cc, .bento-card, .scard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
      card.style.transition = 'none';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all .35s';
    });
  });
}

// ===== TEXT SCRAMBLE =====
class TextScramble {
  constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}=+*^?#___'; this.queue = []; this.frame = 0; }
  setText(t) {
    const old = this.el.textContent;
    const len = Math.max(old.length, t.length);
    return new Promise(resolve => {
      this.queue = [];
      for (let i = 0; i < len; i++) {
        this.queue.push({ from: old[i]||'', to: t[i]||'', start: Math.floor(Math.random()*20), end: Math.floor(Math.random()*20)+20 });
      }
      cancelAnimationFrame(this.frameReq);
      this.frame = 0; this.resolve = resolve; this.update();
    });
  }
  update() {
    let out = '', done = 0;
    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) { done++; out += to; }
      else if (this.frame >= start) {
        if (!char || Math.random() < .28) { char = this.chars[Math.floor(Math.random()*this.chars.length)]; this.queue[i].char = char; }
        out += `<span style="color:var(--b)">${char}</span>`;
      } else out += from;
    }
    this.el.innerHTML = out;
    if (done === this.queue.length) this.resolve();
    else { this.frameReq = requestAnimationFrame(() => this.update()); this.frame++; }
  }
}

function scrambleHero() {
  const el = document.querySelector('.grad');
  if (!el) return;
  const fx = new TextScramble(el);
  setTimeout(() => fx.setText('Lamkhantar'), 600);
}

// ===== LANGUAGE TOGGLE =====
let currentLang = 'fr';
function toggleLang() {
  currentLang = currentLang === 'fr' ? 'en' : 'fr';
  document.querySelectorAll('[data-fr][data-en]').forEach(el => {
    const text = el.getAttribute(`data-${currentLang}`);
    if (el.querySelector('svg')) {
      const s = el.querySelector('span:not(.dot):not(.pulse)');
      if (s) s.textContent = text;
    } else {
      el.innerHTML = text;
    }
  });
  document.documentElement.lang = currentLang;
  document.querySelectorAll('.lang-btn').forEach(b => {
    const d = b.querySelector('.dot');
    b.textContent = '';
    if (d) b.appendChild(d);
    b.appendChild(document.createTextNode(currentLang === 'fr' ? ' EN / FR' : ' FR / EN'));
  });
}
document.getElementById('langBtn').addEventListener('click', toggleLang);
const lb2 = document.getElementById('langBtn2');
if (lb2) lb2.addEventListener('click', toggleLang);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  runTerminal();
  animateCounters();
  scrambleHero();
  initAO();
  setTimeout(initTilt, 500);
});
