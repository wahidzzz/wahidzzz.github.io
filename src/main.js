import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initThreeScene } from './three-scene.js';
import { initMiniGame } from './minigame.js';

gsap.registerPlugin(ScrollTrigger);

// PRELOADER
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const barFill = document.querySelector('.preloader-bar-fill');
  if (!preloader) {
    document.body.style.overflow = 'auto';
    return;
  }
  if (!barFill) {
    preloader.classList.add('hidden');
    document.body.style.overflow = 'auto';
    return;
  }
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 18 + 4;
    if (p > 100) p = 100;
    barFill.style.width = p + '%';
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }, 300);
    }
  }, 70);
}

// CURSOR
function initCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  let mx = 0, my = 0, dx = 0, dy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx+'px'; dot.style.top = my+'px'; });
  (function loop() { dx += (mx-dx)*.12; dy += (my-dy)*.12; ring.style.left = dx+'px'; ring.style.top = dy+'px'; requestAnimationFrame(loop); })();
  document.querySelectorAll('a,button,.bento-card,.j-card,.project,.btn-primary,.btn-ghost').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

// SCROLL PROGRESS
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => { bar.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%'; });
}

// NAV
function initNav() {
  const nav = document.getElementById('main-nav');
  let last = 0;
  window.addEventListener('scroll', () => {
    const cur = window.scrollY;
    nav.classList.toggle('hidden', cur > last && cur > 100);
    last = cur;
    const sections = document.querySelectorAll('#hero,#about,#journey,#work,#contact');
    const links = document.querySelectorAll('.nav-link');
    let active = '';
    sections.forEach(s => { if (cur >= s.offsetTop - 200) active = s.id; });
    links.forEach(l => { l.classList.toggle('active', l.dataset.section === active); });
  });
  document.querySelectorAll('.nav-link,.btn-primary,.btn-ghost,.hero-scroll').forEach(l => {
    l.addEventListener('click', e => { const h = l.getAttribute('href'); if (h?.startsWith('#')) { e.preventDefault(); document.querySelector(h)?.scrollIntoView({behavior:'smooth'}); } });
  });
}

// REVEAL
function initReveal() {
  const els = document.querySelectorAll('.about-wrap,.about-aside,.j-card,.project,.contact-header,.contact-bento,.journey-header,.work-intro,.consulting-header,.consulting-card,.about-bento-stats');
  els.forEach(el => el.classList.add('reveal'));
  const allReveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  allReveals.forEach(el => obs.observe(el));
}

// TEXT REVEAL (ABOUT SECTION)
function initTextReveal() {
  const textElements = document.querySelectorAll('.reveal-text');
  
  textElements.forEach(textEl => {
    const text = textEl.innerText;
    textEl.innerHTML = '';
    text.split(' ').forEach(word => {
      const span = document.createElement('span');
      span.innerText = word;
      textEl.appendChild(span);
      textEl.appendChild(document.createTextNode(' '));
    });

    gsap.to(textEl.querySelectorAll('span'), {
      color: '#ffffff',
      stagger: 0.1,
      scrollTrigger: {
        trigger: textEl,
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: true
      }
    });
  });
}

// PROJECT TILT
function initTilt() {
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(600px) rotateX(${-y*5}deg) rotateY(${x*5}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// NEURAL NETWORK CANVAS
function initNeural() {
  const container = document.getElementById('neural-canvas');
  if (!container) return;
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  canvas.style.cssText = 'width:100%;height:100%';
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  const nodes = Array.from({length:50}, () => ({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-.5)*.6, vy:(Math.random()-.5)*.6, r:Math.random()*2+1 }));
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) {
      const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);
      if(d<130){ctx.strokeStyle=`rgba(255,45,85,${(1-d/130)*.35})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.stroke();}
    }
    nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>canvas.width)n.vx*=-1;if(n.y<0||n.y>canvas.height)n.vy*=-1;ctx.fillStyle='rgba(255,45,85,.7)';ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill();});
    requestAnimationFrame(draw);
  })();
}



document.addEventListener('DOMContentLoaded', () => {
  document.body.style.overflow = 'hidden';
  // --- AMBIENT GLOW TRACKING ---
  const glow = document.querySelector('.ambient-glow');
  if (glow) {
    let glowX = window.innerWidth / 2;
    let glowY = window.innerHeight / 2;
    document.addEventListener('mousemove', (e) => {
      glowX = e.clientX;
      glowY = e.clientY;
    });
    
    function animateGlow() {
      // Smooth lerp
      const currentX = parseFloat(glow.style.left || window.innerWidth / 2);
      const currentY = parseFloat(glow.style.top || window.innerHeight / 2);
      glow.style.left = `${currentX + (glowX - currentX) * 0.05}px`;
      glow.style.top = `${currentY + (glowY - currentY) * 0.05}px`;
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }
  
  // Initialize floating 3D shapes
  initThreeScene();
  
  // Initialize minigame
  initMiniGame();
  
  // Initialize horizontal scroll for projects
  initReveal();
  initTextReveal();
  initHorizontalScroll();
  
  initPreloader();
  initCursor();
  initScrollProgress();
  initNav();
  initReveal();
  initTilt();
  initNeural();
});

// HORIZONTAL SCROLL FOR PROJECTS
function initHorizontalScroll() {
  const workSection = document.getElementById('work');
  const workTrack = document.querySelector('.work-horizontal-track');
  if (!workSection || !workTrack) return;

  function getScrollAmount() {
    let trackWidth = workTrack.scrollWidth;
    return -(trackWidth - window.innerWidth + (window.innerWidth * 0.1));
  }

  const tween = gsap.to(workTrack, {
    x: getScrollAmount,
    ease: "none"
  });

  ScrollTrigger.create({
    trigger: ".work-sticky-container",
    start: "top top",
    end: () => `+=${getScrollAmount() * -1}`,
    pin: true,
    animation: tween,
    scrub: 1,
    invalidateOnRefresh: true
  });
}
