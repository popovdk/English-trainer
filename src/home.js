import { initPage } from './app.js';
import { icons } from './icons.js';
import { trainers } from './nav.js';

initPage('home');

const cards = trainers.map(
  (t) => `
  <a class="trainer-card" href="${t.url}">
    <span class="trainer-card__icon trainer-card__icon--${t.color}">${t.icon}</span>
    <span class="trainer-card__body">
      <span class="trainer-card__title">${t.title}</span>
      <span class="trainer-card__text">${t.description}</span>
      <span class="trainer-card__tags"><span class="chip">Уровень ${t.level}</span></span>
    </span>
    <span class="trainer-card__arrow">${icons.arrowRight}</span>
  </a>`,
);

cards.push(`
  <div class="trainer-card trainer-card--soon">
    <span class="trainer-card__icon trainer-card__icon--muted">${icons.sparkle}</span>
    <span class="trainer-card__body">
      <span class="trainer-card__title">Скоро новые тренажёры</span>
      <span class="trainer-card__text">Следите за обновлениями</span>
    </span>
  </div>`);

document.getElementById('trainer-grid').innerHTML = cards.join('');
