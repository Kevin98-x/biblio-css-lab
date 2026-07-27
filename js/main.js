/* ============================================================
   BIBLIO: external JavaScript (JS lab)
   Features:
     1. Welcome message (prompt for name, greet on Home)
     2. Form validation (required fields + error messages)
     3. Dynamic content (several interactive features)
     4. Runs clean on every page, no errors
   ============================================================ */
(function () {
  'use strict';

  /* small helpers */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const fmt = n => 'KSH ' + Number(n).toLocaleString('en-KE');
  const setText = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };

  document.addEventListener('DOMContentLoaded', function () {
    initWelcome();          // feature 1
    initValidation();       // feature 2
    initDynamicContent();   // feature 3
    // existing site behaviour
    initDate();
    initBorrowSummary();
    initChecklistMeter();
    initPaymentForm();
  });

  /* ==========================================================
     FEATURE 1: WELCOME MESSAGE
     Prompt the user for their name and greet them on the Home page.
     The name is remembered so we don't ask on every visit.
     ========================================================== */
  function initWelcome() {
    const banner = $('#welcome-banner');
    if (!banner) return;               // only runs on the Home page

    let name = null;
    try { name = localStorage.getItem('biblioName'); } catch (e) { name = null; }

    if (!name) {
      const entered = window.prompt('Welcome to Biblio! What should we call you?', '');
      if (entered && entered.trim()) {
        name = entered.trim();
        try { localStorage.setItem('biblioName', name); } catch (e) {}
      }
    }

    const greeting = name ? ('Welcome back, ' + name + ' 👋') : 'Welcome to Biblio 👋';
    banner.textContent = greeting;
    banner.classList.add('is-shown');

    // let the user change their name
    const changeBtn = $('#change-name');
    if (changeBtn) {
      changeBtn.addEventListener('click', function () {
        const entered = window.prompt('What should we call you?', name || '');
        if (entered && entered.trim()) {
          name = entered.trim();
          try { localStorage.setItem('biblioName', name); } catch (e) {}
          banner.textContent = 'Welcome back, ' + name + ' 👋';
        }
      });
    }
  }

  /* ==========================================================
     FEATURE 2: FORM VALIDATION
     Check every required field is filled before submitting.
     Show a clear error message if any required field is blank.
     ========================================================== */
  function initValidation() {
    const forms = $$('form');
    if (!forms.length) return;

    forms.forEach(function (form) {
      // where the summary message goes (e.g. #borrow-result)
      const out = form.querySelector('.form-result');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors(form);

        const required = $$('[required]', form);
        let firstBad = null;

        required.forEach(function (field) {
          const empty =
            (field.type === 'checkbox' && !field.checked) ||
            (field.value === null || String(field.value).trim() === '');

          // basic email shape check
          const badEmail =
            field.type === 'email' &&
            field.value.trim() !== '' &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());

          if (empty || badEmail) {
            markError(field, badEmail ? 'Please enter a valid email address.' : 'This field is required.');
            if (!firstBad) firstBad = field;
          }
        });

        if (firstBad) {
          if (out) {
            out.textContent = '⚠ Please complete the highlighted fields before submitting.';
            out.classList.add('is-error');
          }
          firstBad.focus();
          return;
        }

        // success
        if (out) {
          out.classList.remove('is-error');
          out.textContent = '✓ ' + successMessage(form.id);
        }
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.textContent = 'Done ✓';
      });

      // clear a field's error as soon as the user fixes it
      $$('[required]', form).forEach(function (field) {
        field.addEventListener('input', function () { unmarkError(field); });
        field.addEventListener('change', function () { unmarkError(field); });
      });
    });
  }

  function successMessage(id) {
    const map = {
      'borrow-form':  'Book recorded. Bring it back in matching condition for a full refund.',
      'sell-form':    'Thanks! We\'ll review and message you a quote shortly.',
      'payment-form': 'Deposit held safely. A receipt is on its way to your email.',
      'contact-form': 'Message sent. We\'ll write back within a day.'
    };
    return map[id] || 'Submitted successfully.';
  }

  function markError(field, msg) {
    field.classList.add('field-invalid');
    const holder = field.closest('.field') || field.parentElement;
    if (!holder) return;
    let note = holder.querySelector('.field-error');
    if (!note) {
      note = document.createElement('span');
      note.className = 'field-error';
      holder.appendChild(note);
    }
    note.textContent = msg;
  }

  function unmarkError(field) {
    field.classList.remove('field-invalid');
    const holder = field.closest('.field') || field.parentElement;
    if (!holder) return;
    const note = holder.querySelector('.field-error');
    if (note) note.remove();
  }

  function clearErrors(form) {
    $$('.field-invalid', form).forEach(f => f.classList.remove('field-invalid'));
    $$('.field-error', form).forEach(n => n.remove());
    const out = form.querySelector('.form-result');
    if (out) { out.classList.remove('is-error'); out.textContent = ''; }
  }

  /* ==========================================================
     FEATURE 3: DYNAMIC CONTENT (several interactive features)
     a) Show / hide the deposit explainer (toggle content)
     b) "Surprise me" button picks a random book (change text)
     c) Theme switch button (change colours of the page)
     d) Gallery cards flip on click as well as hover (change card)
     ========================================================== */
  function initDynamicContent() {
    // (a) show / hide any element that has a toggle button
    $$('[data-toggle]').forEach(function (btn) {
      const target = document.getElementById(btn.getAttribute('data-toggle'));
      if (!target) return;
      btn.addEventListener('click', function () {
        const hidden = target.hasAttribute('hidden');
        if (hidden) { target.removeAttribute('hidden'); btn.textContent = btn.dataset.less || 'Hide details'; }
        else { target.setAttribute('hidden', ''); btn.textContent = btn.dataset.more || 'Show details'; }
      });
    });

    // (b) surprise book picker: changes text of an element
    const pickBtn = $('#surprise-btn');
    const pickOut = $('#surprise-out');
    if (pickBtn && pickOut) {
      const books = [
        'Things Fall Apart, by Chinua Achebe',
        'The Overstory, by Richard Powers',
        'A Grain of Wheat, by Ngũgĩ wa Thiong\'o',
        'Sapiens, by Yuval Noah Harari',
        'The Salt Path, by Raynor Winn',
        'Wind, Sand and Stars, by Antoine de Saint-Exupéry'
      ];
      pickBtn.addEventListener('click', function () {
        const choice = books[Math.floor(Math.random() * books.length)];
        pickOut.textContent = '📖 Try: ' + choice;
      });
    }

    // (c) theme switch: changes the colour theme of the site
    const themeBtn = $('#theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        document.body.classList.toggle('theme-dusk');
        const dusk = document.body.classList.contains('theme-dusk');
        themeBtn.textContent = dusk ? '☀ Day shelf' : '🌙 Evening shelf';
      });
    }

    // (d) gallery cards also flip on click / keyboard (touch-friendly)
    $$('.flip-card').forEach(function (card) {
      const flip = function () { card.classList.toggle('is-flipped'); };
      card.addEventListener('click', flip);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });
    });
  }

  /* ==========================================================
     EXISTING SITE BEHAVIOUR (unchanged from CSS lab)
     ========================================================== */
  function initDate() {
    const d = $('#b-date');
    if (d && !d.value) d.value = new Date().toISOString().slice(0, 10);
  }

  function initBorrowSummary() {
    const sel = $('#b-title');
    if (!sel) return;
    const update = function () {
      const opt = sel.options[sel.selectedIndex];
      const price = Number(opt && opt.dataset ? opt.dataset.price || 0 : 0);
      const title = opt && opt.value ? opt.textContent.split(' · ')[0] : 'Not selected';
      setText('#sum-title', title);
      setText('#sum-deposit', fmt(price));
      setText('#sum-refund', fmt(price));
    };
    sel.addEventListener('change', update);
    update();
  }

  function initChecklistMeter() {
    const boxes = $$('.checklist input[type="checkbox"]');
    const meter = $('#match-meter');
    if (!boxes.length || !meter) return;
    const count = $('#meter-count');
    const sync = function () {
      const checked = boxes.filter(b => b.checked).length;
      meter.value = checked;
      meter.textContent = checked + ' of ' + boxes.length;
      if (count) count.textContent = checked;
    };
    boxes.forEach(b => b.addEventListener('change', sync));
    sync();
  }

  function initPaymentForm() {
    const ref = $('#p-book');
    const amount = $('#p-amount');
    if (ref && amount) {
      const setAmt = function () {
        const opt = ref.options[ref.selectedIndex];
        const a = opt && opt.dataset ? opt.dataset.amount : null;
        if (a) amount.value = a;
      };
      ref.addEventListener('change', setAmt);
    }

    const methods = $$('input[name="method"]');
    const cardWrap = $('#card-fields');
    if (methods.length && cardWrap) {
      const toggle = function () {
        const checked = methods.find(r => r.checked);
        const m = checked ? checked.value : '';
        const card = cardWrap.querySelectorAll('#p-card, #p-expiry, #p-cvv');
        const phone = cardWrap.querySelector('#p-phone');
        card.forEach(function (el) {
          const holder = el.closest('.field');
          if (holder) holder.style.display = (m === 'card') ? '' : 'none';
        });
        if (phone) {
          const holder = phone.closest('.field');
          if (holder) holder.style.display = (m === 'mpesa') ? '' : 'none';
        }
      };
      methods.forEach(r => r.addEventListener('change', toggle));
      toggle();
    }
  }

})();
