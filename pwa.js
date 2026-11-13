(() => {
  'use strict';
  const installButton = document.getElementById('pwa-install');
  const status = document.getElementById('pwa-status');
  const help = document.getElementById('pwa-help');
  const updateButton = document.getElementById('pwa-update');
  const updateMessage = document.getElementById('pwa-update-message');
  const standaloneQuery = window.matchMedia('(display-mode: standalone)');
  const isStandalone = () => standaloneQuery.matches || window.navigator.standalone === true;
  const isAppleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  let installPrompt = null;
  let registration = null;
  let registering = false;
  let offlineReady = false;
  let refreshRequested = false;
  let reloading = false;

  function updateInstalledState() {
    installButton.hidden = isStandalone();
    if (isStandalone()) help.hidden = true;
  }
  function updateStatus() {
    if (offlineReady) {
      status.textContent = navigator.onLine
        ? 'Os jogos e suas fases estão guardados neste aparelho para brincar sem internet.'
        : 'Estamos sem internet. Os jogos e suas fases continuam disponíveis!';
    } else {
      status.textContent = navigator.onLine
        ? 'Preparando os jogos para brincar sem internet…'
        : 'Conecte este aparelho à internet uma vez para guardar as aventuras.';
    }
  }
  function showInstallHelp() {
    help.textContent = isAppleMobile
      ? 'No iPhone ou iPad, abra o menu Compartilhar do navegador e escolha Adicionar à Tela de Início. Se aparecer a opção Abrir como App da Web, mantenha-a ativada.'
      : 'Abra o menu do navegador e procure Instalar aplicativo ou Adicionar à tela inicial. No computador, procure também o ícone de instalação na barra de endereço. A opção depende do navegador.';
    help.hidden = false;
    help.focus({preventScroll: true});
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    updateInstalledState();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    installButton.hidden = true;
    help.hidden = false;
    help.textContent = 'Prontinho! Procure Miau & Bit na tela inicial do aparelho.';
  });
  if (standaloneQuery.addEventListener) standaloneQuery.addEventListener('change', updateInstalledState);
  installButton.addEventListener('click', async () => {
    if (!installPrompt) { showInstallHelp(); return; }
    const prompt = installPrompt;
    installPrompt = null;
    installButton.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        installButton.hidden = true;
        help.hidden = false;
        help.textContent = 'A instalação foi solicitada. Procure Miau & Bit na tela inicial.';
      }
    } catch (_) { showInstallHelp(); }
    finally { installButton.disabled = false; }
  });

  function showUpdateIfWaiting() {
    const waiting = Boolean(registration && registration.waiting && navigator.serviceWorker.controller);
    updateButton.hidden = !waiting;
    updateMessage.hidden = !waiting;
  }
  updateButton.addEventListener('click', () => {
    if (!registration || !registration.waiting) { showUpdateIfWaiting(); return; }
    refreshRequested = true;
    updateButton.disabled = true;
    registration.waiting.postMessage({type: 'SKIP_WAITING'});
  });

  async function registerApp() {
    if (registering || registration) return;
    if (!('serviceWorker' in navigator) || !window.isSecureContext) {
      status.textContent = 'Para instalar e guardar as aventuras, abra o site publicado em um navegador compatível.';
      return;
    }
    registering = true;
    try {
      registration = await navigator.serviceWorker.register('./sw.js', {scope: './', updateViaCache: 'none'});
      showUpdateIfWaiting();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') showUpdateIfWaiting();
          if (worker.state === 'redundant' && !offlineReady) {
            status.textContent = 'A preparação ficou para depois. Abra novamente com internet para guardar os jogos.';
          }
        });
      });
      navigator.serviceWorker.ready.then(() => {
        offlineReady = true;
        updateStatus();
      });
    } catch (_) {
      status.textContent = 'Os jogos continuam disponíveis no site. Abra novamente com internet para preparar o uso offline.';
    } finally { registering = false; }
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshRequested && !reloading) {
        reloading = true;
        window.location.reload();
      }
    });
  }
  window.addEventListener('offline', updateStatus);
  window.addEventListener('online', () => {
    updateStatus();
    if (registration) registration.update().catch(() => {});
    else registerApp();
  });
  updateInstalledState();
  updateStatus();
  if (document.readyState === 'complete') registerApp();
  else window.addEventListener('load', registerApp, {once: true});
})();
