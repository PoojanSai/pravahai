/* ============================================================
   PRAVAH 2026 — JavaScript
   ============================================================ */

'use strict';

/* ---------------------------------------------------------------
   1. UTILITY
--------------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------------------------------------------------------------
   2. PARTICLE BACKGROUND
--------------------------------------------------------------- */
(function initParticles() {
  const canvas = $('#particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -1000, y: -1000 };
  const MAX = 90;
  const COLORS = ['#8b5cf6','#06b6d4','#a855f7','#ec4899','#818cf8'];

  class Particle {
    constructor() { this.reset(true); }
    reset(random) {
      this.x   = Math.random() * W;
      this.y   = random ? Math.random() * H : H + 10;
      this.r   = Math.random() * 1.8 + 0.5;
      this.vx  = (Math.random() - 0.5) * 0.4;
      this.vy  = -(Math.random() * 0.6 + 0.2);
      this.life= Math.random() * 200 + 100;
      this.age = random ? Math.floor(Math.random() * this.life) : 0;
      this.clr = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha= Math.random() * 0.6 + 0.2;
    }
    update() {
      this.age++;
      const mx = this.x - mouse.x, my = this.y - mouse.y;
      const dist = Math.sqrt(mx*mx + my*my);
      if (dist < 120) {
        const f = (120 - dist) / 120 * 0.015;
        this.vx += mx * f; this.vy += my * f;
      }
      this.vx *= 0.99; this.vy *= 0.99;
      this.x += this.vx; this.y += this.vy;
      if (this.age > this.life || this.y < -10) this.reset(false);
    }
    draw() {
      const fadeRatio = Math.min(this.age / 30, 1) * Math.min((this.life - this.age) / 30, 1);
      ctx.globalAlpha = this.alpha * fadeRatio;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.clr;
      ctx.fill();
    }
  }

  // Connection lines
  function drawConnections() {
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 90) {
          ctx.beginPath();
          ctx.globalAlpha = (1 - d / 90) * 0.12;
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 0.5;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    particles = Array.from({ length: MAX }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });

  init();
  loop();
})();

/* ---------------------------------------------------------------
   3. NAVBAR — scroll + mobile toggle
--------------------------------------------------------------- */
(function initNavbar() {
  const nav     = $('#navbar');
  const toggle  = $('#menuToggle');
  const links   = $('#navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  toggle.addEventListener('click', () => links.classList.toggle('open'));

  // Close menu on nav link click
  $$('.nav-link', links).forEach(link => {
    link.addEventListener('click', () => links.classList.remove('open'));
  });
})();

/* ---------------------------------------------------------------
   4. DARK / LIGHT THEME TOGGLE
--------------------------------------------------------------- */
(function initTheme() {
  const btn  = $('#themeToggle');
  const icon = $('#themeIcon');
  const html = document.documentElement;
  const saved = localStorage.getItem('pravahai-theme') || 'dark';

  html.setAttribute('data-theme', saved);
  icon.textContent = saved === 'dark' ? '☀️' : '🌙';

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    icon.textContent = next === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('pravahai-theme', next);
  });
})();

