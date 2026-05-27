(function () {
  'use strict';

  /* ── Theme: light is the default regardless of OS. Honor saved choice. ── */
  var html = document.documentElement;
  var saved = localStorage.getItem('tr-theme');
  html.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');

  var btn = document.getElementById('themeToggle');
  if (btn) {
    var updateAria = function () {
      var dark = html.getAttribute('data-theme') === 'dark';
      btn.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    };
    updateAria();
    btn.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('tr-theme', next);
      updateAria();
    });
  }

  /* ── Scroll reveal ── */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Gallery category filter ── */
  var filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    var projects = document.querySelectorAll('.gallery-grid .project');
    filterBtns.forEach(function (fb) {
      fb.addEventListener('click', function () {
        var cat = fb.getAttribute('data-filter');
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
        fb.classList.add('is-active');
        projects.forEach(function (p) {
          var show = cat === 'all' || p.getAttribute('data-category') === cat;
          p.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ── FAQ accordion ── */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        var oa = other.querySelector('.faq-a');
        if (oa) oa.style.maxHeight = null;
        var oq = other.querySelector('.faq-q');
        if (oq) oq.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Contact form: POST to /api/contact, graceful UX ── */
  var form = document.getElementById('contactForm');
  if (form) {
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('.btn-submit');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) { status.textContent = ''; status.className = 'form-status'; }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }

      var data = Object.fromEntries(new FormData(form).entries());

      fetch(form.action || '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (r) {
          if (r.ok) {
            form.reset();
            if (status) {
              status.textContent = 'Gracias. Hemos recibido tu mensaje y te responderemos pronto.';
              status.classList.add('is-success');
            }
          } else {
            throw new Error((r.body && r.body.error) || 'Error');
          }
        })
        .catch(function () {
          if (status) {
            status.textContent = 'No pudimos enviar el mensaje. Escríbenos a info@trarq.com.';
            status.classList.add('is-error');
          }
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Enviar mensaje'; }
        });
    });
  }
})();
