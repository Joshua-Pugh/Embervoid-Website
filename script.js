const canvas = document.querySelector('#embers');
const ctx = canvas.getContext('2d');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let embers = [];

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  const count = reduceMotion ? 18 : Math.min(70, Math.floor(innerWidth / 20));
  embers = Array.from({length: count}, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.4 + .35,
    speed: Math.random() * .28 + .08,
    drift: (Math.random() - .5) * .18,
    alpha: Math.random() * .55 + .12
  }));
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const ember of embers) {
    const glow = ctx.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, ember.r * 5);
    glow.addColorStop(0, `rgba(255,180,90,${ember.alpha})`);
    glow.addColorStop(.25, `rgba(237,79,35,${ember.alpha * .65})`);
    glow.addColorStop(1, 'rgba(100,20,5,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ember.x, ember.y, ember.r * 5, 0, Math.PI * 2);
    ctx.fill();
    if (!reduceMotion) {
      ember.y -= ember.speed;
      ember.x += ember.drift;
      if (ember.y < -10) { ember.y = innerHeight + 10; ember.x = Math.random() * innerWidth; }
    }
  }
  requestAnimationFrame(draw);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('visible', entry.isIntersecting));
}, {threshold: .15});
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();

const months = [
  ['Frost-Fall', 'Early Winter', 31, 25],
  ['Deep-Snow', 'High Winter', 30, 24],
  ['Waning-Winter', 'Late Winter', 30, 23],
  ['New-Bloom', 'Early Spring', 31, 23],
  ['High-Bloom', 'High Spring', 30, 21],
  ['Green-Wane', 'Late Spring', 30, 21],
  ['Sun-Rise', 'Early Summer', 31, 20],
  ['High-Sun', 'High Summer', 30, 19],
  ['Ember-Wane', 'Late Summer', 30, 18],
  ['Harvest-Rise', 'Early Autumn', 31, 18],
  ['Harvest-Fall', 'High Autumn', 30, 17],
  ['Long-Dusk', 'Late Autumn', 31, 18]
];
let currentMonth = 0;
const monthTrack = document.querySelector('#month-track');

function renderCalendar() {
  const [name, season, days, luna] = months[currentMonth];
  document.querySelector('#calendar-month').textContent = name;
  document.querySelector('#calendar-season').textContent = season;
  document.querySelector('#calendar-days').textContent = days;
  document.querySelector('#calendar-luna').textContent = `${name} ${luna}`;
  monthTrack.replaceChildren(...months.map(([month], index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = month;
    button.className = index === currentMonth ? 'active' : '';
    button.setAttribute('aria-pressed', index === currentMonth);
    button.addEventListener('click', () => { currentMonth = index; renderCalendar(); });
    return button;
  }));
}
document.querySelector('#previous-month').addEventListener('click', () => { currentMonth = (currentMonth + 11) % 12; renderCalendar(); });
document.querySelector('#next-month').addEventListener('click', () => { currentMonth = (currentMonth + 1) % 12; renderCalendar(); });
renderCalendar();

const lantern = document.querySelector('#lantern');
lantern.addEventListener('click', () => {
  const lit = document.querySelector('#last-flame').classList.toggle('lit');
  lantern.setAttribute('aria-pressed', lit);
  lantern.setAttribute('aria-label', lit ? 'Extinguish the Last Flame' : 'Light the Last Flame');
});

const wisdom = [
  '“I’ve met coffins with more warmth in them.”',
  '“Exactly. Traumatic experience.”',
  '“Not without ale.”',
  '“You’re tighter than a dwarf’s coin purse on tax day.”',
  '“Almost feels rude to spoil it by surviving the night.”',
  'Bhalmuck is drinking. Try again.'
];
let wisdomIndex = 0;
const quote = document.querySelector('#bhalmuck-quote');
document.querySelector('#another-round').addEventListener('click', () => {
  wisdomIndex = (wisdomIndex + 1) % wisdom.length;
  quote.classList.remove('quote-change');
  void quote.offsetWidth;
  quote.textContent = wisdom[wisdomIndex];
  quote.classList.add('quote-change');
});

addEventListener('resize', resize);
resize();
draw();
