(function () {
  'use strict';

  /* ── Theme: light is the default regardless of OS. Honor saved choice.
     An inline <head> snippet applies a saved "dark" before first paint;
     this re-applies it and wires the toggle. Storage access can throw
     (blocked site data, some private modes), so it is always guarded. ── */
  var html = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('tr-theme'); } catch (err) {}
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
      try { localStorage.setItem('tr-theme', next); } catch (err) {}
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

    function closeMobileNav(restoreFocus) {
      navMobile.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú');
      navMobile.inert = true;
      document.body.style.overflow = '';
      if (restoreFocus) navToggle.focus();
    }
    navToggle.addEventListener('click', function () {
      var isOpen = navMobile.classList.contains('is-open');
      if (isOpen) { closeMobileNav(); return; }
      navMobile.classList.add('is-open');
      navToggle.classList.add('is-open');
      backdrop.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Cerrar menú');
      navMobile.inert = false;
      document.body.style.overflow = 'hidden';
      var firstLink = navMobile.querySelector('a');
      if (firstLink) firstLink.focus();
    });
    navMobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { closeMobileNav(); });
    });
    backdrop.addEventListener('click', function () { closeMobileNav(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMobile.classList.contains('is-open')) closeMobileNav(true);
    });
  }

  /* ── Lightbox ── */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var projectImages = {
      merlot: ['01-salon', '02-foyer', '03-salon-wide', '04-kitchen', '05-dining',
               '06-bedroom', '07-tv-room', '08-dining-window', '09-coffee-table', '10-bedroom-sheer'],
      merlot25: ['04-panoramic', '01-foyer', '02-sconce', '03-salon', '05-dining',
                 '06-dining-detail', '07-bedroom', '08-bathroom', '09-terrace', '10-terrace-plants'],
      costambar: ['01-living', '02-tv-wall', '03-open-plan', '04-kitchen', '05-dining-kitchen',
                  '06-dining', '07-bedroom-lamp', '08-bedroom', '09-bedroom-wall', '10-bathroom']
    };
    Object.keys(projectImages).forEach(function (key) {
      projectImages[key] = projectImages[key].map(function (name) {
        return 'assets/img/projects/' + key + '/' + name + '.webp';
      });
    });
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
    var opener        = null;

    // Photo counts on the cards come from the lists above, so they can't drift
    document.querySelectorAll('[data-project]').forEach(function (el) {
      var count = el.querySelector('.project-count');
      var imgs = projectImages[el.getAttribute('data-project')];
      if (count && imgs) count.textContent = imgs.length + ' fotos';
    });

    function preload(idx) {
      var n = currentImages.length;
      if (n > 1) new Image().src = currentImages[(idx + n) % n];
    }

    function showImage() {
      lbImg.src = currentImages[currentIdx];
      lbImg.alt = (projectNames[currentKey] || '') + ' — foto ' + (currentIdx + 1);
      lbCount.textContent = (currentIdx + 1) + ' / ' + currentImages.length;
      lbProject.textContent = projectNames[currentKey] || '';
      preload(currentIdx + 1);
      preload(currentIdx - 1);
    }

    function openLightbox(key, trigger) {
      currentKey    = key;
      currentImages = projectImages[key] || [];
      currentIdx    = 0;
      if (!currentImages.length) return;
      opener = trigger || document.activeElement;
      showImage();
      lb.classList.add('is-open');
      lb.inert = false;
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function closeLightbox() {
      lb.classList.remove('is-open');
      lb.inert = true;
      document.body.style.overflow = '';
      setTimeout(function () { lbImg.src = ''; }, 300);
      if (opener && opener.focus) opener.focus();
      opener = null;
    }

    function prevImage() { currentIdx = (currentIdx - 1 + currentImages.length) % currentImages.length; showImage(); }
    function nextImage() { currentIdx = (currentIdx + 1) % currentImages.length; showImage(); }

    document.querySelectorAll('[data-project]').forEach(function (el) {
      var trigger = el.querySelector('[role="button"]') || el;
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openLightbox(el.getAttribute('data-project'), trigger);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(el.getAttribute('data-project'), trigger); }
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
      if (e.key === 'Tab') {
        // keep focus inside the dialog
        var focusables = [lbClose, lbPrev, lbNext];
        var i = focusables.indexOf(document.activeElement);
        e.preventDefault();
        focusables[(i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length].focus();
      }
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
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      var err = field.querySelector('.field-error');
      if (err) err.remove();
    }

    function showFieldError(input, msg) {
      var field = input.closest('.field');
      if (!field) return;
      field.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      if (!field.querySelector('.field-error')) {
        var err = document.createElement('p');
        err.className = 'field-error';
        err.id = input.id + '-error';
        err.textContent = msg;
        field.appendChild(err);
        input.setAttribute('aria-describedby', err.id);
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
      if (!validateForm()) {
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
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
  /* ── Custom select ──
     Select-only combobox: focus stays on the trigger button (role="combobox");
     the highlighted option is exposed via aria-activedescendant. ── */
  document.querySelectorAll('.cs').forEach(function (cs, n) {
    var trigger = cs.querySelector('.cs-trigger');
    var val = cs.querySelector('.cs-val');
    var opts = Array.prototype.slice.call(cs.querySelectorAll('.cs-opt'));
    var hidden = cs.previousElementSibling; // the hidden input
    var placeholder = val.textContent;
    var focusIdx = -1;

    opts.forEach(function (o, i) {
      if (!o.id) o.id = 'cs' + n + '-opt' + i;
      o.setAttribute('aria-selected', 'false');
    });

    function isOpen() { return cs.classList.contains('is-open'); }
    function selectedIdx() {
      return opts.findIndex(function (o) { return o.classList.contains('is-selected'); });
    }
    function setFocus(idx) {
      opts.forEach(function (o) { o.classList.remove('is-focused'); });
      focusIdx = Math.max(0, Math.min(idx, opts.length - 1));
      opts[focusIdx].classList.add('is-focused');
      opts[focusIdx].scrollIntoView({ block: 'nearest' });
      trigger.setAttribute('aria-activedescendant', opts[focusIdx].id);
    }
    function open() {
      cs.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      var sel = selectedIdx();
      setFocus(sel >= 0 ? sel : 0);
    }
    function close() {
      cs.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      opts.forEach(function (o) { o.classList.remove('is-focused'); });
      focusIdx = -1;
    }
    function select(opt) {
      opts.forEach(function (o) {
        o.classList.remove('is-selected');
        o.setAttribute('aria-selected', 'false');
      });
      opt.classList.add('is-selected');
      opt.setAttribute('aria-selected', 'true');
      val.textContent = opt.textContent;
      val.classList.remove('is-placeholder');
      if (hidden) hidden.value = opt.dataset.value;
      close();
      trigger.focus();
    }

    trigger.addEventListener('click', function () { isOpen() ? close() : open(); });
    opts.forEach(function (opt, i) {
      opt.addEventListener('click', function () { select(opt); });
      opt.addEventListener('mouseenter', function () { setFocus(i); });
    });
    trigger.addEventListener('keydown', function (e) {
      if (!isOpen()) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); open();
        }
        return;
      }
      if (e.key === 'ArrowDown')      { e.preventDefault(); setFocus(focusIdx + 1); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setFocus(focusIdx - 1); }
      else if (e.key === 'Home')      { e.preventDefault(); setFocus(0); }
      else if (e.key === 'End')       { e.preventDefault(); setFocus(opts.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (focusIdx >= 0) select(opts[focusIdx]); }
      else if (e.key === 'Escape')    { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'Tab')       { close(); }
    });
    // Firefox activates buttons on Space keyup; the keydown above already handled it
    trigger.addEventListener('keyup', function (e) { if (e.key === ' ') e.preventDefault(); });
    document.addEventListener('click', function (e) {
      if (isOpen() && !cs.contains(e.target)) close();
    });
    var parentForm = cs.closest('form');
    if (parentForm) parentForm.addEventListener('reset', function () {
      opts.forEach(function (o) {
        o.classList.remove('is-selected');
        o.setAttribute('aria-selected', 'false');
      });
      val.textContent = placeholder;
      val.classList.add('is-placeholder');
      // reset() leaves hidden inputs alone (their value is their default)
      if (hidden) hidden.value = '';
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
