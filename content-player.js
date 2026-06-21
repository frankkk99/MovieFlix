(function () {
  const STORE_KEY = 'portfolioContentLinksV1';
  let lastRenderKey = '';

  function normalizeTitle(value) {
    return String(value || '').trim().toLowerCase();
  }

  function readLinks() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function toPreviewUrl(url) {
    const input = String(url || '').trim();
    if (!input) return '';
    if (input.includes('/preview')) return input;

    const fileMatch = input.match(/\/file\/d\/([^/]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }

    const idMatch = input.match(/[?&]id=([^&]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }

    return input;
  }

  function renderPortfolioBox() {
    const section = document.getElementById('portfolio-section');
    const titleEl = document.getElementById('player-title');
    if (!section || !titleEl) return;

    const title = titleEl.textContent.trim();
    if (!title) return;

    const links = readLinks();
    const key = normalizeTitle(title);
    const link = toPreviewUrl(links[key]);
    const renderKey = `${key}::${link}`;

    if (renderKey === lastRenderKey) return;
    lastRenderKey = renderKey;

    section.innerHTML = `
      <h3 class="text-2xl font-bold mb-4 border-l-4 border-red-600 pl-4">รับชมผลงาน</h3>
      <div id="portfolio-player-box" class="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 shadow-lg flex items-center justify-center"></div>
    `;

    const box = document.getElementById('portfolio-player-box');
    if (!box) return;

    if (!link) {
      box.innerHTML = '<p class="text-2xl md:text-3xl font-bold text-white">เร็วๆ นี้</p>';
      return;
    }

    box.innerHTML = `
      <iframe
        src="${link}"
        class="absolute inset-0 w-full h-full rounded-lg"
        allow="autoplay"
        allowfullscreen>
      </iframe>
    `;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const titleEl = document.getElementById('player-title');
    if (titleEl) {
      new MutationObserver(renderPortfolioBox).observe(titleEl, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    window.addEventListener('storage', renderPortfolioBox);
    setInterval(renderPortfolioBox, 1000);
  });
})();
