const SAVE_KEY = 'embervoid-ruins-save-v1';
const characters = {
  delver: {name:'Branna Stonehand', role:'Dwarven Delver', rune:'ᚦ', blurb:'A mason, tunnel-runner, and stubborn judge of stonework.', gift:'Reads dwarven stone and resists traps.', abilities:{Investigation:3,Perception:1,Might:2,Lore:2}},
  sellsword: {name:'Corren Vale', role:'Human Sellsword', rune:'⚔', blurb:'A practical blade who considers a locked door a personal insult.', gift:'Tougher in danger and skilled at forcing obstacles.', abilities:{Investigation:0,Perception:2,Might:3,Lore:0}},
  scholar: {name:'Elowen Marr', role:'Elven Scholar', rune:'ᚱ', blurb:'A patient reader of dead languages and inconvenient warnings.', gift:'Excels at lore, riddles, and careful observation.', abilities:{Investigation:2,Perception:2,Might:0,Lore:3}}
};

let state = {experience:'new',character:null,name:'',health:10,light:5,supplies:3,clues:[],journal:[],scene:'road',pending:null,ended:false};
const $ = selector => document.querySelector(selector);
const welcome = $('#welcome-screen');
const characterScreen = $('#character-screen');
const gameScreen = $('#game-screen');

