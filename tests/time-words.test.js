import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  britishPhrase,
  digitalPhrase,
  russianPhrase,
  dayPart,
  explain,
} from '../src/trainers/time/time-words.js';

const t = (h, m) => h * 60 + m;

test('british phrases', () => {
  const cases = [
    [t(14, 40), 'twenty to three'],
    [t(17, 20), 'twenty past five'],
    [t(3, 0), "three o'clock"],
    [t(0, 0), "twelve o'clock"],
    [t(9, 15), 'quarter past nine'],
    [t(9, 30), 'half past nine'],
    [t(9, 45), 'quarter to ten'],
    [t(11, 55), 'five to twelve'],
    [t(12, 50), 'ten to one'],
    [t(4, 1), 'one minute past four'],
    [t(4, 23), 'twenty-three minutes past four'],
    [t(4, 59), 'one minute to five'],
    [t(4, 37), 'twenty-three minutes to five'],
    [t(4, 25), 'twenty-five past four'],
    [t(4, 35), 'twenty-five to five'],
  ];
  for (const [total, expected] of cases) assert.equal(britishPhrase(total), expected);
});

test('digital phrases', () => {
  assert.equal(digitalPhrase(t(14, 40)), 'two forty');
  assert.equal(digitalPhrase(t(5, 5)), 'five oh five');
  assert.equal(digitalPhrase(t(7, 0)), "seven o'clock");
});

test('russian phrases', () => {
  const cases = [
    [t(14, 40), 'без двадцати три'],
    [t(17, 20), 'двадцать минут шестого'],
    [t(12, 55), 'без пяти час'],
    [t(1, 0), 'ровно час'],
    [t(3, 0), 'ровно три часа'],
    [t(5, 0), 'ровно пять часов'],
    [t(2, 30), 'половина третьего'],
    [t(2, 15), 'четверть третьего'],
    [t(2, 45), 'без четверти три'],
    [t(11, 21), 'двадцать одна минута двенадцатого'],
    [t(11, 22), 'двадцать две минуты двенадцатого'],
    [t(11, 59), 'без одной минуты двенадцать'],
    [t(11, 38), 'без двадцати двух минут двенадцать'],
    [t(12, 1), 'одна минута первого'],
  ];
  for (const [total, expected] of cases) assert.equal(russianPhrase(total), expected);
});

test('day parts', () => {
  assert.equal(dayPart(t(0, 0)).en, 'midnight');
  assert.equal(dayPart(t(12, 0)).en, 'midday');
  assert.equal(dayPart(t(9, 10)).en, 'in the morning');
  assert.equal(dayPart(t(14, 40)).en, 'in the afternoon');
  assert.equal(dayPart(t(19, 0)).en, 'in the evening');
  assert.equal(dayPart(t(23, 0)).en, 'at night');
});

test('explanations', () => {
  assert.equal(explain(t(14, 40)).text, 'Стрелка слева: до 3 осталось 20 минут — to');
  assert.equal(explain(t(17, 21)).text, 'Стрелка справа: после 5 прошла 21 минута — past');
  assert.equal(explain(t(17, 22)).text, 'Стрелка справа: после 5 прошло 22 минуты — past');
  assert.equal(explain(t(17, 59)).text, 'Стрелка слева: до 6 осталась 1 минута — to');
});
