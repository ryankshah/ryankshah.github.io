/* =========================================================================
   ryankshah.com — interaction layer
   ========================================================================= */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Frameworks ticker -------------------------------------- */
  function buildTicker() {
    var track = document.getElementById('ticker');
    if (!track) return;
    var items = [
      'ISO 27001', 'ISO 27701', 'ISO 22301', 'ISO 22237', 'ISO 42001',
      'UK GDPR', 'EU GDPR', 'DORA', 'NIS 2', 'NCSC CAF', 'NIST CSF',
      'EU AI Act', 'EU CRA', 'CCPA', 'TPRM', 'vCISO', 'vISM', 'BCM'
    ];
    // duplicate the set so the -50% translate loop is seamless
    var html = '';
    var doubled = items.concat(items);
    for (var i = 0; i < doubled.length; i++) {
      html += '<span class="ticker__item">' + doubled[i] + '</span>';
    }
    track.innerHTML = html;
  }

  /* ---------- 2. Publication filter ------------------------------------- */
  function buildFilter() {
    var filters = document.getElementById('filters');
    var pubs = Array.prototype.slice.call(document.querySelectorAll('#pubs .pub'));
    var countEl = document.getElementById('pubCount');
    if (!filters || !pubs.length) return;

    function setCount(n) {
      if (countEl) countEl.textContent = String(n).padStart(2, '0') + ' / ' + pubs.length + ' papers';
    }

    function apply(theme) {
      var shown = 0;
      pubs.forEach(function (p) {
        var themes = (p.getAttribute('data-theme') || '').split(/\s+/);
        var match = theme === 'all' || themes.indexOf(theme) !== -1;
        if (match) { p.classList.remove('is-hidden'); shown++; }
        else { p.classList.add('is-hidden'); }
      });
      setCount(shown);
    }

    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      filters.querySelectorAll('.filter').forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      apply(btn.getAttribute('data-filter'));
    });

    setCount(pubs.length);
  }

  /* ---------- 3. Scroll reveal ------------------------------------------ */
  function buildReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 4. Signature waveform ------------------------------------- */
  /* A procedural oscilloscope trace: a sum of sines + jitter, a nod to the
     acoustic / RF side-channel research. Renders in ink with occasional
     accent ticks. Static single frame under reduced-motion. */
  function buildWave() {
    var canvas = document.getElementById('wave');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var phase = 0;

    function readColours() {
      var cs = getComputedStyle(document.documentElement);
      return {
        ink: (cs.getPropertyValue('--ink') || '#1c1b16').trim(),
        accent: (cs.getPropertyValue('--accent') || '#be3a20').trim(),
        faint: (cs.getPropertyValue('--ink-faint') || '#8a8473').trim()
      };
    }
    var col = readColours();

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      col = readColours();
    }

    // deterministic pseudo-noise so the trace looks like a captured signal
    function noise(x) {
      return Math.sin(x * 12.9898) * 43758.5453 % 1;
    }

    function trace(t) {
      var mid = H / 2;
      var amp = H * 0.22;
      ctx.clearRect(0, 0, W, H);

      // baseline
      ctx.strokeStyle = col.faint;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(W, mid);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // the trace
      ctx.beginPath();
      var step = 2;
      for (var x = 0; x <= W; x += step) {
        var u = x / W;
        var y = mid
          + Math.sin(u * 14 + t) * amp * 0.45
          + Math.sin(u * 41 - t * 1.7) * amp * 0.22
          + Math.sin(u * 7 + t * 0.6) * amp * 0.30
          + (noise(x + Math.floor(t * 4)) - 0.5) * amp * 0.20
          // a localised "burst" that sweeps across, like a detected event
          + Math.exp(-Math.pow((u - ((t * 0.06) % 1.4 - 0.2)) * 9, 2)) * amp * 0.55;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = col.ink;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // accent marker riding the burst peak
      var bx = ((t * 0.06) % 1.4 - 0.2) * W;
      if (bx > 0 && bx < W) {
        ctx.fillStyle = col.accent;
        ctx.fillRect(bx - 1, 0, 2, H);
        ctx.beginPath();
        ctx.arc(bx, mid, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    resize();
    window.addEventListener('resize', resize);

    if (reduceMotion) {
      trace(2.2);
      return;
    }

    function loop() {
      phase += 0.02;
      trace(phase);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // expose a colour refresh so the Tweaks panel can re-read variables
    window.__waveRefresh = function () { col = readColours(); };
  }

  /* ---------- 5. Active-section nav highlight ---------------------------- */
  function buildNavSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    var map = {};
    links.forEach(function (l) {
      var id = l.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = l;
    });
    var ids = Object.keys(map);
    if (!ids.length || !('IntersectionObserver' in window)) return;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.style.color = ''; });
          var active = map[entry.target.id];
          if (active) active.style.color = 'var(--ink)';
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ---------- 6. Close mobile menu on nav click ------------------------- */
  function buildMenuClose() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) nav.classList.remove('open');
    });
  }

  function init() {
    buildTicker();
    buildFilter();
    buildReveal();
    buildWave();
    buildNavSpy();
    buildMenuClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