const scenes = {
  road:{chapter:'I',location:'The Road North',title:'A Rumor in West Gate',text:`<p>The innkeeper’s directions become less convincing with every mile. North of West Gate, the road thins into mud and the forest closes around you.</p><p>He promised ancient dwarven ruins and enough treasure to make the journey worthwhile. He neglected to mention the silence. No birds call beneath these branches.</p>`,choices:[
    ['Follow the old cart ruts','Perception check · DC 9',()=>check('Perception',9,'clearing','lost','You keep to the vanished expedition’s trail.')],
    ['Cut directly through the woods','Might check · DC 10',()=>check('Might',10,'clearing','thorns','You force a path toward higher ground.')]
  ]},
  lost:{chapter:'I',location:'The Northern Wood',title:'The Road Disappears',text:`<p>The trail dissolves beneath wet leaves. You circle the same lightning-scarred oak twice before admitting it.</p><p>Something pale shifts through the distant trees, then vanishes.</p>`,onEnter:()=>damage('light',1,'You lose an hour of daylight.'),choices:[['Follow the pale movement','Trust what you saw',()=>go('clearing')]]},
  thorns:{chapter:'I',location:'The Northern Wood',title:'A Tax Paid in Blood',text:`<p>The direct route is faster. It is also defended by thorns that hook clothing and skin like tiny iron claws.</p><p>Beyond them, the trees open around a patch of worked stone.</p>`,onEnter:()=>damage('health',1,'The thorns draw blood.'),choices:[['Step into the clearing','The forest falls silent',()=>go('clearing')]]},
  clearing:{chapter:'II',location:'The Forgotten Clearing',title:'The Statue Beneath the Moss',text:`<p>A squat dwarven statue stands at the clearing’s center, weather-beaten and strangled by moss. Fallen limbs conceal hints of deliberate stonework beneath your boots.</p><p>The statue’s blank eyes face north. One stone hand rests upon an axe. The other is closed around nothing.</p>`,choices:[
    ['Clear the moss from the ground','Investigation check · DC 12',()=>check('Investigation',12,'stonework','campHint','Search the buried carvings.')],
    ['Examine the statue','Lore check · DC 13',()=>check('Lore',13,'buttons','campHint','Read the dwarven workmanship.')],
    ['Search the edge of the clearing','Perception check · DC 14',()=>check('Perception',14,'camp','campHint','Look for whoever came before you.')]
  ]},
  campHint:{chapter:'II',location:'The Forgotten Clearing',title:'A Flash of White',text:`<p>Your search reveals little—until wind moves a white strip of fabric between the trees. It is too straight and too pale to be bark.</p><p>The statue can wait. Someone camped here once.</p>`,choices:[['Investigate the white fabric','Follow it into the trees',()=>go('camp')],['Spend a supply and search again','Gain advantage on the statue',()=>{if(spend('supplies')){addClue('Charcoal rubbing');go('buttons');}}]]},
  stonework:{chapter:'II',location:'The Forgotten Clearing',title:'A Map Written in Stone',text:`<p>Beneath the moss lies a ring of fine dwarven stonework. Channels carved into it resemble a river splitting around a mountain.</p><p>Near the statue’s feet, shallow sockets wait for something to be pressed.</p>`,onEnter:()=>addClue('Stone river carving'),choices:[['Examine the stone sockets','Study the statue',()=>go('buttons')],['Search beyond the carving','Look for an expedition camp',()=>go('camp')]]},
  buttons:{chapter:'II',location:'The Forgotten Clearing',title:'Words Without a Voice',text:`<p>You scrape mold from the statue’s base. Five stone buttons emerge, each bearing a worn rune: WALK, MOUTH, BED, RUN, SLEEP.</p><p>It is not a sentence. It is an answer waiting for its question.</p>`,onEnter:()=>addClue('Five runic words'),choices:[['Search for the missing question','The old explorers may have found it',()=>go('camp')]]},
  camp:{chapter:'III',location:'The Abandoned Camp',title:'The Last Explorer',text:`<p>The white fabric belongs to a ruined tent, burned along one edge. Rotten crates surround an overturned wagon. A skeleton rests against its wheel as though sleep overtook him there.</p><p>One bony hand is closed tightly against its chest.</p>`,choices:[
    ['Search the skeleton’s hand','Investigation check · DC 11',()=>check('Investigation',11,'scroll','viper','Carefully recover what remains.')],
    ['Search the entire camp','Perception check · DC 12',()=>check('Perception',12,'supplies','viper','Look for anything useful.')]
  ]},
  supplies:{chapter:'III',location:'The Abandoned Camp',title:'What the Dead Left Behind',text:`<p>Beneath a collapsed crate you find a dry torch and a vial whose bitter smell suggests antivenom.</p><p>The skeleton still clutches something against its ribs.</p>`,onEnter:()=>{state.supplies++;state.light++;log('Recovered a torch and old antivenom.');save();},choices:[['Open the skeleton’s hand','Recover the damaged scroll',()=>go('scroll')]]},
  viper:{chapter:'III',location:'The Abandoned Camp',title:'The Grass Moves',text:`<p>You reach between the wagon spokes. A viper strikes from the leaves. Its fangs glance across your wrist before your hand closes around a brittle scroll.</p>`,onEnter:()=>damage('health',2,'A viper bites before escaping.'),choices:[['Read the damaged scroll','Some writing remains',()=>go('scroll')]]},
  scroll:{chapter:'III',location:'The Abandoned Camp',title:'Day One Hundred and Sixty-Five',text:`<p>The explorer’s final account is fragmented by rain and age. He writes of a “runic puzzle of death,” of men claimed by the statue, and of a poisonous bite.</p><p>Only one complete line remains: <em>What always runs but never walks, murmurs but never talks, has a bed but never sleeps, and a mouth but never eats?</em></p>`,onEnter:()=>addClue('The river riddle'),choices:[['Return to the statue','Bring the question to the runes',()=>go('riddle')]]},
  riddle:{chapter:'IV',location:'The Forgotten Clearing',title:'The Runic Answer',text:`<p>The buttons wait beneath the statue. The dead explorer’s question asks for something that runs, murmurs, has a bed and a mouth, yet never walks, talks, sleeps, or eats.</p><p>Press the answer into the stone.</p>`,choices:[
    ['RIVER','Press RUN · BED · MOUTH',()=>go('entrance')],
    ['WIND','Press RUN · MURMUR',()=>wrongRiddle()],
    ['TIME','Press RUN · NEVER SLEEP',()=>wrongRiddle()]
  ]},
  entrance:{chapter:'V',location:'Beneath the Statue',title:'The Mountain Opens',text:`<p>The final rune sinks beneath your thumb. Stone grinds against stone. The statue turns slowly toward the north as a stairway opens beneath its base.</p><p>Cold air rises from below, carrying the smell of iron, river water, and a forge extinguished centuries ago.</p>`,onEnter:()=>{addClue('The statue’s answer: river');log('Opened the hidden dwarven stair.');},choices:[['Light a torch and descend','Spend 1 light',()=>{damage('light',1);go('hall');}]]},
  hall:{chapter:'VI',location:'Hall of Fallen Hammers',title:'A Floor That Remembers',text:`<p>Stone hammers hang above a tiled passage. Some tiles bear the same river pattern carved around the statue; others show broken crowns.</p><p>A skeleton in rusted mail lies halfway across. Its shield is folded inward.</p>`,choices:[
    ['Follow the river-marked tiles','Use the clue from above',()=>state.clues.includes('Stone river carving')?go('gallery'):check('Investigation',13,'gallery','hammer','Find the safe pattern.')],
    ['Jam the hammer mechanism','Might check · DC 14',()=>check('Might',14,'forge','hammer','Force the ancient gears.')]
  ]},
  hammer:{chapter:'VI',location:'Hall of Fallen Hammers',title:'The Hammer Falls',text:`<p>A tile sinks. The ceiling answers.</p><p>You throw yourself forward as a stone hammer obliterates the passage behind you. The way back is sealed, but you are alive.</p>`,onEnter:()=>damage('health',3,'The trap catches your shoulder.'),choices:[['Continue through the cracked wall','No road back',()=>go('gallery')]]},
  gallery:{chapter:'VII',location:'The Flooded Gallery',title:'The River Below',text:`<p>Black water divides the gallery. A narrow bridge has collapsed, leaving only three carved stepping stones.</p><p>RUN. BED. MOUTH. The words from the statue repeat along the walls, but one stone is a false reflection.</p>`,choices:[
    ['Trust the river sequence','Lore check · DC 11',()=>check('Lore',11,'forge','flood','Read the order correctly.')],
    ['Leap across the broken bridge','Might check · DC 13',()=>check('Might',13,'forge','flood','Clear the flooded gap.')]
  ]},
  flood:{chapter:'VII',location:'The Flooded Gallery',title:'The Water Takes Its Price',text:`<p>The stone rolls beneath your boot. Freezing water closes over your head.</p><p>You drag yourself onto the far ledge, but part of your pack disappears into the dark current.</p>`,onEnter:()=>{damage('health',1,'The cold leaves you shaking.');damage('supplies',1,'The river claims a supply.');},choices:[['Enter the forge','Follow the warm draft',()=>go('forge')]]},
  forge:{chapter:'VIII',location:'The Silent Forge',title:'The Keeper Without a Name',text:`<p>An enormous forge dominates the chamber. Its coals are cold, yet one bronze automaton still stands watch beside the vault door.</p><p>“NAME YOUR PURPOSE,” it commands. “PLUNDER, MEMORY, OR FLAME?”</p>`,choices:[
    ['Memory','Return the explorer’s story to the stone',()=>go('memoryEnd')],
    ['Flame','Repair the ancient forge',()=>check('Lore',14,'flameEnd','keeper','Restore rather than take.')],
    ['Plunder','Demand the treasure',()=>check('Might',15,'goldEnd','keeper','Challenge the keeper.')]
  ]},
  keeper:{chapter:'VIII',location:'The Silent Forge',title:'Judgment of Bronze',text:`<p>The keeper’s eyes ignite. Bronze feet shake dust from the floor as it raises a hammer made for hands larger than yours.</p><p>You survive its judgment—but survival has a cost.</p>`,onEnter:()=>damage('health',4,'The keeper’s hammer finds you.'),choices:[['Offer the recovered scroll','Choose memory before it strikes again',()=>state.clues.includes('The river riddle')?go('memoryEnd'):go('darkEnd')]]},
  memoryEnd:{chapter:'IX',location:'The Sealed Vault',title:'What Stone Preserves',text:`<p>The keeper takes the explorer’s scroll with impossible gentleness. Runes kindle across the vault—not names of kings, but names of workers, masons, parents, and children.</p><p>You leave with no crown and no mountain of gold. You leave carrying the names of a people the world had forgotten.</p>`,ending:'THE KEEPER OF NAMES'},
  flameEnd:{chapter:'IX',location:'The Sealed Vault',title:'A Fire Rekindled',text:`<p>Your hands rebuild the broken channel. A single ember awakens beneath the forge. It gives no heat, yet every rune in the chamber gleams like sunrise.</p><p>The keeper gives you a small iron coal. Outside, it will glow whenever forgotten workmanship lies near.</p>`,ending:'THE LAST EMBER'},
  goldEnd:{chapter:'IX',location:'The Sealed Vault',title:'The Dwarf-Gold Bargain',text:`<p>The keeper lowers its hammer. Perhaps strength was the answer—or perhaps the ancient machine has developed a sense of humor.</p><p>It grants you one coin. By dawn it has become twenty. By sunset, all twenty have become worthless river stones.</p>`,ending:'THE VERY TEMPORARY FORTUNE'},
  darkEnd:{chapter:'IX',location:'The Collapsed Passage',title:'Some Doors Stay Closed',text:`<p>The keeper rejects your empty offering. You escape through a collapsing passage with the mountain groaning behind you.</p><p>The statue has returned to its place when you emerge. No seam remains beneath the moss.</p>`,ending:'THE EMPTY-HANDED SURVIVOR'}
};

