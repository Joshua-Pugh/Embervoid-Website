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
  '“May the gods piss on this cursed valley!”',
  '“I’m blaming the road because it’s as cursed as a goblin’s breath and twice as treacherous!”',
  '“Knew there had to be a man buried under all that misery.”',
  '“After what I just survived, the least you two bastards can do is buy me a drink.”',
  '“Nothin’ like fresh mountain air and a mug of ale to get yer giblets goin’, lads!”',
  '“More for me.”',
  '“You a scholar, Blackwell?”',
  '“Depends which road you take. Take the wrong one and a hundred might be generous.”',
  '“If you two are gonna kill each other, do it somewhere I’m not tryin’ to sleep.”',
  '“That looks older than a witch’s mole.”',
  '“Aye. Quality craftsmanship.”',
  '“Lovely. Can’t wait to be roped into someone else’s mess again.”',
  'Bhalmuck is drinking. Try again.',
  'Bhalmuck has wandered off to find his horse.',
  'This wisdom requires another ale.',
  'Bhalmuck denies ever saying that.',
  'The dwarf is currently unavailable for comment.'
];
const quote = document.querySelector('#bhalmuck-quote');
const quoteCredit = document.querySelector('#quote-credit');
let lastWisdom = wisdom[0];
let firstWisdomBag = true;
let wisdomBag = [];

function isBhalmuckQuote(item) {
  return item.startsWith('“');
}

function refillWisdomBag() {
  wisdomBag = firstWisdomBag ? wisdom.filter(item => item !== lastWisdom) : [...wisdom];
  firstWisdomBag = false;

  for (let index = wisdomBag.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [wisdomBag[index], wisdomBag[randomIndex]] = [wisdomBag[randomIndex], wisdomBag[index]];
  }

  if (wisdomBag[0] === lastWisdom || (!isBhalmuckQuote(lastWisdom) && !isBhalmuckQuote(wisdomBag[0]))) {
    const replacement = wisdomBag.findIndex((item, index) => index > 0 && item !== lastWisdom && isBhalmuckQuote(item));
    if (replacement > 0) [wisdomBag[0], wisdomBag[replacement]] = [wisdomBag[replacement], wisdomBag[0]];
  }

  for (let index = 1; index < wisdomBag.length; index++) {
    if (!isBhalmuckQuote(wisdomBag[index - 1]) && !isBhalmuckQuote(wisdomBag[index])) {
      const replacement = wisdomBag.findIndex((item, laterIndex) => laterIndex > index && isBhalmuckQuote(item));
      if (replacement > index) [wisdomBag[index], wisdomBag[replacement]] = [wisdomBag[replacement], wisdomBag[index]];
    }
  }
}

document.querySelector('#another-round').addEventListener('click', () => {
  if (!wisdomBag.length) refillWisdomBag();
  lastWisdom = wisdomBag.shift();
  quote.classList.remove('quote-change');
  void quote.offsetWidth;
  quote.textContent = lastWisdom;
  quoteCredit.hidden = !isBhalmuckQuote(lastWisdom);
  quote.classList.add('quote-change');
});

const d20 = document.querySelector('#d20');
const rollNumber = document.querySelector('#roll-number');
const investigationResult = document.querySelector('#investigation-result');
const investigationOutcomes = [
  [3, 'Your investigation check has failed spectacularly.'],
  [5, 'Bhalmuck blames the road.'],
  [8, 'Most of the writing has faded.'],
  [11, 'A white piece of fabric moves between the trees.'],
  [14, 'The abandoned camp contains a damaged scroll.'],
  [17, 'You uncover fine stonework beneath the moss.'],
  [20, 'The statue is hiding something.']
];

function rollInvestigation() {
  const roll = Math.floor(Math.random() * 20) + 1;
  const outcome = investigationOutcomes.find(([maximum]) => roll <= maximum)[1];
  d20.classList.remove('rolling');
  void d20.offsetWidth;
  d20.classList.add('rolling');
  rollNumber.textContent = roll;
  investigationResult.textContent = outcome;
}
d20.addEventListener('click', rollInvestigation);
document.querySelector('#roll-investigation').addEventListener('click', rollInvestigation);

addEventListener('resize', resize);
resize();
draw();