/* ---------------------------------------------------------------
   5. COUNTDOWN TIMER
--------------------------------------------------------------- */
(function initCountdown() {
  const eventDate = new Date('2026-04-15T09:00:00');
  const daysEl  = $('#countdown-days');
  const hoursEl = $('#countdown-hours');
  const minsEl  = $('#countdown-mins');
  const secsEl  = $('#countdown-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function animateFlip(el, val) {
    const str = pad(val);
    if (el.textContent === str) return;
    el.textContent = str;
    el.classList.remove('count-flip');
    void el.offsetWidth; // reflow
    el.classList.add('count-flip');
  }

  function tick() {
    const now  = new Date();
    const diff = eventDate - now;

    if (diff <= 0) {
      $$('.count-number').forEach(el => el.textContent = '00');
      return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);

    animateFlip(daysEl,  days);
    animateFlip(hoursEl, hours);
    animateFlip(minsEl,  mins);
    animateFlip(secsEl,  secs);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ---------------------------------------------------------------
   6. SCHEDULE TABS
--------------------------------------------------------------- */
(function initTabs() {
  const tabBtns = $$('.tab-btn');
  const contents = $$('.schedule-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const day = btn.dataset.day;
      tabBtns.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = $('#' + day);
      if (target) {
        target.classList.add('active');
        // Re-trigger fade animation
        $$('.timeline-item', target).forEach((item, i) => {
          item.style.opacity = '0';
          item.style.transform = 'translateX(20px)';
          setTimeout(() => {
            item.style.transition = '0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, i * 80);
        });
      }
    });
  });
})();

/* ---------------------------------------------------------------
   7. SCROLL FADE-IN ANIMATION (IntersectionObserver)
--------------------------------------------------------------- */
(function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  $$('.fade-in').forEach(el => observer.observe(el));
})();

/* ---------------------------------------------------------------
   8. REGISTRATION FORM + VALIDATION
--------------------------------------------------------------- */
(function initForm() {
  const form       = $('#registrationForm');
  const successMsg = $('#successMsg');
  const submitBtn  = $('#submitBtn');
  const submitText = $('#submitText');
  const registerAgainBtn = $('#registerAgainBtn');

  function showError(fieldId, msg) {
    const input = $('#' + fieldId);
    const errEl = $('#' + fieldId + '-error');
    if (input)  input.classList.add('error');
    if (errEl)  errEl.textContent = msg;
  }

  function clearError(fieldId) {
    const input = $('#' + fieldId);
    const errEl = $('#' + fieldId + '-error');
    if (input)  input.classList.remove('error');
    if (errEl)  errEl.textContent = '';
  }

  // Real-time clearing of errors on input
  ['fullName','email','phone','college','year','event'].forEach(id => {
    const el = $('#' + id);
    if (el) {
      el.addEventListener('input', () => clearError(id));
      el.addEventListener('change', () => clearError(id));
    }
  });

  function validate() {
    let valid = true;

    const fullName = $('#fullName').value.trim();
    if (!fullName || fullName.length < 2) {
      showError('fullName', 'Please enter your full name (at least 2 characters).');
      valid = false;
    } else clearError('fullName');

    const email = $('#email').value.trim();
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) {
      showError('email', 'Please enter a valid email address.');
      valid = false;
    } else clearError('email');

    const phone = $('#phone').value.trim().replace(/\s/g,'');
    const phoneRx = /^\+?[\d\-]{7,15}$/;
    if (!phoneRx.test(phone)) {
      showError('phone', 'Enter a valid phone number (7–15 digits).');
      valid = false;
    } else clearError('phone');

    const college = $('#college').value.trim();
    if (!college || college.length < 3) {
      showError('college', 'Please enter your college name.');
      valid = false;
    } else clearError('college');

    const year = $('#year').value;
    if (!year) {
      showError('year', 'Please select your year of study.');
      valid = false;
    } else clearError('year');

    const event = $('#event').value;
    if (!event) {
      showError('event', 'Please select an event category.');
      valid = false;
    } else clearError('event');

    const terms = $('#terms').checked;
    if (!terms) {
      $('#terms-error').textContent = 'You must agree to the terms to register.';
      valid = false;
    } else {
      $('#terms-error').textContent = '';
    }

    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = '⏳ Registering...';

    setTimeout(() => {
      form.style.display = 'none';
      successMsg.style.display = 'block';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      launchConfetti();
      submitBtn.disabled = false;
      submitText.textContent = '🚀 Register for PRAVAHAI 2026';
    }, 1200);
  });

  registerAgainBtn.addEventListener('click', () => {
    form.reset();
    ['fullName','email','phone','college','year','event'].forEach(id => clearError(id));
    $('#terms-error').textContent = '';
    successMsg.style.display = 'none';
    form.style.display = 'block';
  });
})();

