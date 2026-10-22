/* Mariachi Nueva Era — interacción del sitio.
   Sin dependencias. Todo degrada a HTML funcional si el JS falla. */
(function () {
  'use strict';

  var WA = '573214014431';

  /* De dónde viene el visitante */
  var viaNE = (function () {
    var W = window, D = document, VIDA = 30 * 864e5, CLAVE = 'neVia';
    var prefijos = {
      instagram: '📸 Vengo de Instagram — ',
      facebook: '👍 Vengo de Facebook — ',
      tiktok: '🎵 Vengo de TikTok — '
    };
    var mensajeBase = 'Hola, quiero información de una serenata.';
    var conPrefijo = /Vengo de (Instagram|Facebook|TikTok) — /;
    var esDestinoWa = /^(?:(?:https?:)?\/\/(?:wa\.me|(?:www\.|api\.|web\.)?whatsapp\.com)(?:[\/?#]|$)|whatsapp:\/\/)/i;

    function queryVal(n) {
      var s = W.location.search;
      try { return new URLSearchParams(s).get(n); } catch (e) {
        var m = new RegExp('[?&]' + n + '(?:=([^&]*))?(?:&|$)').exec(s);
        return m ? (m[1] || '') : null;
      }
    }
    function refDom() {
      var m = /^https?:\/\/([^\/?#:]+)/i.exec(D.referrer || '');
      return m ? m[1].toLowerCase() : '';
    }
    function detectaVia() {
      var us = (queryVal('utm_source') || '').toLowerCase(), h = refDom(), ua = navigator.userAgent || '';
      if (us === 'instagram' || us === 'ig' || queryVal('ig') !== null) return 'instagram';
      if (us === 'facebook' || us === 'fb') return 'facebook';
      if (us === 'tiktok') return 'tiktok';
      if (/(^|\.)instagram\.com$/.test(h) || /Instagram/.test(ua)) return 'instagram';
      if (queryVal('fbclid') !== null || /(^|\.)facebook\.com$/.test(h) || /FBAN|FBAV/.test(ua)) return 'facebook';
      if (/(^|\.)tiktok\.com$/.test(h) || /musical_ly|BytedanceWebview|TikTok/.test(ua)) return 'tiktok';
      return null;
    }
    function viaGuardada() {
      var r;
      try { r = JSON.parse(localStorage.getItem(CLAVE)); if (r && prefijos[r.o] && Date.now() - r.t < VIDA) return r.o; } catch (e) {}
      try { r = JSON.parse(sessionStorage.getItem(CLAVE)); if (r && prefijos[r.o]) return r.o; } catch (e) {}
      return null;
    }
    function guardaVia(o) {
      var s = JSON.stringify({ o: o, t: Date.now() });
      try { localStorage.setItem(CLAVE, s); } catch (e) {}
      try { sessionStorage.setItem(CLAVE, s); } catch (e) {}
    }

    var nuevo = detectaVia(), via = nuevo || viaGuardada();
    if (nuevo) guardaVia(nuevo);
    if (!via) return function () { return null; };

    function prefija(u) {
      if (typeof u !== 'string' || !esDestinoWa.test(u)) return u;
      var orig = u, m = prefijos[via], hash = '', i = u.indexOf('#');
      if (i > -1) { hash = u.slice(i); u = u.slice(0, i); }
      var q = u.indexOf('?'), base = q < 0 ? u : u.slice(0, q);
      var ps = q < 0 ? [] : u.slice(q + 1).split('&').filter(Boolean), hecho = false;
      for (var j = 0; j < ps.length && !hecho; j++) {
        if (!/^text=/i.test(ps[j])) continue;
        var v = ps[j].slice(5), d = v;
        try { d = decodeURIComponent(v.replace(/\+/g, ' ')); } catch (e) {}
        hecho = true;
        if (conPrefijo.test(d)) return orig;
        ps[j] = /^\s*$/.test(d) ? 'text=' + encodeURIComponent(m + mensajeBase) : 'text=' + encodeURIComponent(m) + v;
      }
      if (!hecho) ps.push('text=' + encodeURIComponent(m + mensajeBase));
      return base + '?' + ps.join('&') + hash;
    }
    function prefijaEl(el) {
      if (!el || !el.getAttribute) return;
      var h = el.getAttribute('href');
      if (h) { var n = prefija(h); if (n !== h) el.setAttribute('href', n); }
      var c = el.getAttribute('onclick');
      if (c && /wa\.me|whatsapp/i.test(c)) {
        var n2 = c.replace(/https?:\/\/(?:wa\.me\/\d+|(?:api|web|www)\.whatsapp\.com\/send)[^'"\s)]*(?=['"])/gi, prefija);
        if (n2 !== c) el.setAttribute('onclick', n2);
      }
    }
    function prefijaTodos() {
      var l = D.querySelectorAll('a[href*="wa.me"],a[href*="whatsapp"],[onclick*="wa.me"],[onclick*="whatsapp"]');
      for (var i = 0; i < l.length; i++) prefijaEl(l[i]);
    }

    prefijaTodos();
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', prefijaTodos);
    // enlaces que aparecen después de cargar
    if (W.MutationObserver) {
      var t = 0;
      new MutationObserver(function () {
        if (t) return;
        t = setTimeout(function () { t = 0; prefijaTodos(); }, 60);
      }).observe(D.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'onclick'] });
    }
    // por captura: lo que se haya tocado a mano justo antes del clic también lleva la marca
    D.addEventListener('click', function (e) {
      for (var el = e.target; el && el !== D; el = el.parentNode) prefijaEl(el);
    }, true);
    // aperturas programáticas (formularios)
    var abrir = W.open;
    W.open = function (u) {
      var a = Array.prototype.slice.call(arguments);
      a[0] = prefija(u);
      return abrir.apply(W, a);
    };

    // medición
    function registraVia() {
      try {
        if (typeof W.clarity === 'function') {
          W.clarity('set', 'origen', via);
          if (nuevo && !sessionStorage.getItem(CLAVE + 'c')) { sessionStorage.setItem(CLAVE + 'c', '1'); W.clarity('event', 'llegada_' + via); }
        }
      } catch (e) {}
      try {
        if (typeof W.gtag === 'function') {
          W.gtag('set', { origen_visita: via });
          if (nuevo && !sessionStorage.getItem(CLAVE + 'g')) { sessionStorage.setItem(CLAVE + 'g', '1'); W.gtag('event', 'llegada_origen', { origen: via }); }
        }
      } catch (e) {}
    }
    registraVia();
    W.addEventListener('load', function () { registraVia(); setTimeout(registraVia, 4000); });
    return function () { return via; };
  })();

  /* --- Menú móvil --- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('ne-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('ne-open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* --- Animación de entrada ---
     El estado oculto lo pone el JS, no el CSS: si este script no corre, el contenido
     simplemente se ve sin animación en lugar de quedar invisible. */
  var animables = document.querySelectorAll('.ne-reveal');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 4-sep-2026: donde el navegador sabe animar con el scroll (animation-timeline: view())
     el efecto lo lleva el CSS y este observador sobra. Cada entrada del observador costaba
     trabajo en el hilo principal justo mientras el dedo arrastra, que es cuando se nota. */
  var scrollNativo = window.CSS && CSS.supports && CSS.supports('animation-timeline', 'view()');

  if ('IntersectionObserver' in window && !reduce && !scrollNativo) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove('ne-pre');
          en.target.classList.add('ne-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -40px' });

    animables.forEach(function (el) {
      // Lo que ya está en pantalla no se oculta: evita el parpadeo del primer bloque.
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.9) { el.classList.add('ne-in'); return; }
      el.classList.add('ne-pre');
      io.observe(el);
    });

    // Red de seguridad: pase lo que pase con el observer, a los 3 s todo es visible.
    // Una animación no vale el riesgo de que un cliente no vea los precios.
    setTimeout(function () {
      animables.forEach(function (el) { el.classList.remove('ne-pre'); el.classList.add('ne-in'); });
    }, 3000);
  }

  /* --- La tarjeta que se tiene enfrente se adelanta ---
     En escritorio esto lo resuelve :hover. En el móvil no hay ratón, así que la
     tarjeta que queda en la franja central de la pantalla se marca con .ne-ahead y
     el CSS la eleva. Solo una a la vez: si se encienden todas, no destaca ninguna. */
  var tarjetas = [].slice.call(document.querySelectorAll('.ne-price-card'));
  if (tarjetas.length && 'IntersectionObserver' in window && !reduce) {
    // Se decide por ancho, no por `hover`: la emulación de móvil de algunos
    // navegadores informa `hover: hover` aunque no haya ratón. Por debajo de 900 px
    // las tarjetas van apiladas y tiene sentido destacar la que se está mirando.
    if (matchMedia('(max-width: 900px)').matches) {
      var focoIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          en.target.classList.toggle('ne-ahead', en.isIntersecting);
        });
      }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
      tarjetas.forEach(function (c) { focoIO.observe(c); });
    }
  }

  /* --- Sombra del encabezado al bajar --- */
  var hdr = document.querySelector('.ne-hdr');
  if (hdr) {
    var marcarScroll = function () { hdr.classList.toggle('ne-scrolled', scrollY > 12); };
    marcarScroll();
    addEventListener('scroll', marcarScroll, { passive: true });
  }

  /* --- Fecha mínima = hoy (zona horaria de Bogotá) --- */
  var dateInput = document.getElementById('q-date');
  if (dateInput) {
    var bogota = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    dateInput.min = bogota;
    if (!dateInput.value) dateInput.value = bogota;
  }

  /* --- Validación + envío a WhatsApp --- */
  var form = document.getElementById('quote-form');
  if (form) {
    var phoneField = document.getElementById('q-phone');

    // Formato visual del celular colombiano (3 3 4)
    if (phoneField) {
      phoneField.addEventListener('input', function () {
        var d = this.value.replace(/\D/g, '').slice(0, 10);
        this.value = d.replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, function (_, a, b, c) {
          return a + (b ? ' ' + b : '') + (c ? ' ' + c : '');
        });
      });
    }

    var isValid = function (el) {
      var v = el.value.trim();
      if (!v) return false;
      if (el.id === 'q-phone') return /^3\d{9}$/.test(v.replace(/\D/g, ''));
      return true;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;

      form.querySelectorAll('[required]').forEach(function (el) {
        var field = el.closest('.ne-field');
        if (isValid(el)) { field.classList.remove('ne-invalid'); }
        else { field.classList.add('ne-invalid'); ok = false; }
      });

      if (!ok) {
        var first = form.querySelector('.ne-field.ne-invalid input, .ne-field.ne-invalid select');
        if (first) first.focus();
        return;
      }

      // El campo de localidad se retiró del formulario: la cobertura es toda Bogotá
      // y Soacha, así que g() tolera que el elemento no exista.
      var g = function (id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };
      var fecha = g('q-date');
      var fechaTxt = fecha;
      try {
        var p = fecha.split('-');
        fechaTxt = new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('es-CO', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
      } catch (_) { /* se queda el ISO */ }

      var msg =
        '¡Hola Mariachi Nueva Era! Quiero cotizar una serenata.\n\n' +
        '• Nombre: ' + g('q-name') + '\n' +
        '• Celular: ' + g('q-phone') + '\n' +
        '• Fecha: ' + fechaTxt + '\n' +
        '• Hora: ' + g('q-time') + (g('q-zone') ? '\n• Localidad: ' + g('q-zone') : '');

      // Adjunta el gclid para poder atribuir la conversión a la campaña.
      var gclid = sessionStorage.getItem('mem_gclid');
      if (gclid) msg += '\n\nRef: ' + gclid;

      track('generate_lead', { method: 'formulario', zona: g('q-zone') });

      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      form.reset();
      if (dateInput) dateInput.value = dateInput.min;
    });
  }

  /* --- Visor de la galería --- */
  var botones = [].slice.call(document.querySelectorAll('.ne-gal-btn'));
  if (botones.length) {
    var visor = document.createElement('div');
    visor.className = 'ne-viewer';
    visor.setAttribute('role', 'dialog');
    visor.setAttribute('aria-modal', 'true');
    visor.setAttribute('aria-label', 'Visor de fotos');
    visor.innerHTML =
      '<button class="ne-viewer-close" type="button" aria-label="Cerrar">✕</button>' +
      '<button class="ne-viewer-nav ne-prev" type="button" aria-label="Foto anterior">‹</button>' +
      '<button class="ne-viewer-nav ne-next" type="button" aria-label="Foto siguiente">›</button>' +
      '<figure style="margin:0;display:grid;place-items:center">' +
      '<img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(visor);

    var vImg = visor.querySelector('img');
    var vCap = visor.querySelector('figcaption');
    var idx = 0, previo = null;

    // El visor cargaba el JPG a tamaño completo en cada cambio de foto y sin avisar:
    // entre una y otra quedaba un hueco de segundos. Ahora (1) pide el WebP, que pesa
    // un cuarto menos, (2) enseña al instante la miniatura que la galería ya tiene en
    // caché mientras llega la grande, y (3) va precargando las vecinas.
    var soportaWebp = (function () {
      try { return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0; }
      catch (_) { return false; }
    })();

    function fuente(b) {
      var f = b.getAttribute('data-full');
      return soportaWebp ? f.replace(/\.jpg$/i, '.webp') : f;
    }
    function miniatura(b) {
      var im = b.querySelector('img');
      return im ? (im.currentSrc || im.src) : '';
    }
    function precargar(i) {
      var b = botones[(i + botones.length) % botones.length];
      if (!b || b.dataset.pre) return;
      b.dataset.pre = '1';
      var im = new Image();
      im.src = fuente(b);
    }

    function mostrar(i) {
      idx = (i + botones.length) % botones.length;
      var b = botones[idx];
      var destino = fuente(b);

      vImg.alt = b.getAttribute('data-alt');
      vCap.textContent = b.getAttribute('data-alt');

      var grande = new Image();
      var puesta = false;
      var pintar = function () {
        if (puesta) return;
        puesta = true;
        vImg.src = grande.src;
        visor.classList.remove('ne-cargando');
      };

      grande.onload = pintar;
      grande.onerror = function () {           // si el WebP fallara, el JPG de siempre
        visor.classList.remove('ne-cargando');
        vImg.src = b.getAttribute('data-full');
      };
      grande.src = destino;

      if (grande.complete) {                   // ya estaba en caché: sin parpadeo
        pintar();
      } else {
        var mini = miniatura(b);               // relleno inmediato, ya descargado
        if (mini) { vImg.src = mini; visor.classList.add('ne-cargando'); }
      }

      precargar(idx + 1);
      precargar(idx - 1);
    }
    // Abrir una foto mete una entrada en el historial. Así el botón «atrás» del
    // teléfono cierra la foto y devuelve a la página, en vez de sacar al visitante
    // del sitio, que era lo que pasaba antes.
    var enHistorial = false;

    function abrir(i) {
      previo = document.activeElement;
      mostrar(i);
      visor.classList.add('ne-open');
      document.body.style.overflow = 'hidden';
      visor.querySelector('.ne-viewer-close').focus();
      if (!enHistorial) {
        try { history.pushState({ memVisor: 1 }, ''); enHistorial = true; } catch (_) { /* sin historial, se cierra igual con la ✕ */ }
      }
    }

    // `retroceder` es false cuando quien cierra ES el botón atrás: ahí el navegador
    // ya consumió la entrada y llamar a history.back() nos sacaría de la página.
    function cerrar(retroceder) {
      visor.classList.remove('ne-open');
      document.body.style.overflow = '';
      if (previo) previo.focus();
      if (enHistorial && retroceder !== false) {
        enHistorial = false;
        try { history.back(); } catch (_) {}
      } else {
        enHistorial = false;
      }
    }

    addEventListener('popstate', function () {
      if (visor.classList.contains('ne-open')) cerrar(false);
    });

    botones.forEach(function (b, i) { b.addEventListener('click', function () { abrir(i); }); });
    visor.querySelector('.ne-viewer-close').addEventListener('click', function () { cerrar(); });
    visor.querySelector('.ne-prev').addEventListener('click', function () { mostrar(idx - 1); });
    visor.querySelector('.ne-next').addEventListener('click', function () { mostrar(idx + 1); });
    visor.addEventListener('click', function (e) { if (e.target === visor) cerrar(); });

    document.addEventListener('keydown', function (e) {
      if (!visor.classList.contains('ne-open')) return;
      if (e.key === 'Escape') cerrar();
      else if (e.key === 'ArrowLeft') mostrar(idx - 1);
      else if (e.key === 'ArrowRight') mostrar(idx + 1);
    });

    // Deslizar en móvil
    var x0 = null;
    visor.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) mostrar(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }

  /* --- Seguimiento de conversiones --- */
  // Etiquetas de conversión de Google Ads (cuenta 504-187-1223). Cada contacto real
  // —WhatsApp, llamada o formulario— se reporta a Ads para que la puja aprenda de
  // clientes, no de clics. Sin esto, Ads solo sabe cuánta gente entró.
  var CONV = {
    whatsapp_click: 'AW-18373505088/W6IbCMHR1d4cEMDglblE',
    generate_lead:  'AW-18373505088/W6IbCMHR1d4cEMDglblE',
    llamada_click:  'AW-18373505088/QNFCCMTR1d4cEMDglblE'
  };

  function track(event, params) {
    params = params || {};
    var og = viaNE(); if (og) params.origen = og;
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, params || {});
      if (CONV[event]) window.gtag('event', 'conversion', { send_to: CONV[event] });
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, params || {}));
    // Clarity: cada contacto queda como evento con nombre, y la página desde la que
    // salió queda como etiqueta. Así se sabe QUÉ página genera cotizaciones, no solo
    // cuántas visitas hubo.
    if (typeof window.clarity === 'function') {
      try {
        window.clarity('event', event);
        window.clarity('set', 'cta', (params && params.cta_id) || event);
        window.clarity('set', 'pagina', location.pathname);
        if (event === 'whatsapp_click' || event === 'llamada_click' || event === 'generate_lead') {
          window.clarity('set', 'contacto', location.pathname);
          window.clarity('upgrade', 'contacto');   // conserva la grabación de quien contacta
        }
      } catch (e) { /* la analítica nunca debe romper la página */ }
    }
  }
  window.memTrack = track;

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cta]');
    if (!a) return;
    var id = a.getAttribute('data-cta');
    var isCall = a.href && a.href.indexOf('tel:') === 0;
    var isWa = a.href && a.href.indexOf('wa.me') > -1;
    track(isCall ? 'llamada_click' : isWa ? 'whatsapp_click' : 'cta_click', { cta_id: id });
  });
})();
