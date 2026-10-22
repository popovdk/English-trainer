// Интерактивный циферблат: стрелки можно тянуть пальцем/мышью или двигать стрелками клавиатуры.
// Время хранится в минутах от полуночи (0…1439).

const NS = 'http://www.w3.org/2000/svg';
const C = 160; // центр
const R = 150; // радиус циферблата

const mod = (n, m) => ((n % m) + m) % m;
// Кратчайшая разница по кругу длиной m: результат в (-m/2, m/2]
const circularDelta = (from, to, m) => {
  const d = mod(to - from, m);
  return d > m / 2 ? d - m : d;
};

const polar = (angleDeg, r) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};

function sectorPath(fromDeg, toDeg, r) {
  if (toDeg - fromDeg <= 0) return '';
  const [x1, y1] = polar(fromDeg, r);
  const [x2, y2] = polar(toDeg, r);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M${C} ${C}L${x1} ${y1}A${r} ${r} 0 ${large} 1 ${x2} ${y2}Z`;
}

function buildSvg() {
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const [x1, y1] = polar(i * 6, R - 6);
    const [x2, y2] = polar(i * 6, R - (major ? 18 : 12));
    ticks.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="clock__tick${major ? ' clock__tick--major' : ''}"/>`,
    );
  }
  const numbers = [];
  for (let h = 1; h <= 12; h++) {
    const [x, y] = polar(h * 30, R - 40);
    numbers.push(
      `<g class="clock__num" data-hour="${h}"><circle cx="${x}" cy="${y}" r="17"/><text x="${x}" y="${y}">${h}</text></g>`,
    );
  }

  return `
  <svg class="clock" viewBox="0 0 320 320" role="group" aria-label="Циферблат">
    <path class="clock__half clock__half--past" d="${sectorPath(0, 180, R)}"/>
    <path class="clock__half clock__half--to" d="${sectorPath(180, 360, R)}"/>
    <path class="clock__sector"/>
    <circle class="clock__rim" cx="${C}" cy="${C}" r="${R}"/>
    <line class="clock__divider" x1="${C}" y1="${C - R}" x2="${C}" y2="${C + R}"/>
    ${ticks.join('')}
    ${numbers.join('')}

    <g class="clock__hand clock__hand--hour" data-hand="hour" tabindex="0" role="slider"
       aria-label="Часовая стрелка" aria-valuemin="1" aria-valuemax="12">
      <line class="clock__hit" x1="${C}" y1="${C}" x2="${C}" y2="${C - 78}"/>
      <line class="clock__stroke" x1="${C}" y1="${C + 12}" x2="${C}" y2="${C - 70}"/>
    </g>
    <g class="clock__hand clock__hand--minute" data-hand="minute" tabindex="0" role="slider"
       aria-label="Минутная стрелка" aria-valuemin="0" aria-valuemax="59">
      <line class="clock__hit" x1="${C}" y1="${C}" x2="${C}" y2="${C - 124}"/>
      <line class="clock__stroke" x1="${C}" y1="${C + 16}" x2="${C}" y2="${C - 108}"/>
      <circle class="clock__knob" cx="${C}" cy="${C - 112}" r="11"/>
    </g>
    <circle class="clock__center" cx="${C}" cy="${C}" r="7"/>
  </svg>`;
}

export class Clock {
  /**
   * @param {HTMLElement} root
   * @param {{ time: number, step?: number, interactive?: boolean, hints?: boolean,
   *   onChange?: (total: number) => void }} options
   * interactive: false — только показ; hints: false — без подсветки past/to и часа (для заданий).
   */
  constructor(root, { time, step = 5, interactive = true, hints = true, onChange = () => {} }) {
    root.innerHTML = buildSvg();
    this.svg = root.querySelector('svg');
    this.hourHand = this.svg.querySelector('.clock__hand--hour');
    this.minuteHand = this.svg.querySelector('.clock__hand--minute');
    this.sector = this.svg.querySelector('.clock__sector');
    this.numbers = [...this.svg.querySelectorAll('.clock__num')];
    this.step = step;
    this.onChange = onChange;

    this.total = mod(time, 1440);
    // «Развёрнутые» минуты для плавного вращения без скачка через 12
    this.target = this.total % 720;
    this.shown = this.target;
    this.raf = 0;

    if (interactive) {
      this.bindPointer();
      this.bindKeyboard();
    } else {
      this.svg.classList.add('clock--static');
      for (const hand of [this.hourHand, this.minuteHand]) {
        hand.removeAttribute('tabindex');
        hand.removeAttribute('role');
      }
    }
    this.setHints(hints);
    this.render();
  }