function renderCharacters(){
  $('#character-grid').replaceChildren(...Object.entries(characters).map(([key,c])=>{
    const b=document.createElement('button');b.type='button';b.className='character-card';
    b.innerHTML=`<span class="rune">${c.rune}</span><strong>${c.role}</strong><h3>${c.name}</h3><p>${c.blurb}</p><small>${c.gift}</small>`;
    b.addEventListener('click',()=>startGame(key));return b;
  }));
}

function startGame(key){
  state.character=key;state.name=$('#character-name').value.trim()||characters[key].name;
  welcome.hidden=true;characterScreen.hidden=true;gameScreen.hidden=false;
  hydrateSheet();go(state.scene,true);
}

function hydrateSheet(){
  const c=characters[state.character];$('#hero-name').textContent=state.name;$('#hero-class').textContent=c.role;$('#portrait-rune').textContent=c.rune;
  $('#abilities').innerHTML=Object.entries(c.abilities).map(([n,v])=>`<div class="ability"><span>${n}</span><b>+${v}</b></div>`).join('');updateStats();
}

function updateStats(){
  $('#health').textContent=Math.max(0,state.health);$('#light').textContent=Math.max(0,state.light);$('#supplies').textContent=Math.max(0,state.supplies);
  $('#clue-list').innerHTML=state.clues.length?state.clues.map(c=>`<li>${c}</li>`).join(''):'<li>None yet</li>';
  $('#journal-entries').innerHTML=state.journal.map(x=>`<li>${x}</li>`).join('');save();
}

