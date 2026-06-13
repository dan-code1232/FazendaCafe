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
