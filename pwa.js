'use strict';

(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const installBtn = document.getElementById('installBtn');
  const iosHint = document.getElementById('iosHint');
  let deferred = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    if (installBtn && !standalone) installBtn.hidden = false;
  });

  if (installBtn) installBtn.addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    deferred = null;
    installBtn.hidden = true;
  });

  window.addEventListener('appinstalled', () => { if (installBtn) installBtn.hidden = true; });

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let dismissed = false;
  try { dismissed = localStorage.getItem('poskesdes_ios_hint') === '1'; } catch (e) {}
  if (iosHint && isIos && !standalone && !dismissed) {
    iosHint.hidden = false;
    document.getElementById('iosHintClose').addEventListener('click', () => {
      iosHint.hidden = true;
      try { localStorage.setItem('poskesdes_ios_hint', '1'); } catch (e) {}
    });
  }
})();
