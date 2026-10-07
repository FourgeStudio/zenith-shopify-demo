/*
  Cart summary shipping line from Shopify Admin → Shipping (snippets/zenith-cart-summary.liquid).
  Liquid cannot read shipping rates, so the summary prints the theme flat-fee estimate with data-zcship-*
  hooks; this asks the Ajax API for the cheapest rate for the configured address and rewrites the
  Shipping and Total lines. Dawn re-renders the drawer / cart footer on every change, so a
  MutationObserver re-applies it. Results are cached per cart + address (memory + sessionStorage).
*/
(() => {
  if (window.zenithCartShipping) return;
  window.zenithCartShipping = true;

  const SEL = '.zenith-cart-sum[data-zcship]:not([data-zcship-done])';
  const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  const mem = {};
  const busy = {};

  const store = {
    get(k) {
      try {
        return JSON.parse(sessionStorage.getItem(k));
      } catch (e) {
        return null;
      }
    },
    set(k, v) {
      try {
        sessionStorage.setItem(k, JSON.stringify(v));
      } catch (e) {}
    },
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function cartToken() {
    const m = document.cookie.match(/(?:^|;\s*)cart=([^;]+)/);
    return m ? decodeURIComponent(m[1]).split('?')[0] : '';
  }

  // Shopify money format ("₱{{amount}}", "{{amount_no_decimals}}", …) applied to cents.
  function formatMoney(cents, format) {
    const fmt = format || '₱{{amount}}';
    const num = (n, dec, th, ds) => {
      const parts = (n / 100).toFixed(dec).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, th);
      return parts[1] ? parts[0] + ds + parts[1] : parts[0];
    };
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
      switch (key) {
        case 'amount_no_decimals':
          return num(cents, 0, ',', '.');
        case 'amount_with_comma_separator':
          return num(cents, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator':
          return num(cents, 0, '.', ',');
        case 'amount_with_apostrophe_separator':
          return num(cents, 2, "'", '.');
        case 'amount_with_space_separator':
          return num(cents, 2, ' ', ',');
        case 'amount_no_decimals_with_space_separator':
          return num(cents, 0, ' ', ',');
        default:
          return num(cents, 2, ',', '.');
      }
    });
  }

  function countries(value) {
    const list = [value];
    try {
      if (/^[A-Za-z]{2}$/.test(value)) {
        const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(value.toUpperCase());
        if (name && name !== value) list.push(name);
      }
    } catch (e) {}
    if (!list.includes('Philippines') && /^(ph|philippines)$/i.test(value)) list.push('Philippines');
    return list;
  }

  async function ratesFor(country, province, zip) {
    const p = new URLSearchParams();
    p.set('shipping_address[country]', country);
    if (province) p.set('shipping_address[province]', province);
    if (zip) p.set('shipping_address[zip]', zip);
    const q = p.toString();
    const opts = { headers: { Accept: 'application/json' }, credentials: 'same-origin' };

    const prep = await fetch(`${root}cart/prepare_shipping_rates.json?${q}`, { ...opts, method: 'POST' });
    if (prep.ok) {
      for (let i = 0; i < 20; i++) {
        const r = await fetch(`${root}cart/async_shipping_rates.json?${q}`, opts);
        if (r.status === 200) {
          const d = await r.json().catch(() => null);
          if (d && Array.isArray(d.shipping_rates)) return d.shipping_rates;
        } else if (r.status !== 202) {
          break;
        }
        await wait(500);
      }
    } else if (prep.status === 422) {
      throw new Error('address');
    }

    const r = await fetch(`${root}cart/shipping_rates.json?${q}`, opts);
    if (!r.ok) throw new Error('rates ' + r.status);
    const d = await r.json();
    return d.shipping_rates || [];
  }

  // { cents: <cheapest rate> } or { cents: null } when Shopify has no rate for this address.
  async function lookup(el) {
    const province = el.dataset.zcshipProvince || '';
    const zip = el.dataset.zcshipZip || '';
    for (const c of countries(el.dataset.zcship || 'PH')) {
      try {
        const rates = await ratesFor(c, province, zip);
        if (!rates.length) continue;
        const cents = Math.min(...rates.map((r) => Math.round(parseFloat(r.price) * 100)).filter((n) => !isNaN(n)));
        return { cents: isFinite(cents) ? cents : null };
      } catch (e) {}
    }
    return { cents: null };
  }

  function keyOf(el) {
    const d = el.dataset;
    return ['zcship', d.zcship, d.zcshipProvince, d.zcshipZip, cartToken(), d.zcshipKey].join('|');
  }

  function apply(el, res) {
    const val = el.querySelector('[data-zcship-value]');
    const tot = el.querySelector('[data-zcship-total]');
    const paid = parseInt(el.dataset.zcshipPaid, 10) || 0;
    const fmt = el.dataset.zcshipFormat;
    const cents = res.cents;
    if (val) {
      val.textContent =
        cents === null ? el.dataset.zcshipLater : cents === 0 ? el.dataset.zcshipFree : formatMoney(cents, fmt);
      val.classList.toggle('zenith-cart-sum__ok', cents === 0);
      val.classList.remove('zenith-cart-sum__est');
    }
    if (tot) {
      tot.textContent = formatMoney(paid + (cents || 0), fmt);
      tot.classList.remove('zenith-cart-sum__est');
    }
    el.dataset.zcshipDone = '';
  }

  function run() {
    document.querySelectorAll(SEL).forEach((el) => {
      const key = keyOf(el);
      const hit = mem[key] || store.get(key);
      if (hit) {
        mem[key] = hit;
        apply(el, hit);
        return;
      }
      if (busy[key]) return;
      busy[key] = lookup(el).then((res) => {
        mem[key] = res;
        if (res.cents !== null) store.set(key, res);
        delete busy[key];
        run();
      });
    });
  }

  const hasSummary = (n) =>
    n.nodeType === 1 && (n.matches('.zenith-cart-sum') || !!n.querySelector('.zenith-cart-sum'));

  function start() {
    run();
    new MutationObserver((list) => {
      for (const m of list) {
        for (const n of m.addedNodes) {
          if (hasSummary(n)) return run();
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener('shopify:section:load', run);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
