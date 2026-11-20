/* Miau & Bit — projeto idealizado por Maisa Araujo.
 * Estimativa pública de visitas; nunca envia o progresso das aventuras.
 */
(() => {
  'use strict';
  const button = document.getElementById('visitor-counter');
  const number = document.getElementById('visitor-counter-value');
  const note = document.getElementById('visitor-counter-note');
  if (!button || !number || !note) return;

  const host = location.hostname.toLowerCase();
  const published = location.protocol === 'https:' &&
    (host === 'miauebit.com.br' || host === 'www.miauebit.com.br' ||
      (host === 'maisareis.github.io' && /^\/miau-bit(?:\/|$)/.test(location.pathname)));
  // Local previews and downloaded copies must never inflate the public total.
  if (!published) return;

  const endpoint = 'https://countapi.mileshilliard.com/api/v1/';
  const counterKey = 'miauebit_com_br_quintal_visitas_20261120_5b831fa2';
  const storageKey = 'miau-bit-visit-at-v1';
  const visitWindow = 30 * 60 * 1000;
  let inFlight = false;
  let finished = false;

  function visitStorage() {
    // No visitor ID, cookie, fingerprint, game response or child data is created.
    for (const name of ['localStorage', 'sessionStorage']) {
      try {
        const storage = window[name];
        storage.getItem(storageKey);
        return storage;
      } catch (_) { /* Counting still works when browser storage is blocked. */ }
    }
    return null;
  }

  async function update() {
    if (inFlight || finished || navigator.onLine === false) return;
    inFlight = true;
    const storage = visitStorage();
    const now = Date.now();
    let previous = 0;
    try { previous = Number(storage && storage.getItem(storageKey)); } catch (_) {}
    const recent = previous > 0 && previous <= now && now - previous < visitWindow;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(endpoint + (recent ? 'get/' : 'hit/') + counterKey, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Counter unavailable');
      const data = await response.json();
      const raw = data && data.value;
      if ((typeof raw !== 'string' && typeof raw !== 'number') || !/^\d+$/.test(String(raw))) {
        throw new Error('Invalid counter value');
      }
      const value = Number(raw);
      if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid counter value');
      if (!recent && storage) {
        try { storage.setItem(storageKey, String(now)); } catch (_) {}
      }
      const formatted = new Intl.NumberFormat('pt-BR').format(value);
      number.textContent = formatted;
      button.title = formatted + (value === 1 ? ' passadinha pelo quintal' : ' passadinhas pelo quintal');
      button.setAttribute('aria-label', 'Visitas aproximadas registradas: ' + formatted + '. Mostrar detalhes.');
      note.textContent = formatted + (value === 1 ? ' visita aproximada' : ' visitas aproximadas') + ' desde a publicação desta versão. Não é um total de pessoas únicas ou de visitantes online.';
      button.hidden = false;
      finished = true;
    } catch (_) {
      // Never invent a number or interrupt a game if the counter is unavailable.
      button.hidden = true;
      note.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    } finally {
      clearTimeout(timeout);
      inFlight = false;
    }
  }

  button.addEventListener('click', () => {
    note.hidden = !note.hidden;
    button.setAttribute('aria-expanded', String(!note.hidden));
  });
  window.addEventListener('online', update);
  update();
})();