/* ---------------------------------------------------------------
   9. CONFETTI ANIMATION
--------------------------------------------------------------- */
function launchConfetti() {
  const canvas = $('#confettiCanvas');
  canvas.style.display = 'block';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const COLORS = [
    '#8b5cf6','#06b6d4','#ec4899','#f59e0b','#10b981',
    '#818cf8','#c084fc','#a855f7','#fff','#ffd700'
  ];

  const pieces = Array.from({ length: 180 }, () => ({
    x:   Math.random() * canvas.width,
    y:   -Math.random() * canvas.height * 0.5 - 10,
    r:   Math.random() * 8 + 3,
    d:   Math.random() * 180 + 1,
    clr: COLORS[Math.floor(Math.random() * COLORS.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05,
    speed: Math.random() * 3 + 2,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.1,
  }));

  let frame = 0;
  const MAX_FRAMES = 300;

  function drawPiece(p) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, (MAX_FRAMES - frame) / 60);
    ctx.fillStyle = p.clr;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    if (p.shape === 'rect') {
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function animate() {
    if (frame > MAX_FRAMES) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      p.x += Math.sin(p.d) * 1.5;
      p.rotation += p.rotSpeed;
      p.tiltAngle += p.tiltSpeed;
      p.tilt = Math.sin(p.tiltAngle) * 12;
      drawPiece(p);
    });
    frame++;
    requestAnimationFrame(animate);
  }
  animate();
}

/* ---------------------------------------------------------------
   10. BUTTON RIPPLE EFFECT (Click)
--------------------------------------------------------------- */
(function initRipple() {
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = this.querySelector('.btn-ripple');
      if (!ripple) return;
      ripple.style.opacity = '1';
      ripple.style.transform = 'scale(2)';
      setTimeout(() => {
        ripple.style.opacity = '0';
        ripple.style.transform = 'scale(0)';
      }, 600);
    });
  });
})();

/* ---------------------------------------------------------------
   11. GALLERY LIGHTBOX (simple)
--------------------------------------------------------------- */
(function initGalleryLightbox() {
  $$('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:9998;
        background:rgba(0,0,0,0.92);
        display:flex;align-items:center;justify-content:center;
        cursor:zoom-out;animation:fadeIn 0.2s ease;
      `;
      const style = document.createElement('style');
      style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
      document.head.appendChild(style);

      const big = document.createElement('img');
      big.src = img.src;
      big.alt = img.alt;
      big.style.cssText = `
        max-width:90vw;max-height:85vh;object-fit:contain;
        border-radius:12px;box-shadow:0 0 60px rgba(139,92,246,0.4);
      `;
      overlay.appendChild(big);
      document.body.appendChild(overlay);

      overlay.addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.transition = '0.2s ease';
        setTimeout(() => overlay.remove(), 200);
      });

      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { overlay.click(); document.removeEventListener('keydown', esc); }
      });
    });
  });
})();

/* ---------------------------------------------------------------
   12. NEWSLETTER SUBSCRIPTION (fake)
--------------------------------------------------------------- */
(function initNewsletter() {
  const btn   = $('#newsletterBtn');
  const input = $('#newsletterEmail');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const val = input.value.trim();
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(val)) {
      input.style.borderColor = '#ec4899';
      input.placeholder = 'Enter a valid email!';
      setTimeout(() => {
        input.style.borderColor = '';
        input.placeholder = 'Enter your email';
      }, 2000);
      return;
    }
    btn.textContent = '✅ Done!';
    btn.style.background = 'linear-gradient(135deg,#10b981,#06b6d4)';
    input.value = '';
    input.placeholder = 'Youre subscribed! 🎉';
    setTimeout(() => {
      btn.textContent = 'Subscribe';
      btn.style.background = '';
      input.placeholder = 'Enter your email';
    }, 3000);
  });
})();

/* ---------------------------------------------------------------
   13. ACTIVE NAV LINK on scroll
--------------------------------------------------------------- */
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.style.color = '');
        const active = navLinks.find(a => a.getAttribute('href') === '#' + entry.target.id);
        if (active) active.style.color = 'var(--clr-primary)';
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
})();

/* ---------------------------------------------------------------
   14. HERO REGISTER BUTTON — scroll to form
--------------------------------------------------------------- */
(function initHeroBtn() {
  const btn = $('#heroRegisterBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const form = $('#register');
      if (form) form.scrollIntoView({ behavior: 'smooth' });
    });
  }
})();

/* ---------------------------------------------------------------
   15. CARD TILT EFFECT (subtle 3-D on mouse move)
--------------------------------------------------------------- */
(function initCardTilt() {
  $$('.event-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ---------------------------------------------------------------
   16. SMOOTH SCROLL for all anchor links
--------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
