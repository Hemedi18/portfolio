// === UTIL: helper selectors
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// === PRELOADER
window.addEventListener('load', () => {
  $('.preloader')?.classList.add('hidden');
  // Kick off count-up after load for better paint
  startCounters();
});

// === YEAR
$('#year').textContent = new Date().getFullYear();

// === THEME TOGGLE (persist in localStorage)
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);
$('.theme-toggle').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// === MOBILE NAV
const navToggle = $('.nav__toggle');
const navList = $('.nav__list');
navToggle?.addEventListener('click', () => {
  const open = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
$$('[data-scroll]').forEach(a =>
  a.addEventListener('click', () => navList.classList.remove('open'))
);

// === SMOOTH SCROLL + ACTIVE LINK HIGHLIGHT
$$('a[href^="#"][data-scroll]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);
  });
});

// === INTERSECTION OBSERVER: reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.16, rootMargin: '0px 0px -10% 0px' });
$$('.reveal').forEach(el => io.observe(el));

// === SPLIT TEXT (per‑word/char intro animation)
function splitText(selector = '.split') {
  $$(selector).forEach(node => {
    const words = node.textContent.trim().split(' ');
    node.textContent = '';
    words.forEach(w => {
      const spanWord = document.createElement('span');
      spanWord.className = 'word';
      [...w].forEach(ch => {
        const spanChar = document.createElement('span');
        spanChar.className = 'char';
        spanChar.textContent = ch;
        spanWord.appendChild(spanChar);
      });
      node.appendChild(spanWord);
      node.append(' ');
    });
    // animate in
    const chars = $$('.char', node);
    chars.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(12px)';
      c.style.transition = `opacity .6s ${i * 8}ms cubic-bezier(.22,1,.36,1), transform .6s ${i * 8}ms cubic-bezier(.22,1,.36,1)`;
      requestAnimationFrame(() => {
        c.style.opacity = '1';
        c.style.transform = 'translateY(0)';
      });
    });
  });
}
splitText();

// === COUNTERS
function startCounters(){
  const counters = $$('.count');
  counters.forEach(el => {
    const target = +el.dataset.count || 0;
    const dur = 1200;
    const t0 = performance.now();
    function tick(now){
      const p = Math.min(1, (now - t0)/dur);
      el.textContent = Math.floor(target * (0.15 + 0.85*p));
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// === TILT EFFECT
$$('.tilt').forEach(card => {
  let raf = null;
  const rect = () => card.getBoundingClientRect();
  const onMove = e => {
    const r = rect();
    const cx = r.left + r.width/2;
    const cy = r.top + r.height/2;
    const dx = (e.clientX - cx) / (r.width/2);
    const dy = (e.clientY - cy) / (r.height/2);
    const rotX = dy * -8, rotY = dx * 8;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
  };
  const reset = () => card.style.transform = 'rotateX(0deg) rotateY(0deg)';
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseleave', reset);
});

// === MAGNETIC BUTTONS
$$('.magnetic').forEach(btn => {
  let rect = btn.getBoundingClientRect();
  const strength = 18;
  const onMove = e => {
    rect = btn.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width/2)) / (rect.width/2);
    const dy = (e.clientY - (rect.top + rect.height/2)) / (rect.height/2);
    btn.style.transform = `translate(${dx*strength}px, ${dy*strength}px)`;
  };
  const reset = () => btn.style.transform = 'translate(0,0)';
  btn.addEventListener('mousemove', onMove);
  btn.addEventListener('mouseleave', reset);
});

// === PARTICLES (subtle, performant)
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
function makeParticles(){
  const count = Math.min(120, Math.floor((canvas.width*canvas.height)/18000));
  particles = Array.from({length: count}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    vx: (Math.random()-0.5)*0.25,
    vy: (Math.random()-0.5)*0.25,
    r: Math.random()*1.6 + 0.4,
    a: Math.random()*0.4 + 0.15
  }));
}
function drawParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const p of particles){
    p.x += p.vx; p.y += p.vy;
    if(p.x<0||p.x>canvas.width) p.vx*=-1;
    if(p.y<0||p.y>canvas.height) p.vy*=-1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(124,92,255,${p.a})`;
    ctx.fill();
  }
  requestAnimationFrame(drawParticles);
}
resizeCanvas(); makeParticles(); drawParticles();
window.addEventListener('resize', () => { resizeCanvas(); makeParticles(); });

// === HERO BLOB (smooth organic morph)


// === CAROUSEL
(function(){
  const track = $('.carousel__track');
  const slides = $$('.slide', track);
  const prev = $('.carousel__prev');
  const next = $('.carousel__next');
  let idx = 0;
  function update(){
    track.scrollTo({left: slides[idx].offsetLeft, behavior: 'smooth'});
  }
  prev.addEventListener('click', () => { idx=(idx-1+slides.length)%slides.length; update(); });
  next.addEventListener('click', () => { idx=(idx+1)%slides.length; update(); });
})();

// === CONTACT FORM (client-side validation + fake send)
$('.contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.currentTarget;
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const message = $('#message').value.trim();

  // Basic validation
  let ok = true;
  const setErr = (id, msg='') => { $(`#${id}`).closest('.field').querySelector('.error').textContent = msg; if(msg) ok=false; };
  setErr('name'); setErr('email'); setErr('message');
  if (name.length < 2) setErr('name', 'Please enter your name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) setErr('email', 'Please enter a valid email.');
  if (message.length < 10) setErr('message', 'Please write a slightly longer message.');

  if (!ok) return;

  const status = $('.form-status');
  status.textContent = 'Sending…';
  // Fake async
  setTimeout(() => {
    status.textContent = 'Thanks! I’ll get back to you within 24 hours.';
    form.reset();
  }, 800);
});
