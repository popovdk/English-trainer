import { initPage } from '../../app.js';
import { icons } from '../../icons.js';
import { Clock } from './clock.js';
import {
  britishPhrase,
  dayPart,
  digitalLabel,
  digitalPhrase,
  explain,
  russianPhrase,
  splitTime,
  spokenPhrase,
} from './time-words.js';
import { speak, canSpeak } from './speech.js';

initPage('time');

const $ = (id) => document.getElementById(id);
const els = {
  digital: $('digital'),
  digitalMeta: $('digital-meta'),
  phrase: $('phrase'),
  explain: $('explain'),
  full: $('full'),
  digitalWords: $('digital-words'),
  russian: $('russian'),
  speak: $('speak'),
};

const KEYWORDS = {
  past: 'past',
  to: 'to',
  "o'clock": 'exact',
  quarter: 'accent',
  half: 'accent',
};

function highlight(phrase) {
  return phrase
    .split(' ')
    .map((word) => (KEYWORDS[word] ? `<span class="kw kw--${KEYWORDS[word]}">${word}</span>` : word))
    .join(' ');
}

// Время из ссылки (?t=14:40) или текущее, округлённое до 5 минут
function initialTime() {
  const match = /^(\d{1,2}):(\d{2})$/.exec(new URLSearchParams(location.search).get('t') ?? '');
  if (match && +match[1] < 24 && +match[2] < 60) return +match[1] * 60 + +match[2];
  const now = new Date();
  return now.getHours() * 60 + Math.round(now.getMinutes() / 5) * 5;
}

function update(total) {
  const { isPm } = splitTime(total);
  const digital = digitalLabel(total);
  const part = dayPart(total);
  const info = explain(total);

  els.digital.textContent = digital.h12;
  els.digitalMeta.textContent = `${digital.suffix} · ${digital.h24}`;
  els.phrase.innerHTML = highlight(britishPhrase(total));
  els.explain.textContent = info.text;
  els.explain.dataset.side = info.side;
  els.full.textContent = part.exact
    ? `${britishPhrase(total)} = ${part.en}`
    : `${britishPhrase(total)} ${part.en}`;
  els.digitalWords.textContent = `${digitalPhrase(total)} ${isPm ? 'p.m.' : 'a.m.'}`;
  els.russian.textContent = part.exact ? `${russianPhrase(total)} (${part.ru})` : `${russianPhrase(total)} ${part.ru}`;

  setSegment('period', isPm ? 'pm' : 'am');
}

const clock = new Clock($('clock'), { time: initialTime(), step: 5, onChange: update });
update(clock.time);

// ---------- Кнопки ----------

const action = (name) => document.querySelector(`[data-action="${name}"]`);
action('minus').innerHTML = icons.minus;
action('plus').innerHTML = icons.plus;
action('random').innerHTML = `${icons.shuffle}<span>Случайное время</span>`;
action('random').setAttribute('aria-label', 'Случайное время');

const stepLabel = () => {
  action('minus').setAttribute('aria-label', `Назад на ${clock.step} мин`);
  action('plus').setAttribute('aria-label', `Вперёд на ${clock.step} мин`);
};
stepLabel();

action('minus').addEventListener('click', () => clock.addMinutes(-clock.step));
action('plus').addEventListener('click', () => clock.addMinutes(clock.step));
action('random').addEventListener('click', () => {
  const slots = 1440 / clock.step;
  let next;
  do next = Math.floor(Math.random() * slots) * clock.step;
  while (next === clock.time);
  clock.setTime(next);
});

function setSegment(group, value) {
  for (const btn of document.querySelectorAll(`[data-group="${group}"] button`)) {
    btn.setAttribute('aria-checked', String(btn.dataset.value === value));
  }
}

for (const btn of document.querySelectorAll('[data-group="step"] button')) {
  btn.addEventListener('click', () => {
    clock.setStep(Number(btn.dataset.value));
    setSegment('step', btn.dataset.value);
    stepLabel();
  });
}
setSegment('step', '5');

for (const btn of document.querySelectorAll('[data-group="period"] button')) {
  btn.addEventListener('click', () => {
    const wantPm = btn.dataset.value === 'pm';
    if (wantPm !== splitTime(clock.time).isPm) clock.setTime(clock.time + 720, { animate: false });
  });
}

// ---------- Озвучка ----------

if (canSpeak()) {
  els.speak.hidden = false;
  els.speak.innerHTML = icons.sound;
  els.speak.addEventListener('click', () => speak(spokenPhrase(clock.time, false)));
}

// ---------- Примеры ----------

const EXAMPLES = [
  [3, 0], [3, 5], [3, 10], [3, 15], [3, 20], [3, 25], [3, 30],
  [3, 35], [3, 40], [3, 45], [3, 50], [3, 55], [3, 23], [3, 58],
];

$('examples').innerHTML = EXAMPLES.map(([h, m]) => {
  const total = h * 60 + m;
  return `<button type="button" class="example" data-time="${total}">
    <span class="example__time">${h}:${String(m).padStart(2, '0')}</span>
    <span class="example__phrase" lang="en-GB">${highlight(britishPhrase(total))}</span>
  </button>`;
}).join('');

$('examples').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-time]');
  if (!btn) return;
  // Сохраняем выбранную половину суток
  const pm = splitTime(clock.time).isPm ? 720 : 0;
  clock.setTime(Number(btn.dataset.time) + pm);
  $('clock').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
