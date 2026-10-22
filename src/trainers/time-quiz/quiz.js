// Логика заданий тренажёра «Время: проверь себя». Без DOM — легко тестировать.
import { britishPhrase, digitalPhrase, splitTime, spokenPhrase } from '../time/time-words.js';

const mod = (n, m) => ((n % m) + m) % m;

export function shuffle(items, random = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Случайное время (минуты от полуночи), не равное previous. */
export function randomTime({ anyMinutes = false, previous = -1, random = Math.random } = {}) {
  const step = anyMinutes ? 1 : 5;
  let t;
  do t = Math.floor(random() * (1440 / step)) * step;
  while (t === previous || (!anyMinutes && t % 60 === 0 && random() < 0.6)); // ровных часов поменьше
  return t;
}

/** Как показать время цифрами: 5:10 или 17:10. */
export function formatDigits(total, h24 = false) {
  const { hour24, hour12, minute } = splitTime(total);
  const mm = String(minute).padStart(2, '0');
  return h24 ? `${String(hour24).padStart(2, '0')}:${mm}` : `${hour12}:${mm}`;
}

/** Правильная фраза; в 24-часовом режиме — с частью суток. */
export function answerPhrase(total, h24 = false) {
  return h24 ? spokenPhrase(total, true) : britishPhrase(total);
}

/** «Как на табло»: five ten (p.m.). */
export function answerDigital(total, h24 = false) {
  const { isPm } = splitTime(total);
  return h24 ? `${digitalPhrase(total)} ${isPm ? 'p.m.' : 'a.m.'}` : digitalPhrase(total);
}

/**
 * Варианты для «Выбери фразу»: правильный + типичные ошибки
 * (не тот час для to, перепутаны past/to, соседние минуты, без minutes, не та часть суток).
 */
export function phraseOptions(total, { h24 = false, count = 4, random = Math.random } = {}) {
  const correct = answerPhrase(total, h24);
  const { minute: m } = splitTime(total);
  const wrong = new Set();
  const add = (p) => {
    if (p && p !== correct) wrong.add(p);
  };
  const at = (t) => answerPhrase(mod(t, 1440), h24);

  // Ошибка часа: «twenty to two» вместо «twenty to three», «half past three» для 2:30
  add(at(total - 60));
  add(at(total + 60));
  // Перепутали стороны: 2:40 → «twenty past two»
  if (m !== 0 && m !== 30) add(at(total - m + (60 - m)));
  // Соседние минуты
  if (m % 5 === 0) {
    add(at(total + 5));
    add(at(total - 5));
  } else {
    // Пропущено слово minutes
    add(correct.replace(/ minutes? /, ' '));
    add(at(total + 1));
  }
  // Не та часть суток
  if (h24) add(at(total + 720));

  const picked = shuffle([...wrong], random).slice(0, count - 1);
  return shuffle([correct, ...picked], random);
}

/**
 * Разбор ответа «цифрами»: 7:35, 7.35, 7,35, 7 35, 735, 19:35, 7:35 pm.
 * Возвращает минуты от полуночи (или null) и был ли указан a.m./p.m.
 */
export function parseTimeInput(text) {
  const raw = String(text).trim().toLowerCase().replace(/\s+/g, ' ');
  const match = /^(\d{1,2})(?:[:., ]?(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?$/.exec(raw);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2] === undefined ? 0 : Number(match[2]);
  const suffix = match[3]?.[0];
  if (minute > 59) return null;
  if (suffix) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (suffix === 'p' ? 12 : 0);
  } else if (hour > 24) return null;
  return { total: (hour % 24) * 60 + minute, hasSuffix: Boolean(suffix) };
}

/**
 * Проверка ответа «Фраза → цифры».
 * Без 24-часового режима часть суток не важна (7:35 = 19:35).
 */
export function checkTimeInput(text, expected, h24 = false) {
  const parsed = parseTimeInput(text);
  if (!parsed) return { valid: false, correct: false };
  if (!h24) return { valid: true, correct: parsed.total % 720 === expected % 720 };
  // В 24-часовом режиме «7:35» без p.m. для 19:35 — ошибка, а «7:35 pm» — верно
  return { valid: true, correct: parsed.total === expected };
}