  /** Показать/скрыть цветовые подсказки (past/to, называемый час). */
  setHints(on) {
    this.svg.classList.toggle('clock--plain', !on);
  }

  get time() {
    return this.total;
  }

  setStep(step) {
    this.step = step;
  }

  /** Установить время. animate — плавно довернуть стрелки. */
  setTime(total, { animate = true } = {}) {
    const next = mod(Math.round(total), 1440);
    this.target += circularDelta(this.total % 720, next % 720, 720);
    this.total = next;
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) this.animate();
    else {
      cancelAnimationFrame(this.raf);
      this.shown = this.target;
      this.render();
    }
    this.onChange(this.total);
  }

  addMinutes(delta) {
    this.setTime(this.total + delta);
  }

  animate() {
    cancelAnimationFrame(this.raf);
    const from = this.shown;
    const to = this.target;
    const duration = Math.min(700, 250 + Math.abs(to - from) * 2);
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      this.shown = from + (to - from) * eased;
      this.render();
      if (p < 1) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  render() {
    const minutes = mod(this.shown, 60);
    const minuteDeg = minutes * 6;
    const hourDeg = mod(this.shown, 720) * 0.5;
    this.minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    this.hourHand.style.transform = `rotate(${hourDeg}deg)`;

    // Подсветка: справа — сколько прошло (past), слева — сколько осталось (to)
    const m = this.total % 60;
    const side = m === 0 ? 'exact' : m <= 30 ? 'past' : 'to';
    const shownMin = Math.round(minutes * 100) / 100;
    this.sector.setAttribute(
      'd',
      side === 'past' ? sectorPath(0, shownMin * 6, R) : side === 'to' ? sectorPath(shownMin * 6, 360, R) : '',
    );
    this.svg.dataset.side = side;

    // Подсвечиваем час, который называется во фразе
    const h12 = Math.floor(this.total / 60) % 12 || 12;
    const spokenHour = side === 'to' ? (h12 % 12) + 1 : h12;
    for (const el of this.numbers) {
      el.classList.toggle('is-active', Number(el.dataset.hour) === spokenHour);
    }

    this.minuteHand.setAttribute('aria-valuenow', String(m));
    this.minuteHand.setAttribute('aria-valuetext', `${m} мин`);
    this.hourHand.setAttribute('aria-valuenow', String(h12));
    this.hourHand.setAttribute('aria-valuetext', `${h12} ч`);
  }

  angleFromEvent(e) {
    const rect = this.svg.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    return mod((Math.atan2(dx, -dy) * 180) / Math.PI, 360);
  }

  dragTo(hand, angle) {
    if (hand === 'minute') {
      const snapped = mod(Math.round(angle / 6 / this.step) * this.step, 60);
      const delta = circularDelta(this.total % 60, snapped, 60);
      if (delta !== 0) this.setTime(this.total + delta, { animate: false });
    } else {
      const m = this.total % 60;
      const hour = mod(Math.round(angle / 30 - m / 60), 12);
      const delta = circularDelta(this.total % 720, hour * 60 + m, 720);
      if (delta !== 0) this.setTime(this.total + delta, { animate: false });
    }
  }

  bindPointer() {
    let hand = null;

    this.svg.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      hand = e.target.closest('[data-hand]')?.dataset.hand ?? 'minute';
      cancelAnimationFrame(this.raf);
      this.shown = this.target;
      this.svg.setPointerCapture(e.pointerId);
      this.svg.classList.add('is-dragging');
      this.dragTo(hand, this.angleFromEvent(e));
      e.preventDefault();
    });

    this.svg.addEventListener('pointermove', (e) => {
      if (hand) this.dragTo(hand, this.angleFromEvent(e));
    });

    const stop = () => {
      hand = null;
      this.svg.classList.remove('is-dragging');
    };
    this.svg.addEventListener('pointerup', stop);
    this.svg.addEventListener('pointercancel', stop);
  }

  bindKeyboard() {
    const handle = (e, unit) => {
      const keys = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      this.addMinutes(keys[e.key] * unit);
    };
    this.minuteHand.addEventListener('keydown', (e) => handle(e, this.step));
    this.hourHand.addEventListener('keydown', (e) => handle(e, 60));
  }
}
