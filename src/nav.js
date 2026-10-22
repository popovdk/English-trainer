import { icons } from './icons.js';

const base = import.meta.env.BASE_URL;

export const homeUrl = base;

// Список тренажёров: из него строятся карточки на главной и пункты бургер-меню.
export const trainers = [
  {
    id: 'time',
    url: `${base}time/`,
    title: 'Время по часам',
    description: 'Двигайте стрелки — и смотрите, как сказать время по-британски',
    level: 'A1–A2',
    icon: icons.clock,
    color: 'blue',
  },
];
