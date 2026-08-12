(() => {
  'use strict';

  const themeKey = 'panorama_login_theme';
  const root = document.documentElement;

  function automaticTheme() {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 7 ? 'dark' : 'light';
  }

  function applyTheme(preference) {
    const resolved = preference === 'auto' ? automaticTheme() : preference;
    root.dataset.loginTheme = resolved;
    root.dataset.loginThemePreference = preference;
    localStorage.setItem(themeKey, preference);

    document.querySelectorAll('[data-login-theme-choice]').forEach((button) => {
      const isSelected = button.dataset.loginThemeChoice === preference;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });

    const status = document.querySelector('.theme-switcher__status');
    if (status) status.textContent = preference === 'auto' ? `Auto: ${resolved === 'dark' ? 'oscuro' : 'claro'}` : `Tema ${resolved}`;
  }

  function scheduleAutomaticUpdate() {
    const now = new Date();
    const next = new Date(now);
    if (now.getHours() < 7) next.setHours(7, 0, 0, 0);
    else if (now.getHours() < 18) next.setHours(18, 0, 0, 0);
    else { next.setDate(now.getDate() + 1); next.setHours(7, 0, 0, 0); }
    window.setTimeout(() => {
      if ((localStorage.getItem(themeKey) || 'auto') === 'auto') applyTheme('auto');
      scheduleAutomaticUpdate();
    }, Math.max(1000, next.getTime() - now.getTime()));
  }

  const style = document.createElement('style');
  style.textContent = `
    .theme-switcher {
      align-items: center; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      background: rgba(4, 5, 6, .78); border: 1px solid rgba(255, 42, 54, .45);
      border-radius: 12px; box-shadow: 0 8px 28px rgba(0, 0, 0, .25); color: #fff;
      display: flex; gap: 3px; padding: 4px; position: fixed; right: 18px; top: 18px; z-index: 10;
    }
    .theme-switcher__button {
      background: transparent; border: 0; border-radius: 8px; color: inherit; cursor: pointer;
      font: 600 11px/1 'Poppins', Arial, sans-serif; padding: 8px 9px; transition: background .18s, color .18s, transform .18s;
    }
    .theme-switcher__button:hover { background: rgba(255, 255, 255, .1); transform: translateY(-1px); }
    .theme-switcher__button.is-selected { background: #e30613; color: #fff; box-shadow: 0 2px 10px rgba(227, 6, 19, .35); }
    .theme-switcher__status { left: -9999px; position: absolute; }

    html[data-login-theme="light"] body { background: #edf0f4; color: #15181d; }
    html[data-login-theme="light"] .background {
      background:
        radial-gradient(ellipse 60% 45% at 5% 106%, rgba(227, 6, 19, .24) 0%, transparent 72%),
        linear-gradient(125deg, #fff 0%, #fffafa 44%, #ffe7e9 100%);
    }
    html[data-login-theme="light"] .background::before {
      opacity: 1;
      background:
        linear-gradient(90deg, rgba(227, 6, 19, .13), transparent 32%),
        linear-gradient(180deg, rgba(255,255,255,.16), transparent 44%);
      animation: none;
    }
    html[data-login-theme="light"] .background::after,
    html[data-login-theme="light"] .scanline { display: none; }
    html[data-login-theme="light"] .energy,
    html[data-login-theme="light"] #particles { display: none; }

    .light-theme-scene { display: none; }
    html[data-login-theme="light"] .light-theme-scene {
      display: block; inset: 0; overflow: hidden; pointer-events: none; position: fixed; z-index: -3;
    }
    .light-orbit {
      border-radius: 50%; pointer-events: none; position: absolute;
      background:
        radial-gradient(circle at center, rgba(227, 6, 19, .94) 0 5.5%, transparent 5.8% 21.8%, rgba(227, 6, 19, .78) 22.1% 23.2%, transparent 23.5% 37.2%, rgba(227, 6, 19, .42) 37.5% 38.3%, transparent 38.7% 51%, rgba(227, 6, 19, .22) 51.3% 52%, transparent 52.5%);
      filter: drop-shadow(0 0 18px rgba(227, 6, 19, .28));
    }
    .light-orbit::before {
      content: ""; inset: -3px; position: absolute; border-radius: 50%;
      background: conic-gradient(from 15deg, transparent 0 38deg, rgba(227, 6, 19, .95) 39deg 43deg, transparent 44deg 112deg, rgba(227, 6, 19, .55) 113deg 116deg, transparent 117deg 254deg, rgba(227, 6, 19, .7) 255deg 260deg, transparent 261deg);
      -webkit-mask: radial-gradient(circle, transparent 0 62%, #000 62.8% 63.8%, transparent 64.6%);
      mask: radial-gradient(circle, transparent 0 62%, #000 62.8% 63.8%, transparent 64.6%);
      animation: lightOrbitSpin 12s linear infinite;
    }
    .light-orbit::after {
      content: ""; position: absolute; inset: 9%; border: 2px solid rgba(227, 6, 19, .24); border-radius: 50%;
      box-shadow: inset 0 0 26px rgba(227, 6, 19, .11), 0 0 24px rgba(227, 6, 19, .09);
    }
    .light-orbit--main { height: min(62vw, 760px); right: min(-16vw, -140px); top: min(-29vw, -210px); width: min(62vw, 760px); animation: lightOrbitPulse 4.8s ease-in-out infinite; }
    .light-orbit--echo { bottom: min(-25vw, -175px); height: min(42vw, 520px); left: min(-17vw, -140px); opacity: .62; width: min(42vw, 520px); animation: lightOrbitPulse 5.5s ease-in-out infinite reverse; }
    .light-spotlight {
      height: min(58vw, 720px); opacity: .82; overflow: hidden; pointer-events: none; position: absolute; width: min(58vw, 720px);
      filter: blur(2px); mix-blend-mode: multiply;
    }
    .light-spotlight::before {
      content: ""; inset: 0; position: absolute;
      background: linear-gradient(135deg, rgba(227, 6, 19, .68) 0%, rgba(227, 6, 19, .28) 22%, rgba(227, 6, 19, .055) 54%, transparent 76%);
      clip-path: polygon(0 0, 100% 18%, 100% 55%, 0 9%);
      filter: blur(10px); transform-origin: 0 0;
      animation: lightSpotSweep 6.5s ease-in-out infinite alternate;
    }
    .light-spotlight::after {
      content: ""; height: 18px; left: 0; position: absolute; top: 0; width: 18px;
      background: #f20b1b; border-radius: 50%; box-shadow: 0 0 18px 6px rgba(242, 11, 27, .88), 0 0 56px 18px rgba(227, 6, 19, .42);
      animation: lightLampPulse 3.3s ease-in-out infinite;
    }
    .light-spotlight--top-left { left: -3px; top: -3px; }
    .light-spotlight--top-right { right: -3px; top: -3px; transform: scaleX(-1); }
    html[data-login-theme="light"] .brand-sub { color: #29303a; }
    html[data-login-theme="light"] .brand-tagline { color: #66707d; }
    html[data-login-theme="light"] .card {
      background: linear-gradient(145deg, rgba(255, 255, 255, .96), rgba(246, 248, 250, .94));
      border-color: rgba(227, 6, 19, .45);
      box-shadow: 0 0 0 1px rgba(227, 6, 19, .06) inset, 0 12px 42px rgba(42, 51, 64, .17), inset 0 0 35px rgba(227, 6, 19, .025);
    }
    html[data-login-theme="light"] .welcome { color: #15181d; }
    html[data-login-theme="light"] .subtitle, html[data-login-theme="light"] .footer { color: #65707c; }
    html[data-login-theme="light"] input {
      background: rgba(255, 255, 255, .9); border-color: #c8d0da; color: #171b21; box-shadow: inset 0 0 16px rgba(31, 41, 55, .045);
    }
    html[data-login-theme="light"] input::placeholder { color: #7a8591; }
    html[data-login-theme="light"] input:focus { background: #fff; border-color: #e30613; box-shadow: 0 0 0 2px rgba(227, 6, 19, .12), 0 0 20px rgba(227, 6, 19, .11); }
    html[data-login-theme="light"] .field-icon, html[data-login-theme="light"] .toggle-password { color: #45515d; }
    html[data-login-theme="light"] .user-icon::before, html[data-login-theme="light"] .user-icon::after,
    html[data-login-theme="light"] .lock-icon::before, html[data-login-theme="light"] .lock-icon::after,
    html[data-login-theme="light"] .toggle-password::before { border-color: #45515d; }
    html[data-login-theme="light"] .toggle-password::after { background: #45515d; }
    html[data-login-theme="light"] .error {
      background: #fff0f1; border-color: #ee737a; color: #980813; font-weight: 600;
      box-shadow: 0 6px 18px rgba(177, 11, 22, .12);
    }
    html[data-login-theme="light"] .theme-switcher { background: rgba(255, 255, 255, .85); border-color: rgba(100, 112, 125, .28); color: #313a45; }
    html[data-login-theme="light"] .theme-switcher__button:hover { background: rgba(31, 41, 55, .07); }
    html[data-login-theme="light"] .theme-switcher__button.is-selected { color: #fff; }

    @keyframes lightOrbitPulse {
      0%, 100% { filter: drop-shadow(0 0 16px rgba(227, 6, 19, .24)); opacity: .75; transform: scale(.96); }
      50% { filter: drop-shadow(0 0 33px rgba(227, 6, 19, .55)); opacity: 1; transform: scale(1.04); }
    }
    @keyframes lightOrbitSpin {
      to { transform: rotate(360deg); }
    }
    @keyframes lightSpotSweep {
      0% { opacity: .42; transform: rotate(-8deg) scale(.95); }
      100% { opacity: 1; transform: rotate(7deg) scale(1.08); }
    }
    @keyframes lightLampPulse {
      0%, 100% { box-shadow: 0 0 13px 4px rgba(242, 11, 27, .66), 0 0 38px 12px rgba(227, 6, 19, .28); transform: scale(.82); }
      50% { box-shadow: 0 0 23px 8px rgba(242, 11, 27, .96), 0 0 65px 23px rgba(227, 6, 19, .5); transform: scale(1.16); }
    }

    @media (max-width: 700px) {
      .theme-switcher { right: 12px; top: 12px; }
      .theme-switcher__button { font-size: 10px; padding: 7px 8px; }
    }
    @media (max-width: 380px) {
      .theme-switcher__button { font-size: 9px; padding: 7px; }
    }
  `;
  document.head.append(style);

  document.addEventListener('DOMContentLoaded', () => {
    const scene = document.createElement('div');
    scene.className = 'light-theme-scene';
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML = '<span class="light-orbit light-orbit--main"></span><span class="light-orbit light-orbit--echo"></span><span class="light-spotlight light-spotlight--top-left"></span><span class="light-spotlight light-spotlight--top-right"></span>';
    document.body.append(scene);

    const picker = document.createElement('div');
    picker.className = 'theme-switcher';
    picker.setAttribute('role', 'group');
    picker.setAttribute('aria-label', 'Seleccionar tema visual');
    picker.innerHTML = `
      <button class="theme-switcher__button" type="button" data-login-theme-choice="auto">Auto</button>
      <button class="theme-switcher__button" type="button" data-login-theme-choice="light">Claro</button>
      <button class="theme-switcher__button" type="button" data-login-theme-choice="dark">Oscuro</button>
      <span class="theme-switcher__status" aria-live="polite"></span>
    `;
    document.body.append(picker);

    picker.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-login-theme-choice]');
      if (choice) applyTheme(choice.dataset.loginThemeChoice);
    });

    applyTheme(localStorage.getItem(themeKey) || 'auto');
    scheduleAutomaticUpdate();
  });
})();
