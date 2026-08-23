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
addEventListener('resize', resize);
resize();
draw();
