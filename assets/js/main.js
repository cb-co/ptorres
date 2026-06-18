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

  /* ── Mobile nav ── */
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');
  if (navToggle && navMobile) {
    var backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    function closeMobileNav() {
      navMobile.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navMobile.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    navToggle.addEventListener('click', function () {
      var isOpen = navMobile.classList.contains('is-open');
      if (isOpen) { closeMobileNav(); return; }
      navMobile.classList.add('is-open');
      navToggle.classList.add('is-open');
      backdrop.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navMobile.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
    navMobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileNav);
    });
    backdrop.addEventListener('click', closeMobileNav);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMobile.classList.contains('is-open')) closeMobileNav();
    });
  }

  /* ── Lightbox ── */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var projectImages = {
      merlot: [
        'assets/img/projects/merlot/01-salon.jpg',
        'assets/img/projects/merlot/02-foyer.jpg',
        'assets/img/projects/merlot/03-salon-wide.jpg',
        'assets/img/projects/merlot/04-kitchen.jpg',
        'assets/img/projects/merlot/05-dining.jpg',
        'assets/img/projects/merlot/06-bedroom.jpg',
        'assets/img/projects/merlot/07-tv-room.jpg',
        'assets/img/projects/merlot/08-dining-window.jpg',
        'assets/img/projects/merlot/09-coffee-table.jpg',
        'assets/img/projects/merlot/10-bedroom-sheer.jpg'
      ],
      merlot25: [
        'assets/img/projects/merlot25/04-panoramic.jpg',
        'assets/img/projects/merlot25/01-foyer.jpg',
        'assets/img/projects/merlot25/02-sconce.jpg',
        'assets/img/projects/merlot25/03-salon.jpg',
        'assets/img/projects/merlot25/05-dining.jpg',
        'assets/img/projects/merlot25/06-dining-detail.jpg',
        'assets/img/projects/merlot25/07-bedroom.jpg',
        'assets/img/projects/merlot25/08-bathroom.jpg',
        'assets/img/projects/merlot25/09-terrace.jpg',
        'assets/img/projects/merlot25/10-terrace-plants.jpg'
      ],
      costambar: [
        'assets/img/projects/costambar/01-living.jpg',
        'assets/img/projects/costambar/02-tv-wall.jpg',
        'assets/img/projects/costambar/03-open-plan.jpg',
        'assets/img/projects/costambar/04-kitchen.jpg',
        'assets/img/projects/costambar/05-dining-kitchen.jpg',
        'assets/img/projects/costambar/06-dining.jpg',
        'assets/img/projects/costambar/07-bedroom-lamp.jpg',
        'assets/img/projects/costambar/08-bedroom.jpg',
        'assets/img/projects/costambar/09-bedroom-wall.jpg',
        'assets/img/projects/costambar/10-bathroom.jpg'
      ]
    };
    var projectNames = { merlot: 'Gran Merlot · 2024', merlot25: 'Gran Merlot · 2025', costambar: 'Villa Costambar' };

    var lbImg     = document.getElementById('lbImg');
    var lbCount   = document.getElementById('lbCount');
    var lbProject = document.getElementById('lbProject');
    var lbClose   = document.getElementById('lbClose');
    var lbPrev    = document.getElementById('lbPrev');
    var lbNext    = document.getElementById('lbNext');

    var currentImages = [];
    var currentKey    = '';
    var currentIdx    = 0;

    function showImage() {
      lbImg.src = currentImages[currentIdx];
      lbImg.alt = (projectNames[currentKey] || '') + ' — foto ' + (currentIdx + 1);
      lbCount.textContent = (currentIdx + 1) + ' / ' + currentImages.length;
      lbProject.textContent = projectNames[currentKey] || '';
    }

    function openLightbox(key) {
      currentKey    = key;
      currentImages = projectImages[key] || [];
      currentIdx    = 0;
      showImage();
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(function () { lbImg.src = ''; }, 300);
    }

    function prevImage() { currentIdx = (currentIdx - 1 + currentImages.length) % currentImages.length; showImage(); }
    function nextImage() { currentIdx = (currentIdx + 1) % currentImages.length; showImage(); }

    document.querySelectorAll('[data-project]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openLightbox(el.getAttribute('data-project'));
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(el.getAttribute('data-project')); }
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function (e) { e.stopPropagation(); prevImage(); });
    lbNext.addEventListener('click', function (e) { e.stopPropagation(); nextImage(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  prevImage();
      if (e.key === 'ArrowRight') nextImage();
    });

    var touchStartX = 0;
    lb.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend',   function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? nextImage() : prevImage(); }
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

  /* ── Contact form: validation + POST to Web3Forms ── */
  var form = document.getElementById('contactForm');
  if (form) {
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('.btn-submit');

    function clearFieldError(input) {
      var field = input.closest('.field');
      if (!field) return;
      field.classList.remove('has-error');
      var err = field.querySelector('.field-error');
      if (err) err.remove();
    }

    function showFieldError(input, msg) {
      var field = input.closest('.field');
      if (!field) return;
      field.classList.add('has-error');
      if (!field.querySelector('.field-error')) {
        var err = document.createElement('p');
        err.className = 'field-error';
        err.textContent = msg;
        field.appendChild(err);
      }
    }

    function validateForm() {
      var valid = true;
      var nameEl    = form.querySelector('#name');
      var emailEl   = form.querySelector('#email');
      var messageEl = form.querySelector('#message');

      clearFieldError(nameEl); clearFieldError(emailEl); clearFieldError(messageEl);

      if (!nameEl.value.trim()) {
        showFieldError(nameEl, 'El nombre es obligatorio.');
        valid = false;
      }
      if (!emailEl.value.trim()) {
        showFieldError(emailEl, 'El correo es obligatorio.');
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
        showFieldError(emailEl, 'Introduce un correo válido.');
        valid = false;
      }
      if (!messageEl.value.trim()) {
        showFieldError(messageEl, 'El mensaje es obligatorio.');
        valid = false;
      }
      return valid;
    }

    ['#name', '#email', '#message'].forEach(function (sel) {
      var el = form.querySelector(sel);
      if (el) el.addEventListener('input', function () { clearFieldError(el); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm()) return;
      if (status) { status.textContent = ''; status.className = 'form-status'; }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }

      var data = Object.fromEntries(new FormData(form).entries());

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json(); })
        .then(function (r) {
          if (r.success) {
            form.reset();
            if (status) {
              status.textContent = 'Gracias. Hemos recibido tu mensaje y te responderemos pronto.';
              status.classList.add('is-success');
            }
          } else {
            throw new Error(r.message || 'Error');
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
  /* ── Custom select ── */
  document.querySelectorAll('.cs').forEach(function (cs) {
    var trigger = cs.querySelector('.cs-trigger');
    var val = cs.querySelector('.cs-val');
    var panel = cs.querySelector('.cs-panel');
    var opts = cs.querySelectorAll('.cs-opt');
    var hidden = cs.previousElementSibling; // the hidden input
    var focusIdx = -1;

    function open() {
      cs.setAttribute('aria-expanded', 'true');
      focusIdx = Array.from(opts).findIndex(function (o) { return o.classList.contains('is-selected'); });
      if (focusIdx >= 0) setFocus(focusIdx);
    }
    function close(restoreFocus) {
      cs.setAttribute('aria-expanded', 'false');
      opts.forEach(function (o) { o.classList.remove('is-focused'); });
      if (restoreFocus !== false) trigger.focus();
    }
    function select(opt) {
      opts.forEach(function (o) { o.classList.remove('is-selected'); });
      opt.classList.add('is-selected');
      val.textContent = opt.textContent;
      val.classList.remove('is-placeholder');
      if (hidden) hidden.value = opt.dataset.value;
      close();
    }
    function setFocus(idx) {
      opts.forEach(function (o) { o.classList.remove('is-focused'); });
      focusIdx = Math.max(0, Math.min(idx, opts.length - 1));
      opts[focusIdx].classList.add('is-focused');
      opts[focusIdx].scrollIntoView({ block: 'nearest' });
    }

    trigger.addEventListener('click', function () {
      var isOpen = cs.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    });
    opts.forEach(function (opt, i) {
      opt.addEventListener('click', function () { select(opt); });
      opt.addEventListener('mouseenter', function () { setFocus(i); });
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault(); open();
      }
    });
    cs.addEventListener('keydown', function (e) {
      var isOpen = cs.getAttribute('aria-expanded') === 'true';
      if (!isOpen) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocus(focusIdx + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFocus(focusIdx - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (focusIdx >= 0) select(opts[focusIdx]); }
      else if (e.key === 'Escape' || e.key === 'Tab') { close(); }
    });
    document.addEventListener('click', function (e) {
      if (!cs.contains(e.target)) close(false);
    });
    cs.closest('form') && cs.closest('form').addEventListener('reset', function () {
      opts.forEach(function (o) { o.classList.remove('is-selected'); });
      val.textContent = 'Selecciona una opción';
      val.classList.add('is-placeholder');
    });
  });

  /* ── Behold Instagram widget ── */
  if (document.querySelector('behold-widget')) {
    var s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://w.behold.so/widget.js';
    document.head.appendChild(s);
  }
})();
