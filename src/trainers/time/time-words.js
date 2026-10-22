// Перевод времени в слова: британский английский + русский эквивалент.
// Все функции чистые, время задаётся минутами от полуночи (0…1439).

const EN_UNITS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];

export function enNumber(n) {
  if (n < 20) return EN_UNITS[n];
  const tens = EN_TENS[Math.floor(n / 10)];
  const unit = n % 10;
  return unit ? `${tens}-${EN_UNITS[unit]}` : tens;
}

export function to12h(hour24) {
  const h = hour24 % 12;
  return h === 0 ? 12 : h;
}

export function splitTime(total) {
  const t = ((total % 1440) + 1440) % 1440;
  const hour24 = Math.floor(t / 60);
  const minute = t % 60;
  return { hour24, minute, hour12: to12h(hour24), isPm: hour24 >= 12 };
}

/** Основная британская фраза: «twenty to three», «half past two». */
export function britishPhrase(total) {
  const { minute: m, hour12: h } = splitTime(total);
  const next = to12h(h + 1);

  if (m === 0) return `${enNumber(h)} o'clock`;
  if (m === 15) return `quarter past ${enNumber(h)}`;
  if (m === 30) return `half past ${enNumber(h)}`;
  if (m === 45) return `quarter to ${enNumber(next)}`;

  const past = m < 30;
  const count = past ? m : 60 - m;
  // Для чисел, не кратных пяти, британцы добавляют слово minute(s)
  const minutesWord = count % 5 === 0 ? '' : count === 1 ? ' minute' : ' minutes';
  return past
    ? `${enNumber(count)}${minutesWord} past ${enNumber(h)}`
    : `${enNumber(count)}${minutesWord} to ${enNumber(next)}`;
}

/** «Цифровое» прочтение: «two forty», «five oh five». */
export function digitalPhrase(total) {
  const { minute: m, hour12: h } = splitTime(total);
  if (m === 0) return `${enNumber(h)} o'clock`;
  if (m < 10) return `${enNumber(h)} oh ${enNumber(m)}`;
  return `${enNumber(h)} ${enNumber(m)}`;
}

/** Часть суток по-британски. */
export function dayPart(total) {
  const { hour24, minute } = splitTime(total);
  if (minute === 0 && hour24 === 0) return { en: 'midnight', ru: 'полночь', exact: true };
  if (minute === 0 && hour24 === 12) return { en: 'midday', ru: 'полдень', exact: true };
  if (hour24 < 5) return { en: 'at night', ru: 'ночи', exact: false };
  if (hour24 < 12) return { en: 'in the morning', ru: 'утра', exact: false };
  if (hour24 < 17) return { en: 'in the afternoon', ru: 'дня', exact: false };
  if (hour24 < 21) return { en: 'in the evening', ru: 'вечера', exact: false };
  return { en: 'at night', ru: 'вечера', exact: false };
}

export function digitalLabel(total) {
  const { hour24, minute, hour12, isPm } = splitTime(total);
  const mm = String(minute).padStart(2, '0');
  return {
    h12: `${hour12}:${mm}`,
    suffix: isPm ? 'p.m.' : 'a.m.',
    h24: `${String(hour24).padStart(2, '0')}:${mm}`,
  };
}

// ---------- Русский ----------

const RU_FEM = [
  '', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
  'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
  'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать',
];
const RU_GEN = [
  '', 'одной', 'двух', 'трёх', 'четырёх', 'пяти', 'шести', 'семи', 'восьми', 'девяти',
  'десяти', 'одиннадцати', 'двенадцати', 'тринадцати', 'четырнадцати', 'пятнадцати',
  'шестнадцати', 'семнадцати', 'восемнадцати', 'девятнадцати',
];
const RU_HOUR = [
  '', 'час', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
  'десять', 'одиннадцать', 'двенадцать',
];
const RU_ORD_GEN = [
  '', 'первого', 'второго', 'третьего', 'четвёртого', 'пятого', 'шестого', 'седьмого',
  'восьмого', 'девятого', 'десятого', 'одиннадцатого', 'двенадцатого',
];

function ruFem(n) {
  if (n < 20) return RU_FEM[n];
  const unit = n % 10;
  return unit ? `двадцать ${RU_FEM[unit]}` : 'двадцать';
}

function ruGen(n) {
  if (n < 20) return RU_GEN[n];
  const unit = n % 10;
  return unit ? `двадцати ${RU_GEN[unit]}` : 'двадцати';
}

export function ruPlural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** Как это время сказали бы по-русски: «без двадцати три», «двадцать минут шестого». */
export function russianPhrase(total) {
  const { minute: m, hour12: h } = splitTime(total);
  const next = to12h(h + 1);

  if (m === 0) {
    return h === 1 ? 'ровно час' : `ровно ${RU_HOUR[h]} ${ruPlural(h, 'час', 'часа', 'часов')}`;
  }
  if (m === 15) return `четверть ${RU_ORD_GEN[next]}`;
  if (m === 30) return `половина ${RU_ORD_GEN[next]}`;
  if (m === 45) return `без четверти ${RU_HOUR[next]}`;

  if (m < 30) {
    return `${ruFem(m)} ${ruPlural(m, 'минута', 'минуты', 'минут')} ${RU_ORD_GEN[next]}`;
  }
  const left = 60 - m;
  const minutesWord = left % 5 === 0 ? '' : ` ${left === 1 ? 'минуты' : 'минут'}`;
  return `без ${ruGen(left)}${minutesWord} ${RU_HOUR[next]}`;
}

/** Короткое объяснение логики для текущего времени. */
export function explain(total) {
  const { minute: m, hour12: h } = splitTime(total);
  const next = to12h(h + 1);
  // «прошла 21 минута», «прошло 20 минут», «осталась 1 минута»
  const minutes = (n) => `${n} ${ruPlural(n, 'минута', 'минуты', 'минут')}`;
  const passed = (n) => `${ruPlural(n, 'прошла', 'прошло', 'прошло')} ${minutes(n)}`;
  const left = (n) => `${ruPlural(n, 'осталась', 'осталось', 'осталось')} ${minutes(n)}`;

  if (m === 0) return { side: 'exact', text: `Стрелка на 12: ровно ${h} — говорим o'clock` };
  if (m === 15) return { side: 'past', text: `Четверть часа (quarter) после ${h} — past` };
  if (m === 30) return { side: 'past', text: `Половина часа (half) после ${h} — past` };
  if (m === 45) return { side: 'to', text: `До ${next} осталась четверть часа (quarter) — to` };
  if (m < 30) return { side: 'past', text: `Стрелка справа: после ${h} ${passed(m)} — past` };
  return { side: 'to', text: `Стрелка слева: до ${next} ${left(60 - m)} — to` };
}

/** Строка для озвучки: «twenty to three in the afternoon». */
export function spokenPhrase(total, withDayPart) {
  const part = dayPart(total);
  if (part.exact) return part.en;
  return withDayPart ? `${britishPhrase(total)} ${part.en}` : britishPhrase(total);
}
