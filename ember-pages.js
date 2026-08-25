const pageCanvas=document.querySelector('#page-embers');
if(pageCanvas){const pageCtx=pageCanvas.getContext('2d');let sparks=[];function sizePageCanvas(){pageCanvas.width=innerWidth*devicePixelRatio;pageCanvas.height=innerHeight*devicePixelRatio;pageCanvas.style.width=`${innerWidth}px`;pageCanvas.style.height=`${innerHeight}px`;pageCtx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);sparks=Array.from({length:Math.min(55,Math.floor(innerWidth/24))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.2+.3,a:Math.random()*.4+.08,s:Math.random()*.22+.05}))}function paint(){pageCtx.clearRect(0,0,innerWidth,innerHeight);sparks.forEach(p=>{pageCtx.fillStyle=`rgba(224,103,43,${p.a})`;pageCtx.beginPath();pageCtx.arc(p.x,p.y,p.r,0,Math.PI*2);pageCtx.fill();p.y-=p.s;if(p.y<0)p.y=innerHeight});requestAnimationFrame(paint)}addEventListener('resize',sizePageCanvas);sizePageCanvas();paint()}
const pageObserver=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('visible',e.isIntersecting)),{threshold:.12});document.querySelectorAll('.reveal').forEach(e=>pageObserver.observe(e));
document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
const extraStyle=document.createElement('link');extraStyle.rel='stylesheet';extraStyle.href='subpages.css';document.head.appendChild(extraStyle);
const brand=document.querySelector('.page-header .brand');if(brand){const menu=document.createElement('button');menu.className='subpage-menu';menu.type='button';menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menu.textContent='☰';brand.after(menu);const nav=document.querySelector('.page-header nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open))})}
const roadEntries=[
  '“You always this pleasant, or did I catch you on a special day?”',
  '“You’re tighter than a dwarf’s coin purse on tax day.”',
  '“I’ve met coffins with more warmth in them.”',
  '“Exactly. Traumatic experience.”',
  '“Not without ale.”',
  '“This horse has a spine like a cheap dagger.”',
  '“Nothing finer in the land than dwarven defenses.”',
  '“Those elves give me the creeps—always starin’ at you like you just farted in a temple.”',
  '“Thanks for the scenic detour and near-death excursion. Been fun.”',
  '“A cheerful little patch of forest. Almost feels rude to spoil it by surviving the night.”',
  '“I might be drunk, but I’m not deaf.”',
  '“That looks older than a witch’s mole.”',
  '“If dwarves built it, you can bet they didn’t want it found.”',
  'Bhalmuck is drinking. Try another round.',
  'Bhalmuck is arguing with the innkeeper. Try again when the shouting stops.',
  'Bhalmuck has gone looking for his horse. This may take a while.',
  'Bhalmuck is correcting the bard’s version of events.',
  'Bhalmuck has fallen asleep beneath the table. Allegedly.',
  'Bhalmuck refuses to continue until someone buys the next round.'
];
const roadInterruptions=new Set(roadEntries.filter(entry=>!entry.startsWith('“')));
const shuffleRoad=entries=>{const bag=[...entries];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}return bag};
let roadBag=[];const roadQuote=document.querySelector('#road-quote');const roadButton=document.querySelector('#another-road-round');const roadCredit=document.querySelector('.road-wisdom small');
if(roadButton){roadBag=shuffleRoad(roadEntries.filter(entry=>entry!==roadQuote.textContent));roadButton.addEventListener('click',()=>{if(!roadBag.length)roadBag=shuffleRoad(roadEntries.filter(entry=>entry!==roadQuote.textContent));const entry=roadBag.pop();const interrupted=roadInterruptions.has(entry);roadQuote.classList.remove('quote-change','road-interruption');void roadQuote.offsetWidth;roadQuote.textContent=entry;roadQuote.classList.toggle('road-interruption',interrupted);roadQuote.classList.add('quote-change');if(roadCredit)roadCredit.hidden=interrupted})}
const completion=document.querySelector('#adventure-completion');if(completion){try{const save=JSON.parse(localStorage.getItem('embervoid-ruins-save-v2'));if(save?.ended){const lines={memoryEnd:'Not the worst choice a human ever made.',flameEnd:'Now you’ve touched something you don’t understand.',goldEnd:'Finally, an explorer with sensible priorities.',darkEnd:'Empty-handed is still better than dead.',defeat:'I told you the statue was built to keep fools out.'};completion.hidden=false;completion.innerHTML=`<strong>Bhalmuck disputes your account.</strong>“${lines[save.scene]||'Aye, I heard what happened. That is not how I remember it.'}”`;}}catch{}}
const currentPage=(location.pathname.split('/').pop()||'index.html').replace('.html','');const depthByPage={book:1,world:2,calendar:3,gods:3,origins:3,archive:4,road:4,adventures:5,adventure:5,about:2};const depth=depthByPage[currentPage]||1;document.body.dataset.depth=depth;document.body.dataset.page=currentPage;document.documentElement.style.setProperty('--void-depth',depth);
if(currentPage==='book'){const monument=document.querySelector('.quote-monument');const quote=monument?.querySelector('blockquote');const credit=monument?.querySelector('small');if(quote)quote.textContent='“What he had buried would not stay buried.”';if(credit)credit.textContent='— From the Prologue';}
let remembered=[];try{remembered=JSON.parse(localStorage.getItem('embervoid-pages')||'[]')}catch{}const visited=new Set(remembered);visited.add(currentPage);localStorage.setItem('embervoid-pages',JSON.stringify([...visited]));
const presence=document.createElement('div');presence.className='void-presence';presence.setAttribute('aria-hidden','true');presence.innerHTML='<div class="void-glyphs">⟡ ᚷ ⋮ ᛉ ◇\n  ᛏ ⟟ ⟁ ᚾ ⋮\n◇ ᚱ ⟡ ᛃ ⟁</div><div class="void-shockwave"></div>';document.body.prepend(presence);
const whispers=['The path remembers you.','Some doors open inward.','You have seen this mark before.','The silence is not empty.','It has moved closer.'];const whisper=document.createElement('p');whisper.className='void-whisper';whisper.textContent=whispers[Math.min(whispers.length-1,Math.max(depth-1,visited.size-2))];document.body.appendChild(whisper);setTimeout(()=>whisper.classList.add('heard'),1800);setTimeout(()=>whisper.classList.remove('heard'),7800);
if(currentPage==='road'){const wisdom=document.querySelector('.road-wisdom');if(wisdom){const tankard=document.createElement('div');tankard.className='road-tankard';tankard.setAttribute('aria-hidden','true');wisdom.prepend(tankard)}}
if(currentPage==='world'){
  const mapSection=document.createElement('section');mapSection.className='world-map-section';mapSection.innerHTML='<div class="world-map-intro reveal"><p class="section-eyebrow">Charted lands and disputed borders</p><h2>The Known Lands of Gursol</h2><p>Four kingdoms surround the Neutral Port. Between them lie old borders, conquered lands, mountain roads, and ruins that refuse to disappear.</p><p class="map-credit">Concept artwork created with generative AI.</p></div><button class="world-map-frame reveal" type="button" aria-label="Expand the Gursol concept map"><img src="assets/maps/gursol-concept-map.png" alt="Concept map of Gursol showing Ashlar, Rainwynn, Azgoth, Kentmore, the Eastern Reach, Old Vareth, Drakmorn, the Iron River, and the central neutral port"><span>Open full map</span></button><dialog class="map-dialog" aria-label="Expanded map of Gursol"><button class="map-close" type="button">Close map</button><img src="assets/maps/gursol-concept-map.png" alt="Expanded concept map of Gursol"></dialog>';
  document.querySelector('.page-hero').after(mapSection);pageObserver.observe(mapSection.querySelector('.world-map-intro'));pageObserver.observe(mapSection.querySelector('.world-map-frame'));
  const frame=mapSection.querySelector('.world-map-frame');const dialog=mapSection.querySelector('.map-dialog');frame.addEventListener('click',()=>dialog.showModal());mapSection.querySelector('.map-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
}