function go(id,initial=false){
  state.scene=id;state.pending=null;const s=scenes[id];
  if(!initial&&s.onEnter)s.onEnter();
  $('#chapter-number').textContent=s.chapter;$('#location').textContent=s.location;$('#scene-title').textContent=s.title;$('#story-text').innerHTML=s.text;
  $('#roll-stage').hidden=true;$('#roll-stage').className='roll-stage';
  if(state.experience==='new'&&['road','clearing','hall'].includes(id)){
    $('#tutorial').hidden=false;$('#tutorial').textContent=id==='road'?'When an action is uncertain, you roll a twenty-sided die. Your character adds an ability bonus. Meet or beat the Difficulty Class (DC) to succeed.':id==='clearing'?'Choices reveal different routes. Failure does not end the adventure—it creates consequences and another way forward.':'Clues you discovered earlier can sometimes bypass a roll entirely.';
  }else $('#tutorial').hidden=true;
  renderChoices(s);
  if(s.ending){state.ended=true;log(`Completed the adventure: ${s.ending}.`);renderEnding(s.ending);}
  updateStats();scrollTo({top:0,behavior:'smooth'});
}

function renderChoices(scene){
  const box=$('#choices');box.replaceChildren();
  (scene.choices||[]).forEach(([label,hint,action])=>{const b=document.createElement('button');b.type='button';b.className='choice';b.innerHTML=`<span>${label}</span><small>${hint}</small>`;b.addEventListener('click',action);box.append(b);});
}

