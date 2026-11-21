(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(hover: none)').matches;
  var body = document.body;

  /* loader */
  var started = false;
  function start() {
    if (started) return; started = true;
    var l = $('#loader'); if (l) l.classList.add('done');
    body.classList.remove('loading');
    $$('.hero .rv, .hero .display').forEach(function (el) { el.classList.add('in'); });
  }
  addEventListener('load', function () { setTimeout(start, 900); });
  setTimeout(start, 3000);

  /* reveal */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.rv, .display, .giant').forEach(function (el) { if (!el.closest('.hero')) io.observe(el); });

  /* scroll effects */
  var nav = $('#nav'), bar = $('#bar'), rail = $('#rail'), tl = $('#tl');
  var links = $$('.nav nav a');
  var targets = links.map(function (a) { return $(a.getAttribute('href')); });
  var panels = $$('.panel'), pars = $$('[data-p]');
  var lastY = 0;
  function stackFx() {
    if (innerWidth <= 900) { panels.forEach(function (p) { p.style.transform = ''; p.style.filter = ''; }); return; }
    panels.forEach(function (p, i) {
      var n = panels[i + 1]; if (!n) return;
      var t = Math.min(Math.max(1 - (n.getBoundingClientRect().top - 104) / (innerHeight * 0.7), 0), 1);
      p.style.transform = 'scale(' + (1 - t * 0.06) + ')';
      p.style.filter = 'brightness(' + (1 - t * 0.45) + ')';
    });
  }
  function onScroll() {
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    nav.classList.toggle('solid', y > 30);
    nav.classList.toggle('hide', y > lastY && y > 400);
    lastY = y;
    var cur = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    if (tl && rail) {
      var r = tl.getBoundingClientRect();
      rail.style.height = Math.min(Math.max((innerHeight * 0.7 - r.top) / r.height, 0), 1) * 100 + '%';
    }
    if (!reduce) pars.forEach(function (el) { el.style.transform = 'translate3d(0,' + (y * parseFloat(el.dataset.p)) + 'px,0)'; });
    stackFx();
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = $(a.getAttribute('href')); if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* dust particles (depth) */
  var cv = $('#dust');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(devicePixelRatio || 1, 2), pts = [];
    var resize = function () {
      W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      for (var i = 0; i < Math.min(Math.floor(W * H / 20000), 60); i++)
        pts.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 0.9 + 0.1, v: Math.random() * 0.25 + 0.05 });
    };
    addEventListener('resize', resize); resize();
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      var sy = scrollY;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.y -= p.v * p.z; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        var yy = ((p.y - sy * p.z * 0.35) % H + H) % H;
        ctx.beginPath(); ctx.arc(p.x, yy, p.z * 1.6, 0, 6.283);
        ctx.fillStyle = 'rgba(190,215,255,' + (0.12 + p.z * 0.35) + ')'; ctx.fill();
      }
      requestAnimationFrame(draw);
    })();
  }

  /* hulhup: pupils, blink */
  var pgs = $$('.pg'), char = $('#char');
  function look(x, y) { pgs.forEach(function (p) { p.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }); }
  if (char) {
    char.addEventListener('click', function () { char.classList.remove('b'); void char.offsetWidth; char.classList.add('b'); });
  }
  if (touch && !reduce) {
    (function wander(t) { look(5 + Math.sin(t / 900) * 9, Math.cos(t / 1300) * 6); requestAnimationFrame(wander); })(0);
  }

  if (touch || reduce) return;

  /* custom cursor */
  var cur = $('#cur'), cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
  document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
  (function loop() { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
  $$('a, .btn, .char').forEach(function (el) {
    el.addEventListener('mouseenter', function () { cur.classList.add('big'); });
    el.addEventListener('mouseleave', function () { cur.classList.remove('big'); });
  });

  /* magnetic buttons */
  $$('.mag').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transform = ''; });
  });

  /* panel spotlight */
  panels.forEach(function (p) {
    p.addEventListener('mousemove', function (e) {
      var r = p.getBoundingClientRect();
      p.style.setProperty('--sx', (e.clientX - r.left) + 'px');
      p.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    });
  });

  /* mouse depth: hero mark, eyes, tilt */
  var mark = $('#mark'), pm = $('#pmark');
  addEventListener('mousemove', function (e) {
    var nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    if (mark) mark.style.transform = 'rotateY(' + nx * 16 + 'deg) rotateX(' + -ny * 12 + 'deg) translate(' + nx * 18 + 'px,' + ny * 12 + 'px)';
    look(5 + nx * 20, ny * 14);
    if (char) char.style.transform = 'perspective(900px) rotateY(' + nx * 16 + 'deg) rotateX(' + -ny * 12 + 'deg)';
    if (pm) pm.style.transform = 'perspective(900px) rotateY(' + nx * 18 + 'deg) rotateX(' + -ny * 14 + 'deg)';
  });
})();
