import { initPage } from '../../app.js';
import { icons } from '../../icons.js';
import { Clock } from '../time/clock.js';
import { canSpeak, speak } from '../time/speech.js';
import { explain } from '../time/time-words.js';
import { QUESTIONS } from './questions.js';
import {
  answerDigital,
  answerPhrase,
  checkTimeInput,
  formatDigits,
  phraseOptions,
  randomTime,
  shuffle,
} from './quiz.js';

initPage('time-quiz');

// ---------- Хранилище (счёт и настройки переживают перезагрузку) ----------

const storage = {
  get(key, fallback) {
    try {
      return { ...fallback, ...JSON.parse(localStorage.getItem(key) ?? '{}') };
    } catch {
      return { ...fallback };
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // приватный режим — работаем без сохранения
    }
  },
};

const STATS_KEY = 'time-quiz:stats';
const SETTINGS_KEY = 'time-quiz:settings';

const stats = storage.get(STATS_KEY, { correct: 0, total: 0, streak: 0 });
const settings = storage.get(SETTINGS_KEY, {
  mode: 'say',
  anyMinutes: false,
  h24: false,
  showClock: true,
});

const $ = (id) => document.getElementById(id);
const quizEl = $('quiz');
const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function renderStats() {
  $('stat-correct').textContent = stats.correct;
  $('stat-total').textContent = stats.total;
  $('stat-streak').textContent = stats.streak;
}

function record(correct) {
  stats.total += 1;
  if (correct) {
    stats.correct += 1;
    stats.streak += 1;
  } else {
    stats.streak = 0;
  }
  storage.set(STATS_KEY, stats);
  renderStats();
  const tile = document.querySelector('.stat--streak');
  tile.classList.remove('is-bump');
  if (correct) requestAnimationFrame(() => tile.classList.add('is-bump'));
}

$('stats-reset').addEventListener('click', () => {
  if (!confirm('Сбросить счёт?')) return;
  Object.assign(stats, { correct: 0, total: 0, streak: 0 });
  storage.set(STATS_KEY, stats);
  renderStats();
});

// ---------- Общие кусочки разметки ----------

const speakBtn = (text) =>
  canSpeak()
    ? `<button class="speak-btn speak-btn--small" type="button" data-speak="${escapeHtml(text)}" aria-label="Послушать">${icons.sound}</button>`
    : '';

const nextBtn = () =>
  `<button class="btn btn--primary btn--wide" type="button" data-act="next">Дальше ${icons.arrowRight}</button>`;

function timeVisual(total) {
  return `
    ${settings.showClock ? '<div class="quiz__clock" data-clock></div>' : ''}
    <div class="quiz__digits">${formatDigits(total, settings.h24)}</div>`;
}

let clock = null;
function mountClock(total, hints = false) {
  const el = quizEl.querySelector('[data-clock]');
  clock = el ? new Clock(el, { time: total, interactive: false, hints }) : null;
}

function feedback(ok, title, body) {
  return `
    <div class="feedback feedback--${ok ? 'ok' : 'bad'}">
      <p class="feedback__title">${title}</p>
      ${body}
    </div>`;
}

// ---------- Режимы ----------

let current = null; // состояние текущего задания
let deck = []; // очередь вопросов режима «ошибки»
let deckPos = 0;
let deckScore = 0;

