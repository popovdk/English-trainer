import { icons } from '../icons.js';
import { homeUrl, trainers } from '../nav.js';

/** Шапка с логотипом и бургер-меню. activeId — id текущего тренажёра или 'home'. */
export function renderHeader(root, activeId) {
  const current = (id) => (id === activeId ? ' aria-current="page"' : '');

  root.className = 'header';
  root.innerHTML = `
    <div class="header__inner container">
      <a class="logo" href="${homeUrl}" aria-label="English Trainer — на главную">
        ${icons.logo}
        <span class="logo__text">English<span class="logo__accent">Trainer</span></span>
      </a>
      <button class="icon-btn header__burger" type="button" aria-label="Открыть меню"
        aria-expanded="false" aria-controls="menu">${icons.menu}</button>
    </div>
  `;

  // Меню монтируем в body: backdrop-filter шапки ломает position: fixed у потомков
  const drawer = document.createElement('div');
  drawer.innerHTML = `
    <div class="menu-overlay" hidden></div>
    <nav class="menu" id="menu" aria-label="Главное меню" hidden>
      <div class="menu__head">
        <span class="menu__title">Меню</span>
        <button class="icon-btn menu__close" type="button" aria-label="Закрыть меню">${icons.close}</button>
      </div>
      <a class="menu__link" href="${homeUrl}"${current('home')}>
        <span class="menu__icon">${icons.home}</span>Главная
      </a>
      <div class="menu__section">Тренажёры</div>
      ${trainers
        .map(
          (t) => `
        <a class="menu__link" href="${t.url}"${current(t.id)}>
          <span class="menu__icon menu__icon--${t.color}">${t.icon}</span>${t.title}
        </a>`,
        )
        .join('')}
    </nav>
  `;
  document.body.append(...drawer.children);

  const burger = root.querySelector('.header__burger');
  const menu = document.getElementById('menu');
  const overlay = document.querySelector('.menu-overlay');

  const setOpen = (open) => {
    menu.hidden = !open;
    overlay.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    if (open) menu.querySelector('.menu__close').focus();
    else burger.focus({ preventScroll: true });
  };

  burger.addEventListener('click', () => setOpen(true));
  overlay.addEventListener('click', () => setOpen(false));
  menu.querySelector('.menu__close').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) setOpen(false);
  });
}