function check(ability,dc,success,failure,note){
  const bonus=characters[state.character].abilities[ability];state.pending={ability,dc,success,failure,bonus,note};
  $('#choices').replaceChildren();$('#roll-stage').hidden=false;$('#roll-stage').className='roll-stage';$('#game-roll').textContent='?';
  $('#roll-formula').textContent=`${ability}: d20 + ${bonus} against DC ${dc}`;$('#roll-verdict').textContent='Click the die to roll';
}

$('#game-die').addEventListener('click',()=>{
  if(!state.pending)return;const p=state.pending;state.pending=null;const raw=Math.floor(Math.random()*20)+1,total=raw+p.bonus,success=raw===20||total>=p.dc;
  const die=$('#game-die');die.classList.remove('rolling');void die.offsetWidth;die.classList.add('rolling');$('#game-roll').textContent=raw;
  $('#roll-stage').classList.add(success?'success':'failure');$('#roll-verdict').textContent=success?`Success — ${raw} + ${p.bonus} = ${total}`:`Failure — ${raw} + ${p.bonus} = ${total}`;
  log(`${p.note} Rolled ${raw} + ${p.bonus} (${total}) against DC ${p.dc}: ${success?'success':'failure'}.`);
  setTimeout(()=>go(success?p.success:p.failure),900);
});

function wrongRiddle(){damage('health',1,'A hidden dart answers the wrong rune.');log('Pressed the wrong answer at the statue.');go('riddle');}
function damage(stat,amount,note){state[stat]=Math.max(0,state[stat]-amount);if(note)log(note);updateStats();if(state.health<=0){state.health=1;log('You narrowly avoid becoming part of the ruins.');}}
function spend(stat){if(state[stat]<=0){log(`You have no ${stat} remaining.`);go('camp');return false;}damage(stat,1,`Spent 1 ${stat}.`);return true;}
function addClue(clue){if(!state.clues.includes(clue)){state.clues.push(clue);log(`Recovered clue: ${clue}.`);updateStats();}}
function log(entry){state.journal.push(entry);updateStats();}
function save(){if(state.character)localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
function renderEnding(name){
  const box=$('#choices');box.innerHTML=`<div class="tutorial"><strong>${name}</strong><br>Your journey is complete. Different explorers, clues, and final answers can reveal other endings.</div>`;
  const again=document.createElement('button');again.className='choice';again.innerHTML='<span>Play again</span><small>Choose another explorer</small>';again.onclick=restart;box.append(again);
}
function restart(){localStorage.removeItem(SAVE_KEY);location.reload();}

document.querySelectorAll('[data-experience]').forEach(b=>b.addEventListener('click',()=>{state.experience=b.dataset.experience;welcome.hidden=true;characterScreen.hidden=false;}));
$('#restart').addEventListener('click',()=>{if(confirm('Restart the adventure and erase this saved journey?'))restart();});
const journal=$('#journal');function toggleJournal(open){journal.classList.toggle('open',open);journal.setAttribute('aria-hidden',!open);$('#journal-toggle').setAttribute('aria-expanded',open);}
$('#journal-toggle').addEventListener('click',()=>toggleJournal(true));$('#journal-close').addEventListener('click',()=>toggleJournal(false));

const saved=localStorage.getItem(SAVE_KEY);if(saved){$('#continue-save').hidden=false;$('#continue-save').addEventListener('click',()=>{try{state=JSON.parse(saved);welcome.hidden=true;gameScreen.hidden=false;hydrateSheet();go(state.scene,true);}catch{restart();}});}
renderCharacters();