const modes = {
  // 1. Скажи вслух: видишь время, говоришь, открываешь ответ и оцениваешь себя
  say: {
    start() {
      const total = randomTime({ anyMinutes: settings.anyMinutes, previous: current?.total });
      current = { total, revealed: false };
      quizEl.innerHTML = `
        <p class="quiz__task">Скажите время вслух двумя способами, потом откройте ответ и честно оцените себя.</p>
        ${timeVisual(total)}
        <div data-slot>
          <button class="btn btn--primary btn--wide" type="button" data-act="reveal">Показать ответ</button>
        </div>`;
      mountClock(total);
    },
    reveal() {
      const { total } = current;
      current.revealed = true;
      clock?.setHints(true);
      const phrase = answerPhrase(total, settings.h24);
      quizEl.querySelector('[data-slot]').innerHTML = `
        <div class="reveal">
          <div class="reveal__row">
            <span class="reveal__label">Классика</span>
            <span class="reveal__value" lang="en-GB">${phrase}</span>
            ${speakBtn(phrase)}
          </div>
          <div class="reveal__row">
            <span class="reveal__label">Как на табло</span>
            <span class="reveal__value" lang="en-GB">${answerDigital(total, settings.h24)}</span>
            ${speakBtn(answerDigital(total, settings.h24))}
          </div>
          <p class="reveal__hint">${explain(total).text}</p>
        </div>
        <div class="grade">
          <button class="btn btn--bad" type="button" data-grade="0">Были ошибки</button>
          <button class="btn btn--good" type="button" data-grade="1">Всё верно</button>
        </div>`;
    },
  },

  // 2. Выбери фразу: видишь время, выбираешь из вариантов
  choose: {
    start() {
      const total = randomTime({ anyMinutes: settings.anyMinutes, previous: current?.total });
      const options = phraseOptions(total, { h24: settings.h24 });
      current = { total, answer: answerPhrase(total, settings.h24), answered: false };
      quizEl.innerHTML = `
        <p class="quiz__task">Выберите правильную фразу</p>
        ${timeVisual(total)}
        <div class="choices">
          ${options.map((o) => `<button class="choice" type="button" lang="en-GB" data-choice="${escapeHtml(o)}">${o}</button>`).join('')}
        </div>
        <div data-slot></div>`;
      mountClock(total);
    },
    answer(choice) {
      const { total, answer } = current;
      const ok = choice === answer;
      current.answered = true;
      record(ok);
      clock?.setHints(true);
      markChoices(choice, answer);
      quizEl.querySelector('[data-slot]').innerHTML = `
        ${feedback(
          ok,
          ok ? 'Верно!' : 'Не совсем',
          `<p class="feedback__phrase" lang="en-GB">${answer} ${speakBtn(answer)}</p>
           <p class="feedback__text">${explain(total).text}</p>`,
        )}
        ${nextBtn()}`;
    },
  },

  // 3. Фраза → цифры: слышишь/читаешь фразу, пишешь время цифрами
  digits: {
    start() {
      const total = randomTime({ anyMinutes: settings.anyMinutes, previous: current?.total });
      const phrase = answerPhrase(total, settings.h24);
      current = { total, answered: false };
      quizEl.innerHTML = `
        <p class="quiz__task">Запишите время цифрами</p>
        <div class="quiz__phrase">
          <span lang="en-GB">${phrase}</span>
          ${speakBtn(phrase)}
        </div>
        <form class="answer-form" data-form novalidate>
          <input class="answer-form__input" type="text" inputmode="decimal" autocomplete="off"
            placeholder="${settings.h24 ? '19:35' : '7:35'}" aria-label="Время цифрами" data-input />
          <button class="btn btn--primary" type="submit">Проверить</button>
        </form>
        <p class="quiz__hint" data-hint>${settings.h24 ? 'Формат 24 часа: 19:35 (или 7:35 pm)' : 'Например: 7:35 или 735'}</p>
        <div data-slot></div>`;
      // На iPhone клавиатура не всплывает без жеста — фокусируем только на десктопе
      if (matchMedia('(hover: hover)').matches) quizEl.querySelector('[data-input]').focus();
    },
    answer(text) {
      const { total } = current;
      const result = checkTimeInput(text, total, settings.h24);
      if (!result.valid) {
        const hint = quizEl.querySelector('[data-hint]');
        hint.textContent = 'Не получилось разобрать ответ. Напишите, например, 7:35';
        hint.classList.add('is-error');
        return;
      }
      current.answered = true;
      record(result.correct);
      const input = quizEl.querySelector('[data-input]');
      input.readOnly = true;
      input.classList.add(result.correct ? 'is-ok' : 'is-bad');
      quizEl.querySelector('[data-form] button').disabled = true;
      quizEl.querySelector('[data-hint]').hidden = true;

      const digits = formatDigits(total, settings.h24);
      const both = settings.h24 ? digits : `${digits} (${formatDigits(total, true)})`;
      quizEl.querySelector('[data-slot]').innerHTML = `
        ${feedback(
          result.correct,
          result.correct ? `Верно! ${digits}` : `Правильно: ${both}`,
          `<p class="feedback__text">${explain(total).text}</p>
           ${settings.showClock ? '<div class="quiz__clock quiz__clock--small" data-clock></div>' : ''}`,
        )}
        ${nextBtn()}`;
      mountClock(total, true);
    },
  },

  // 4. a.m./p.m., предлоги и типичные ошибки — фиксированный набор вопросов
  mistakes: {
    start() {
      if (deckPos >= deck.length) {
        deck = shuffle(QUESTIONS.map((_, i) => i));
        deckPos = 0;
        deckScore = 0;
      }
      const q = QUESTIONS[deck[deckPos]];
      current = { q, answer: q.options[0], answered: false };
      quizEl.innerHTML = `
        <p class="quiz__meta">a.m./p.m., предлоги и типичные ошибки · Вопрос ${deckPos + 1} из ${deck.length}</p>
        <p class="quiz__question">${escapeHtml(q.task)}</p>
        <div class="choices">
          ${shuffle(q.options).map((o) => `<button class="choice" type="button" data-choice="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join('')}
        </div>
        <div data-slot></div>`;
    },
    answer(choice) {
      const { q, answer } = current;
      const ok = choice === answer;
      current.answered = true;
      record(ok);
      if (ok) deckScore += 1;
      deckPos += 1;
      markChoices(choice, answer);
      const last = deckPos >= deck.length;
      quizEl.querySelector('[data-slot]').innerHTML = `
        ${feedback(ok, ok ? 'Верно!' : `Правильно: ${escapeHtml(answer)}`, `<p class="feedback__text">${escapeHtml(q.explain)}</p>`)}
        ${last ? `<p class="quiz__summary">Набор пройден: ${deckScore} из ${deck.length}</p>` : ''}
        <button class="btn btn--primary btn--wide" type="button" data-act="next">
          ${last ? 'Пройти заново' : 'Дальше'} ${icons.arrowRight}
        </button>`;
    },
  },
};

function markChoices(choice, answer) {
  for (const btn of quizEl.querySelectorAll('[data-choice]')) {
    btn.disabled = true;
    if (btn.dataset.choice === answer) btn.classList.add('is-correct');
    else if (btn.dataset.choice === choice) btn.classList.add('is-wrong');
  }
}

// ---------- События ----------

quizEl.addEventListener('click', (e) => {
  const target = e.target.closest('button');
  if (!target) return;
  if (target.dataset.speak) return speak(target.dataset.speak);
  if (target.dataset.act === 'reveal') return modes.say.reveal();
  if (target.dataset.act === 'next') return next();
  if (target.dataset.grade) {
    record(target.dataset.grade === '1');
    return next();
  }
  if (target.dataset.choice !== undefined && !current.answered) modes[settings.mode].answer(target.dataset.choice);
});

quizEl.addEventListener('submit', (e) => {
  e.preventDefault();
  if (current.answered) return next();
  modes.digits.answer(quizEl.querySelector('[data-input]').value);
});

quizEl.addEventListener('input', (e) => {
  if (e.target.matches('[data-input]')) quizEl.querySelector('[data-hint]').classList.remove('is-error');
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.target.matches('input, button, summary')) return;
  if (current?.answered) next();
  else if (settings.mode === 'say' && !current.revealed) modes.say.reveal();
});

function next() {
  modes[settings.mode].start();
  const top = quizEl.getBoundingClientRect().top;
  if (top < 0) quizEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- Настройки ----------

function syncControls() {
  for (const btn of document.querySelectorAll('[data-mode]')) {
    btn.setAttribute('aria-checked', String(btn.dataset.mode === settings.mode));
  }
  for (const input of document.querySelectorAll('[data-setting]')) {
    input.checked = settings[input.dataset.setting];
  }
  $('toggles').hidden = settings.mode === 'mistakes';
}

$('modes').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-mode]');
  if (!btn || btn.dataset.mode === settings.mode) return;
  settings.mode = btn.dataset.mode;
  storage.set(SETTINGS_KEY, settings);
  syncControls();
  next();
});

$('toggles').addEventListener('change', (e) => {
  const input = e.target.closest('[data-setting]');
  if (!input) return;
  settings[input.dataset.setting] = input.checked;
  storage.set(SETTINGS_KEY, settings);
  next();
});

if (!modes[settings.mode]) settings.mode = 'say';
renderStats();
syncControls();
modes[settings.mode].start();
