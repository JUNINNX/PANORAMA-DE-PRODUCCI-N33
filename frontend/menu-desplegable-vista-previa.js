(() => {
  'use strict';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function connectedUserName() {
    const token = sessionStorage.getItem('panorama_access_token');
    if (!token) return 'Sesión activa';

    try {
      const part = token.split('.')[1];
      if (!part) return 'Sesión activa';
      const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
      return payload.name || payload.username || payload.user || payload.email || payload.sub || 'Sesión activa';
    } catch {
      return 'Sesión activa';
    }
  }

  function createProfile(toolbar) {
    const userName = connectedUserName();
    const initial = userName === 'Sesión activa' ? 'U' : userName.trim().charAt(0).toUpperCase();
    const profile = document.createElement('aside');
    profile.className = 'user-profile noprint';
    profile.setAttribute('aria-label', 'Sesión de usuario');
    profile.innerHTML = `
      <div class="user-profile__identity" title="${escapeHtml(userName)}">
        <span class="user-profile__avatar" aria-hidden="true">${escapeHtml(initial)}</span>
        <span class="user-profile__copy">
          <span class="user-profile__label">Conectado como</span>
          <strong class="user-profile__name">${escapeHtml(userName)}</strong>
        </span>
      </div>
      <button class="btn utility-action logout-action" type="button" aria-label="Cerrar sesión">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5"></path>
        </svg>
        <span>Salir</span>
      </button>
    `;

    const host = toolbar.closest('header') || document.body;
    host.append(profile);
    return { profile, logoutButton: profile.querySelector('.logout-action') };
  }

  function improveFeedback() {
    const loader = document.getElementById('loading');
    if (loader) {
      loader.setAttribute('role', 'status');
      loader.setAttribute('aria-live', 'polite');
      const message = loader.querySelector('p');
      if (message) message.textContent = 'Cargando indicadores y gráficos…';
    }

    if (document.getElementById('panorama-notice')) return;
    const notice = document.createElement('div');
    notice.id = 'panorama-notice';
    notice.className = 'panorama-notice';
    notice.setAttribute('role', 'alert');
    notice.setAttribute('aria-live', 'assertive');
    document.body.append(notice);

    let timeoutId;
    const showNotice = (message, type = 'error') => {
      clearTimeout(timeoutId);
      notice.className = `panorama-notice is-visible is-${type}`;
      notice.innerHTML = `<span class="panorama-notice__icon" aria-hidden="true">${type === 'success' ? '✓' : type === 'info' ? 'i' : '!'}</span><span>${escapeHtml(message)}</span>`;
      timeoutId = window.setTimeout(() => notice.classList.remove('is-visible'), type === 'error' ? 7000 : 4200);
    };

    window.addEventListener('offline', () => showNotice('Sin conexión. Revisa tu red e inténtalo de nuevo.', 'error'));
    window.addEventListener('online', () => showNotice('Conexión restablecida.', 'success'));
    window.addEventListener('error', (event) => {
      if (event?.message && !/ResizeObserver loop/i.test(event.message)) {
        showNotice('Ocurrió un problema al cargar una parte del panel. Recarga la página si la información no aparece.', 'error');
      }
    });
    window.addEventListener('unhandledrejection', () => {
      showNotice('No se pudo completar la operación. Verifica la conexión e inténtalo de nuevo.', 'error');
    });

    const excelResult = document.getElementById('xlsResult');
    if (excelResult) {
      excelResult.setAttribute('role', 'status');
      excelResult.setAttribute('aria-live', 'polite');
      new MutationObserver(() => {
        const text = excelResult.textContent.trim();
        if (/^Error|No se pudo|No se reconoció/i.test(text)) {
          excelResult.classList.add('has-error');
        } else {
          excelResult.classList.remove('has-error');
        }
      }).observe(excelResult, { childList: true, subtree: true, characterData: true });
    }
  }

  function createMenu(toolbar) {
    if (!toolbar || toolbar.dataset.menuReady === 'true') return false;

    const actions = Array.from(toolbar.children);
    const menuActions = actions.filter((action) => action.matches('a[href]'));
    const visibleActions = actions.filter((action) => !menuActions.includes(action));
    if (!menuActions.length) return false;

    toolbar.dataset.menuReady = 'true';
    toolbar.classList.add('actions-menu-bar');

    const menu = document.createElement('div');
    menu.className = 'actions-menu';
    menu.innerHTML = `
      <button class="actions-menu__trigger" type="button" aria-expanded="false" aria-controls="actions-menu-panel">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
        <span>Menú</span>
      </button>
      <div class="actions-menu__panel" id="actions-menu-panel" role="menu" aria-label="Acciones del panel"></div>
    `;

    const trigger = menu.querySelector('.actions-menu__trigger');
    const panel = menu.querySelector('.actions-menu__panel');

    menuActions.forEach((action) => {
      action.classList.add('actions-menu__item');
      action.setAttribute('role', 'menuitem');
      panel.append(action);
    });
    const themeButton = document.createElement('button');
    themeButton.className = 'btn ghost utility-action actions-menu__item';
    themeButton.type = 'button';
    themeButton.setAttribute('aria-pressed', 'false');
    themeButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <path d="M20.4 15.4A8.2 8.2 0 0 1 8.6 3.6 8.2 8.2 0 1 0 20.4 15.4Z"></path>
      </svg>
      <span class="theme-label">Modo oscuro</span>
    `;

    themeButton.setAttribute('role', 'menuitem');
    panel.append(themeButton);
    toolbar.append(menu, ...visibleActions);
    const { logoutButton } = createProfile(toolbar);

    const themeLabel = themeButton.querySelector('.theme-label');
    function setTheme(isDark) {
      document.body.classList.toggle('dark-mode', isDark);
      themeButton.setAttribute('aria-pressed', String(isDark));
      themeLabel.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
      localStorage.setItem('panorama_theme', isDark ? 'dark' : 'light');
    }

    setTheme(localStorage.getItem('panorama_theme') === 'dark');
    themeButton.addEventListener('click', () => {
      setTheme(!document.body.classList.contains('dark-mode'));
    });

    logoutButton.addEventListener('click', () => {
      sessionStorage.removeItem('panorama_access_token');
      sessionStorage.clear();
      window.location.replace('login.html');
    });

    function closeMenu({ restoreFocus = false } = {}) {
      menu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) trigger.focus();
    }

    function openMenu() {
      menu.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', () => {
      if (menu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      openMenu();
      panel.querySelector('.actions-menu__item')?.focus();
    });

    document.addEventListener('pointerdown', (event) => {
      if (!menu.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu({ restoreFocus: true });
      }
    });

    panel.addEventListener('click', () => closeMenu());

    improveFeedback();

    const style = document.createElement('style');
    style.textContent = `
      .actions-menu-bar { position: relative; }
      .actions-menu { position: relative; z-index: 80; }
      .actions-menu__trigger {
        align-items: center; background: var(--panel); border: 1px solid var(--line2);
        border-radius: 10px; color: var(--txt); cursor: pointer; display: inline-flex;
        font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: 600; gap: 8px;
        letter-spacing: .5px; padding: 11px 16px; text-transform: uppercase;
        transition: .15s;
      }
      .actions-menu__trigger:hover, .actions-menu.is-open .actions-menu__trigger {
        border-color: var(--acc); color: var(--acc); transform: translateY(-1px);
      }
      .actions-menu__trigger svg { fill: none; height: 15px; stroke: currentColor; stroke-linecap: round; stroke-width: 2; width: 15px; }
      .actions-menu__panel {
        background: var(--panel); border: 1px solid var(--line2); border-radius: 12px;
        box-shadow: 0 14px 32px rgba(20, 22, 26, .18); display: none; min-width: 230px;
        padding: 7px; position: absolute; left: 0; top: calc(100% + 8px);
      }
      .actions-menu.is-open .actions-menu__panel { display: grid; gap: 4px; }
      .actions-menu__panel .actions-menu__item {
        border-radius: 8px; box-shadow: none; justify-content: flex-start; text-decoration: none; width: 100%;
      }
      .actions-menu__panel .actions-menu__item.btn:not(.ghost) { box-shadow: none; }
      .utility-action { white-space: nowrap; }
      .user-profile {
        align-items: center; background: var(--panel); border: 1px solid var(--line2); border-radius: 12px;
        box-shadow: 0 8px 22px rgba(20, 22, 26, .12); display: flex; gap: 10px; padding: 7px 8px 7px 10px;
        position: fixed; right: 18px; top: 14px; z-index: 90;
      }
      .user-profile__identity { align-items: center; display: flex; gap: 8px; max-width: 190px; min-width: 0; }
      .user-profile__avatar {
        align-items: center; background: linear-gradient(145deg, var(--acc), var(--ferrari-dk)); border-radius: 50%; color: #fff;
        display: inline-flex; flex: 0 0 29px; font-family: 'Oswald', sans-serif; font-size: 14px; font-weight: 600;
        height: 29px; justify-content: center; width: 29px;
      }
      .user-profile__copy { display: grid; line-height: 1.08; min-width: 0; }
      .user-profile__label { color: var(--txt3); font-size: 9px; letter-spacing: .35px; text-transform: uppercase; }
      .user-profile__name { color: var(--txt); font-family: 'IBM Plex Mono', monospace; font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .logout-action { background: #b91c1c; box-shadow: 0 2px 8px rgba(185, 28, 28, .2); padding: 9px 11px; }
      .logout-action:hover { background: #991b1b; }
      body.tv .user-profile { display: none !important; }

      .panorama-notice {
        align-items: center; background: var(--panel); border: 1px solid var(--line2); border-left: 4px solid var(--acc);
        border-radius: 10px; box-shadow: 0 14px 34px rgba(20, 22, 26, .2); color: var(--txt); display: flex;
        font-size: 12px; gap: 9px; left: 50%; max-width: min(460px, calc(100vw - 28px)); opacity: 0; padding: 11px 14px;
        pointer-events: none; position: fixed; top: 16px; transform: translate(-50%, -14px); transition: opacity .2s, transform .2s; z-index: 120;
      }
      .panorama-notice.is-visible { opacity: 1; transform: translate(-50%, 0); }
      .panorama-notice.is-error { border-left-color: var(--red); }
      .panorama-notice.is-success { border-left-color: var(--green); }
      .panorama-notice.is-info { border-left-color: var(--gold); }
      .panorama-notice__icon {
        align-items: center; background: var(--bg2); border-radius: 50%; color: var(--acc); display: inline-flex; flex: 0 0 20px;
        font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: 700; height: 20px; justify-content: center; width: 20px;
      }
      .panorama-notice.is-error .panorama-notice__icon { color: var(--red); }
      .panorama-notice.is-success .panorama-notice__icon { color: var(--green); }
      #xlsResult.has-error { background: rgba(225, 6, 0, .08); border: 1px solid rgba(225, 6, 0, .34); border-radius: 8px; color: var(--red); padding: 9px 11px; }
      body.dark-mode {
        --bg: #101216; --bg2: #181b20; --panel: #1b1f25; --panel2: #232830;
        --line: #303640; --line2: #444c59; --txt: #f2f4f7; --txt2: #c1c7d0;
        --txt3: #929aa5; --green: #8ed3ad; --gold: #d2b66f; --glow1: rgba(225, 6, 0, .13);
        --glow2: rgba(255, 255, 255, .035);
      }
      body.dark-mode .actions-menu__trigger, body.dark-mode .actions-menu__panel { box-shadow: 0 14px 32px rgba(0, 0, 0, .4); }
      body.dark-mode #machTrendBox > div:first-child > div {
        background: linear-gradient(145deg, #242a33, #1e232b) !important;
        border-color: #414a57 !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, .18);
      }
      body.dark-mode #machTrendBox > div:first-child > div > div:first-child > span:last-child {
        background: rgba(255, 255, 255, .04);
      }
      body.dark-mode .mdetail { background: #1e232b; }
      body.dark-mode .art-row {
        background: linear-gradient(145deg, #252c36, #20262f) !important;
        border-color: #454f5d !important;
        box-shadow: 0 3px 9px rgba(0, 0, 0, .16);
      }
      body.dark-mode .art-row .art-nm,
      body.dark-mode .art-row .art-v { color: var(--txt); }
      body.dark-mode .art-row .art-pc,
      body.dark-mode .art-row .art-mom { color: var(--txt2); }
      body.dark-mode .tvexit {
        background: #e10600;
        border: 1px solid rgba(255, 255, 255, .24);
        box-shadow: 0 6px 18px rgba(0, 0, 0, .35);
        color: #fff;
        font-weight: 600;
      }
      body.dark-mode .tvexit:hover { background: #b00500; }
      @media (max-width: 760px) {
        html, body { max-width: 100%; overflow-x: hidden; }
        .wrap { padding: 16px 12px 44px; }
        header { align-items: stretch; gap: 14px; margin-bottom: 14px; padding-bottom: 14px; }
        .brand { align-items: flex-start; gap: 10px; width: 100%; }
        .brand .logo { height: auto !important; max-width: 138px; width: 138px !important; }
        h1 { font-size: clamp(18px, 5.5vw, 22px); line-height: 1.08; }
        .sub { font-size: 10px; line-height: 1.35; margin-top: 4px; }

        .actions-menu-bar { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; }
        .actions-menu { min-width: 0; width: 100%; }
        .actions-menu__trigger, .actions-menu-bar > .btn {
          font-size: 11px; justify-content: center; min-width: 0; padding: 10px 8px; width: 100%;
        }
        .user-profile { border-radius: 10px; gap: 7px; padding: 6px 7px; right: 10px; top: 10px; }
        .user-profile__identity { max-width: 126px; }
        .user-profile__avatar { flex-basis: 26px; font-size: 12px; height: 26px; width: 26px; }
        .user-profile__label { display: none; }
        .user-profile__name { font-size: 10px; }
        .logout-action { font-size: 11px; padding: 8px 9px; }
        .logout-action svg { height: 14px; width: 14px; }
        .user-profile { position: static; align-self: flex-end; margin: -4px 0 4px auto; width: max-content; }
        .actions-menu__trigger svg, .actions-menu-bar > .btn svg { flex: 0 0 auto; }
        .actions-menu__panel { left: 0; min-width: 0; right: 0; width: 100%; }
        .actions-menu__panel .actions-menu__item { font-size: 12px; justify-content: flex-start; }

        .filters { align-items: stretch; gap: 11px; padding: 12px; }
        .filters .fl { width: 100%; }
        .filters .fl[style] { min-width: 0 !important; }
        .filters select, .filters input[type=text], .filters .search { min-width: 0; width: 100%; }
        .filters .clr { align-self: flex-start; padding-left: 0; }

        .kpis { gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .kpi { min-width: 0; padding: 13px; }
        .kpi .v { font-size: 24px; }
        .panel { border-radius: 12px; margin-bottom: 12px; }
        .phead { align-items: flex-start; padding: 13px 14px; }
        .phead h2 { font-size: 14px; line-height: 1.25; }
        .phead .hint { font-size: 10px; text-align: right; }
        .pbody { padding: 13px 14px; }
        .barrow { gap: 8px; }
        .barrow .nm { width: min(34vw, 135px); }
        .barrow .nv { font-size: 10px; width: 66px; }
        .barrow .pc { display: none; }
        .barrow .cm { width: 56px; }
        .cmgr { font-size: 10px; }
        .tscroll { margin-right: -14px; padding-right: 14px; }
        table { font-size: 11.5px; }

        #machTrendBox > div:first-child { gap: 10px !important; grid-template-columns: 1fr !important; }
        #machTrendBox > div:first-child > div { padding: 11px 12px 9px !important; }
        #machCorteBox .mrow, #machTransBox .mrow {
          align-items: center; column-gap: 8px; grid-template-columns: minmax(0, 1fr) max-content; padding: 13px 6px 11px; row-gap: 7px;
        }
        #machCorteBox .mrow .m-l, #machTransBox .mrow .m-l { min-width: 0; }
        #machCorteBox .mrow .m-nm, #machTransBox .mrow .m-nm { font-size: 12.5px; white-space: normal; }
        #machCorteBox .mrow .m-art, #machTransBox .mrow .m-art { font-size: 9px; padding: 1px 5px; }
        #machCorteBox .mrow .meta-track, #machTransBox .mrow .m-idle, #machCorteBox .mrow .m-meta, #machTransBox .mrow .m-meta { display: none; }
        #machCorteBox .mrow .m-pct, #machTransBox .mrow .m-pct { font-size: 17px; grid-column: 2; grid-row: 1; }
        #machCorteBox .mrow .m-v, #machTransBox .mrow .m-v { font-size: 12px; grid-column: 1 / -1; grid-row: 2; text-align: left; }
        #machCorteBox .mrow .meta-sem, #machTransBox .mrow .meta-sem { font-size: 11.5px; grid-column: 1 / -1; grid-row: 3; }
        #machCorteBox .mdetail, #machTransBox .mdetail { padding-left: 8px; }
        .panorama-notice { font-size: 11.5px; top: 62px; }
        .modal { padding: 12px; }
        .modal .box { max-height: calc(100vh - 24px); }
        .modal .mh, .modal .mb { padding-left: 16px; padding-right: 16px; }
      }
      @media (max-width: 380px) {
        .brand .logo { max-width: 116px; width: 116px !important; }
        h1 { font-size: 17px; }
        .actions-menu__trigger, .actions-menu-bar > .btn { font-size: 10px; gap: 6px; padding: 10px 6px; }
        .kpis { grid-template-columns: 1fr; }
        .user-profile__identity { max-width: 106px; }
        .logout-action span { display: none; }
        .logout-action { padding: 8px; }
      }
    `;
    document.head.append(style);
    return true;
  }

  const observer = new MutationObserver(() => {
    if (createMenu(document.querySelector('.htools.noprint'))) observer.disconnect();
  });

  observer.observe(document, { childList: true, subtree: true });
  createMenu(document.querySelector('.htools.noprint'));
})();
