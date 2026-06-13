window.addEventListener('scroll', () => {
  document.body.classList.toggle('scrolled', window.scrollY > 40);
});

document.addEventListener('DOMContentLoaded', () => {
  const reviewSearch = document.getElementById('reviewSearch');
  if (!reviewSearch) return;

  const reviewCards = Array.from(document.querySelectorAll('.review-card'));
  const noMatches = document.getElementById('noReviewResults');

  reviewSearch.addEventListener('input', () => {
    const needle = reviewSearch.value.trim().toLowerCase();
    let visible = 0;

    reviewCards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const match = !needle || text.includes(needle);
      card.style.display = match ? 'grid' : 'none';
      if (match) visible += 1;
    });

    if (noMatches) {
      noMatches.style.display = visible ? 'none' : 'block';
    }
  });
});

// Loader removal + reveal animations + scrollspy
document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    const loader = document.querySelector('.site-loader');
    if (loader) loader.classList.add('hidden');
  }
});

(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) ent.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Scrollspy for nav links
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));

  function onScrollSpy() {
    const y = window.scrollY + 120;
    let current = sections[0];
    for (const sec of sections) {
      if (sec.offsetTop <= y) current = sec;
    }
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current.id}`));
  }

  window.addEventListener('scroll', onScrollSpy);
  window.addEventListener('resize', onScrollSpy);
  onScrollSpy();

  // Smooth anchor scrolling (offset for sticky header)
  navLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// Enhanced cursor, history-like nav transitions, and ripple handling
document.addEventListener('DOMContentLoaded', () => {
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  const body = document.body;
  if (cursorDot && cursorOutline) {
    let mouseX = 0; let mouseY = 0;
    let outlineX = 0; let outlineY = 0;
    const lerp = (a,b,t)=> a + (b-a) * t;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    const render = () => {
      outlineX = lerp(outlineX, mouseX, 0.16);
      outlineY = lerp(outlineY, mouseY, 0.16);
      cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0)`;
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    // hover states
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .btn, .card, .menu-item')) document.documentElement.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .btn, .card, .menu-item')) document.documentElement.classList.remove('cursor-hover');
    });
  }

  // pushState-like behaviour and page transition
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  navLinks.forEach((a) => {
    a.addEventListener('click', (ev) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      ev.preventDefault();
      const id = href.slice(1);
      body.classList.add('transitioning');
      setTimeout(() => {
        const target = document.getElementById(id);
        if (target) window.scrollTo({ top: target.offsetTop - 92, behavior: 'smooth' });
        try { history.pushState({ section: id }, '', `#${id}`); } catch (e) {}
        document.title = `Fazenda — ${a.textContent.trim()}`;
        setTimeout(() => body.classList.remove('transitioning'), 520);
      }, 140);
    });
  });

  window.addEventListener('popstate', () => {
    const hash = location.hash || '#home';
    const id = hash.replace('#','');
    const target = document.getElementById(id);
    if (target) window.scrollTo({ top: target.offsetTop - 92, behavior: 'smooth' });
  });

  // Ripple coordinates for buttons
  document.querySelectorAll('.btn.ripple').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left + 'px';
      const y = e.clientY - r.top + 'px';
      btn.style.setProperty('--ripple-x', x);
      btn.style.setProperty('--ripple-y', y);
    });
  });

  // Ensure initial section from hash
  const initialHash = location.hash || '#home';
  if (initialHash) {
    const id = initialHash.replace('#','');
    const target = document.getElementById(id);
    if (target) setTimeout(()=> window.scrollTo({ top: target.offsetTop - 92, behavior: 'smooth' }), 120);
  }
});

/* Reviews slider (simple, accessible) */
(function(){
  const slider = document.querySelector('.reviews-slider');
  if (!slider) return;
  const slidesWrap = slider.querySelector('.slides');
  const slides = Array.from(slidesWrap.querySelectorAll('.slide'));
  let index = 0;

  function show(i){
    slides.forEach((s,idx)=> s.style.display = idx===i ? 'block' : 'none');
  }
  show(index);

  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  prev && prev.addEventListener('click', ()=>{ index = (index-1+slides.length)%slides.length; show(index); });
  next && next.addEventListener('click', ()=>{ index = (index+1)%slides.length; show(index); });

  // auto-rotate
  let timer = setInterval(()=>{ index = (index+1)%slides.length; show(index); }, 6000);
  slider.addEventListener('mouseover', ()=> clearInterval(timer));
  slider.addEventListener('mouseout', ()=> timer = setInterval(()=>{ index = (index+1)%slides.length; show(index); }, 6000));
})();

/* Simple masonry rearrange on resize for images already using CSS columns */
(function(){
  const ms = document.querySelector('.masonry');
  if (!ms) return;
  function ensure(){ /* images are auto-flowing via CSS columns */ }
  window.addEventListener('resize', ensure);
  ensure();
})();

/* Catering form: basic client-side validation and mocked success */
(function(){
  const form = document.getElementById('cateringForm');
  if (!form) return;
  const msg = document.getElementById('formMessage');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    if (!data.get('name') || !data.get('email')){
      msg.textContent = 'Please provide name and email.';
      msg.style.color = '#c00';
      return;
    }
    msg.textContent = 'Sending…';
    // simulate send
    setTimeout(()=>{
      msg.textContent = 'Thanks! We will reply within 1-2 business days.';
      msg.style.color = 'var(--sage-dark)';
      form.reset();
    }, 800);
  });
})();

/* Improve keyboard accessibility for slider buttons */
document.addEventListener('keydown', (e)=>{
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
    const slider = document.querySelector('.reviews-slider');
    if (!slider) return;
    const prev = slider.querySelector('.prev');
    const next = slider.querySelector('.next');
    if (e.key === 'ArrowLeft') prev && prev.click();
    if (e.key === 'ArrowRight') next && next.click();
  }
});

