import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  answerPhrase,
  checkTimeInput,
  formatDigits,
  parseTimeInput,
  phraseOptions,
  randomTime,
} from '../src/trainers/time-quiz/quiz.js';
import { QUESTIONS } from '../src/trainers/time-quiz/questions.js';

const t = (h, m) => h * 60 + m;

test('formatDigits', () => {
  assert.equal(formatDigits(t(17, 10)), '5:10');
  assert.equal(formatDigits(t(17, 10), true), '17:10');
  assert.equal(formatDigits(t(0, 5), true), '00:05');
  assert.equal(formatDigits(t(0, 5)), '12:05');
});

test('answerPhrase with day part', () => {
  assert.equal(answerPhrase(t(17, 10)), 'ten past five');
  assert.equal(answerPhrase(t(17, 10), true), 'ten past five in the evening');
  assert.equal(answerPhrase(t(12, 0), true), 'midday');
});

test('parseTimeInput', () => {
  assert.equal(parseTimeInput('7:35').total, t(7, 35));
  assert.equal(parseTimeInput('7.35').total, t(7, 35));
  assert.equal(parseTimeInput('7,35').total, t(7, 35));
  assert.equal(parseTimeInput('735').total, t(7, 35));
  assert.equal(parseTimeInput('1935').total, t(19, 35));
  assert.equal(parseTimeInput('7:35 pm').total, t(19, 35));
  assert.equal(parseTimeInput('7:35 p.m.').total, t(19, 35));
  assert.equal(parseTimeInput('12:00 am').total, 0);
  assert.equal(parseTimeInput('12 pm').total, t(12, 0));
  assert.equal(parseTimeInput('24:00').total, 0);
  assert.equal(parseTimeInput('7:75'), null);
  assert.equal(parseTimeInput('abc'), null);
  assert.equal(parseTimeInput('13 pm'), null);
});

test('checkTimeInput', () => {
  assert.deepEqual(checkTimeInput('7:35', t(19, 35)), { valid: true, correct: true });
  assert.deepEqual(checkTimeInput('19:35', t(19, 35), true), { valid: true, correct: true });
  assert.deepEqual(checkTimeInput('7:35 pm', t(19, 35), true), { valid: true, correct: true });
  assert.deepEqual(checkTimeInput('7:35', t(19, 35), true), { valid: true, correct: false });
  assert.deepEqual(checkTimeInput('7:40', t(19, 35)), { valid: true, correct: false });
  assert.equal(checkTimeInput('', t(19, 35)).valid, false);
});

test('phraseOptions: unique, contains correct, sensible size', () => {
  for (let total = 0; total < 1440; total++) {
    for (const h24 of [false, true]) {
      const options = phraseOptions(total, { h24 });
      const correct = answerPhrase(total, h24);
      assert.equal(new Set(options).size, options.length, `duplicates at ${total}`);
      assert.ok(options.includes(correct), `missing correct at ${total}`);
      assert.ok(options.length >= 3, `too few options at ${total}`);
    }
  }
});

test('phraseOptions includes the classic "to" hour mistake', () => {
  const options = phraseOptions(t(14, 40), { count: 10 });
  assert.ok(options.includes('twenty to two'));
  assert.ok(options.includes('twenty past two'));
});

test('randomTime respects step and previous', () => {
  for (let i = 0; i < 200; i++) {
    const v = randomTime({ previous: 100 });
    assert.ok(v % 5 === 0 && v !== 100 && v >= 0 && v < 1440);
  }
});

test('question bank is well-formed', () => {
  assert.ok(QUESTIONS.length >= 18);
  for (const q of QUESTIONS) {
    assert.ok(q.task && q.explain && q.options.length >= 2);
    assert.equal(new Set(q.options).size, q.options.length);
  }
});
