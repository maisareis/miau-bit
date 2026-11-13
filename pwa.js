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
  let installedHere = false;
  let registration = null;
  let registering = false;
  let offlineReady = false;
  let refreshRequested = false;
  let reloading = false;
  let pendingReload = false;
  let opening = true;
  let currentController = navigator.serviceWorker && navigator.serviceWorker.controller;

  // Refresh only before the first interaction. A running game keeps its document.
  function keepCurrentSession() { opening = false; }
  ['pointerdown', 'keydown', 'input'].forEach(type => {
    document.addEventListener(type, keepCurrentSession, {capture: true, once: true});
  });
  window.addEventListener('hashchange', keepCurrentSession, {once: true});
  window.addEventListener('pagehide', keepCurrentSession, {once: true});
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') keepCurrentSession();
  });

  function reloadApp() {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  }

  function updateInstalledState() {
    const installed = isStandalone() || installedHere;
    installButton.hidden = installed;
    document.querySelectorAll('[data-install-app],[data-install-section]').forEach(element => element.hidden = installed);
    if (installed) help.hidden = true;
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
  function installHelpFor(button) {
    return button.closest('[data-install-section]') ? document.getElementById('home-install-help') : help;
  }
  function showInstallHelp(button) {
    const output = installHelpFor(button) || help;
    output.textContent = isAppleMobile
      ? 'No iPhone ou iPad, abra o menu Compartilhar do navegador e escolha Adicionar à Tela de Início. Se aparecer a opção Abrir como App da Web, mantenha-a ativada.'
      : 'Abra o menu do navegador e procure Instalar aplicativo ou Adicionar à tela inicial. No computador, procure também o ícone de instalação na barra de endereço. A opção depende do navegador.';
    output.hidden = false;
    output.focus({preventScroll: true});
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    updateInstalledState();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    installedHere = true;
    updateInstalledState();
    help.hidden = false;
    help.textContent = 'Prontinho! Procure Miau & Bit na tela inicial do aparelho.';
  });
  if (standaloneQuery.addEventListener) standaloneQuery.addEventListener('change', updateInstalledState);
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-install-app]');
    if (!button || button.disabled) return;
    if (!installPrompt) { showInstallHelp(button); return; }
    const prompt = installPrompt;
    installPrompt = null;
    document.querySelectorAll('[data-install-app]').forEach(element => element.disabled = true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        const output = installHelpFor(button) || help;
        output.hidden = false;
        output.textContent = 'A instalação foi solicitada. Procure Miau & Bit na tela inicial.';
      }
    } catch (_) { showInstallHelp(button); }
    finally { document.querySelectorAll('[data-install-app]').forEach(element => element.disabled = false); }
  });

  function showUpdateIfWaiting() {
    const waiting = Boolean(registration && registration.waiting && navigator.serviceWorker.controller);
    updateButton.hidden = !(waiting || pendingReload);
    updateMessage.hidden = updateButton.hidden;
    if (waiting && opening && document.visibilityState === 'visible') {
      registration.waiting.postMessage({type: 'SKIP_WAITING'});
    }
  }
  updateButton.addEventListener('click', () => {
    if (pendingReload) { reloadApp(); return; }
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
      function watchInstallingWorker() {
        const worker = registration.installing;
        if (!worker) return;
        const checkState = () => {
          if (worker.state === 'installed') showUpdateIfWaiting();
          if (worker.state === 'redundant' && !offlineReady) {
            status.textContent = 'A preparação ficou para depois. Abra novamente com internet para guardar os jogos.';
          }
        };
        worker.addEventListener('statechange', checkState);
        checkState();
      }
      registration.addEventListener('updatefound', watchInstallingWorker);
      watchInstallingWorker();
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
      const previousController = currentController;
      currentController = navigator.serviceWorker.controller;
      if (!previousController || !currentController || currentController === previousController) return;
      pendingReload = true;
      if (refreshRequested || (opening && document.visibilityState === 'visible')) {
        reloadApp();
      } else {
        showUpdateIfWaiting();
      }
    });
  }
  window.addEventListener('offline', updateStatus);
  window.addEventListener('miau:pagechange', updateInstalledState);
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
