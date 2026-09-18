// Madhibha eHub UI & Scroll Animation Engine
(function () {
  function init() {
    // 1. Inject Top Scroll Progress Bar if not present
    if (!document.getElementById('ehub-scroll-progress')) {
      const progressBar = document.createElement('div');
      progressBar.id = 'ehub-scroll-progress';
      document.body.prepend(progressBar);
    }

    // 2. Select key content boxes and text sections to animate with smooth, graceful pacing
    const revealConfigs = [
      { selector: '.heading-3', delay: 0 },
      { selector: '.about-grid', delay: 0.12 },
      { selector: '.story-card-box', delay: 0.12 },
      { selector: '.about-box', delay: 0.12 },
      { selector: '.our-services-grid > div', delay: 0.18 },
      { selector: '.rl_cta26_component', delay: 0.1 }
    ];

    const elementsToWatch = [];

    revealConfigs.forEach((cfg) => {
      const els = document.querySelectorAll(cfg.selector);
      els.forEach((el, index) => {
        if (el.classList.contains('reveal-init')) return;
        el.classList.add('reveal-init');
        const staggerDelay = cfg.delay + (index % 3) * 0.12;
        el.style.transitionDelay = `${staggerDelay}s`;
        elementsToWatch.push(el);
      });
    });

    // 3. Fallback & Active Trigger Function
    function checkVisibility() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || 800;
      const triggerMargin = windowHeight * 0.94;

      elementsToWatch.forEach((el) => {
        if (!el.classList.contains('reveal-active')) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerMargin && rect.bottom >= 0) {
            el.classList.add('reveal-active');
          }
        }
      });

      // Update progress bar if scrollable
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight = (document.documentElement.scrollHeight || 1000) - windowHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      const bar = document.getElementById('ehub-scroll-progress');
      if (bar) {
        bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    }

    // 4. Use IntersectionObserver with a gentle margin for smooth scrolling
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      });

      elementsToWatch.forEach((el) => observer.observe(el));
    }

    // Passive listeners for responsive iframe and nested scrolling support
    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility, { passive: true });

    // Initial check after paint
    setTimeout(checkVisibility, 60);
    setTimeout(checkVisibility, 300);

    // Long safety net fallback only if scroll events are never received (e.g., deeply nested container)
    setTimeout(() => {
      elementsToWatch.forEach((el) => {
        if (!el.classList.contains('reveal-active')) {
          el.classList.add('reveal-active');
        }
      });
    }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
