/* ==========================================================================
   PRIVATE MAIL — Maquette BrandUp
   Interactions : navigation, FAQ, apparitions, consentement, configurateur devis
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     Navigation
     ---------------------------------------------------------------------- */
  var header = document.querySelector('.header');
  var burger = document.querySelector('.burger');
  var mobileNav = document.querySelector('.mobile-nav');

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-locked', open);
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-locked');
      });
    });
  }

  // Sous-menu Services accessible au clavier / tactile
  document.querySelectorAll('.nav__group').forEach(function (group) {
    var toggle = group.querySelector('.nav__toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      var open = group.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!group.contains(e.target)) {
        group.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.nav__group.is-open').forEach(function (g) {
      g.classList.remove('is-open');
      g.querySelector('.nav__toggle').setAttribute('aria-expanded', 'false');
    });
    if (mobileNav && mobileNav.classList.contains('is-open')) burger.click();
  });

  /* ----------------------------------------------------------------------
     FAQ
     ---------------------------------------------------------------------- */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ----------------------------------------------------------------------
     Apparitions au scroll
     ---------------------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    // Les blocs déjà franchis (arrivée sur une ancre, rechargement en milieu de
    // page) ne seront jamais observés : on les affiche tout de suite.
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-in');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ----------------------------------------------------------------------
     Consentement cookies — GA4 n'est chargé qu'après acceptation (RGPD)
     ---------------------------------------------------------------------- */
  var GA_ID = 'G-XXXXXXXXXX'; // ← remplacer par l'identifiant GA4 du client
  var STORAGE_KEY = 'pm-consent';
  var banner = document.querySelector('.cookie');

  function loadAnalytics() {
    if (window.__gaLoaded || GA_ID.indexOf('XXXX') > -1) return;
    window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  if (stored === 'granted') {
    loadAnalytics();
  } else if (!stored && banner) {
    setTimeout(function () { banner.classList.add('is-visible'); }, 1200);
  }

  if (banner) {
    banner.addEventListener('click', function (e) {
      var action = e.target.closest('[data-consent]');
      if (!action) return;
      var choice = action.getAttribute('data-consent');
      try { localStorage.setItem(STORAGE_KEY, choice); } catch (err) {}
      if (choice === 'granted') loadAnalytics();
      banner.classList.remove('is-visible');
    });
  }

  function trackEvent(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  /* ----------------------------------------------------------------------
     Configurateur de devis (3 étapes)
     ---------------------------------------------------------------------- */
  var quote = document.querySelector('[data-quote]');
  if (!quote) return;

  var panels = quote.querySelectorAll('.qpanel');
  var stepItems = quote.querySelectorAll('.stepper__item');
  var btnPrev = quote.querySelector('[data-quote-prev]');
  var btnNext = quote.querySelector('[data-quote-next]');
  var done = quote.querySelector('.qdone');
  var form = quote.querySelector('form');
  var recapList = quote.querySelector('.recap__list');
  var recapEmpty = quote.querySelector('.recap__empty');
  var current = 0;

  var LABELS = {
    domiciliation: 'Domiciliation',
    administratif: 'Aide administrative',
    bureau: 'Location de bureau'
  };

  function selectedServices() {
    return Array.prototype.map.call(
      quote.querySelectorAll('input[name="service"]:checked'),
      function (i) { return LABELS[i.value] || i.value; }
    );
  }

  function updateRecap() {
    if (!recapList) return;
    var rows = [];
    var services = selectedServices();
    if (services.length) rows.push(['Prestations', services.join(', ')]);

    quote.querySelectorAll('[data-recap]').forEach(function (el) {
      var label = el.getAttribute('data-recap');
      var value = '';
      if (el.type === 'radio') {
        var checked = quote.querySelector('input[name="' + el.name + '"]:checked');
        if (!checked) return;
        var lab = quote.querySelector('label[for="' + checked.id + '"] strong');
        value = lab ? lab.textContent.trim() : checked.value;
        if (rows.some(function (r) { return r[0] === label; })) return;
      } else {
        value = (el.value || '').trim();
      }
      if (value) rows.push([label, value]);
    });

    recapList.innerHTML = rows.map(function (r) {
      return '<li><span>' + r[0] + '</span><span>' + escapeHtml(r[1]) + '</span></li>';
    }).join('');
    if (recapEmpty) recapEmpty.style.display = rows.length ? 'none' : 'block';
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function showStep(index) {
    current = index;
    panels.forEach(function (p, i) { p.classList.toggle('is-active', i === index); });
    stepItems.forEach(function (s, i) {
      s.classList.toggle('is-active', i === index);
      s.classList.toggle('is-done', i < index);
    });
    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNext) {
      btnNext.textContent = index === panels.length - 1 ? 'Envoyer ma demande' : 'Continuer';
      btnNext.setAttribute('type', index === panels.length - 1 ? 'submit' : 'button');
    }
    var top = quote.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function validateStep(index) {
    var panel = panels[index];
    if (index === 0 && !quote.querySelector('input[name="service"]:checked')) {
      alert('Sélectionnez au moins une prestation pour continuer.');
      return false;
    }
    var invalid = null;
    panel.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (f) {
      if (!invalid && !f.checkValidity()) invalid = f;
    });
    if (invalid) { invalid.reportValidity(); return false; }
    return true;
  }

  if (btnNext) {
    btnNext.addEventListener('click', function (e) {
      if (current === panels.length - 1) return; // laisse le submit gérer
      e.preventDefault();
      if (validateStep(current)) showStep(current + 1);
    });
  }
  if (btnPrev) {
    btnPrev.addEventListener('click', function (e) {
      e.preventDefault();
      if (current > 0) showStep(current - 1);
    });
  }

  quote.addEventListener('change', updateRecap);
  quote.addEventListener('input', updateRecap);

  // Pré-sélection depuis une page service : devis.html?service=domiciliation
  var preset = new URLSearchParams(window.location.search).get('service');
  if (preset) {
    var box = quote.querySelector('input[name="service"][value="' + preset + '"]');
    if (box) box.checked = true;
  }
  updateRecap();

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep(current)) return;
      trackEvent('generate_lead', {
        form_name: 'devis',
        services: selectedServices().join(',')
      });
      panels.forEach(function (p) { p.classList.remove('is-active'); });
      var nav = quote.querySelector('.qnav');
      var stepper = quote.querySelector('.stepper');
      if (nav) nav.style.display = 'none';
      if (stepper) stepper.style.display = 'none';
      if (done) done.classList.add('is-active');
      window.scrollTo({ top: quote.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
    });
  }
})();
