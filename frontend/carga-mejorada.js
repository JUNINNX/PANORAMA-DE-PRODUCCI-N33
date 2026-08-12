(() => {
  'use strict';

  const observer = new MutationObserver(() => {
    const loader = document.getElementById('loading');
    if (!loader || loader.dataset.enhancedLoading === 'true') return;

    loader.dataset.enhancedLoading = 'true';
    loader.classList.add('loading-visible');
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.innerHTML = `
      <div class="loading-brand" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div class="loading-copy">
        <strong>Preparando panorama</strong>
        <p>Cargando indicadores y gráficos…</p>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .loading {
        background: radial-gradient(circle at 50% 42%, rgba(225, 6, 0, .10), transparent 34%), var(--bg) !important;
        gap: 15px !important;
      }
      .loading.loading-visible, .loading.loading-visible.hide { display: flex !important; }
      .loading-brand { align-items: end; display: flex; gap: 6px; height: 44px; }
      .loading-brand span {
        animation: panorama-loading-bar .8s ease-in-out infinite alternate;
        background: linear-gradient(180deg, var(--acc), var(--ferrari-dk)); border-radius: 4px 4px 2px 2px;
        box-shadow: 0 4px 12px rgba(225, 6, 0, .22); display: block; width: 10px;
      }
      .loading-brand span:nth-child(1) { animation-delay: -.35s; height: 18px; }
      .loading-brand span:nth-child(2) { animation-delay: -.18s; height: 31px; }
      .loading-brand span:nth-child(3) { height: 43px; }
      .loading-copy { text-align: center; }
      .loading-copy strong {
        color: var(--txt); display: block; font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600;
        letter-spacing: .7px; text-transform: uppercase;
      }
      .loading-copy p { color: var(--txt2); font-family: 'IBM Plex Mono', monospace; font-size: 12px; margin: 6px 0 0; }
      @keyframes panorama-loading-bar { from { filter: brightness(.76); transform: scaleY(.72); transform-origin: bottom; } to { filter: brightness(1.13); transform: scaleY(1); transform-origin: bottom; } }
      @media (prefers-reduced-motion: reduce) { .loading-brand span { animation: none; } }
    `;
    document.head.append(style);
    window.setTimeout(() => loader.classList.remove('loading-visible'), 950);
    observer.disconnect();
  });

  observer.observe(document, { childList: true, subtree: true });
})();
