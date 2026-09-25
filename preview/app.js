import { problems } from './questions.js';
const app = document.querySelector('#app');
const key = 'reckoningPreviewV1';
let progress = {xp:0, completed:false, sessions:0};
let storageAvailable = true;
try { const saved = JSON.parse(localStorage.getItem(key) || 'null'); if(saved && typeof saved.xp === 'number') progress = {...progress,...saved}; } catch {storageAvailable=false;}
let state;
const icon = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const icons = [icon('<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>'),icon('<path d="m13 2-9 12h7l-1 8 10-13h-8z"/>'),icon('<path d="M8 3h8v7a4 4 0 0 1-8 0zM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v6m-4 1h8"/>'),icon('<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>')];
const brand = '<img src="assets/brand.png" alt="Reckoning Figures lightning logo"><span>Reckoning<br>Figures</span>';
function home(){
 app.innerHTML=`<div class="shell page"><aside class="sidebar"><a class="brand" href="#">${brand}</a><nav class="nav" aria-label="Main navigation"><a class="active" href="#" aria-current="page">${icons[0]}Learn</a><a href="../daily-challenge.html">${icons[1]}Practice</a><a href="../leaderboard.html">${icons[2]}Leaderboard</a><a href="../profile.html">${icons[3]}Profile</a></nav><div class="foot">A little practice.<br>A lot more confidence.<br><a href="../main-menu-modules.html">Original app ↗</a></div></aside><main class="main"><div class="brand mobile-brand">${brand}</div><header class="topline"><span class="eyebrow muted">Your algebra journey</span><div class="topstats"><span class="pill gold">ϟ ${progress.xp} XP</span><span class="pill">Algebra 1</span></div></header><h1 class="heading">Big confidence.<br>One figure at a time.</h1><p class="muted">Make a little progress today. You’ve got this.</p><div class="columns"><section><article class="hero"><span class="eyebrow" style="color:var(--blue)">Your next small win</span><h2>Everything starts<br>with an unknown.</h2><p>Find your footing with one-step equations.</p><img src="assets/brand.png" alt=""><button class="primary" id="start">${progress.completed?'Practice again':'Let’s solve it'} <span aria-hidden="true">→</span></button></article><div class="section-title"><h2>Your learning path</h2><span>7 modules</span></div><div id="units"></div></section><aside class="aside"><section class="sidecard"><h3>Build your momentum</h3><p>Start with one lesson. Every step counts.</p><div class="ring" style="--angle:${progress.completed?360:0}deg"><div><strong>${progress.completed?1:0} / 1</strong><small>preview lesson</small></div></div><p>${progress.completed?'First figure complete. Keep that energy going.':'Your first win is waiting for you.'}</p></section><section class="sidecard"><span class="eyebrow gold">Made for learning</span><h3 style="margin-top:12px">Room to figure it out.</h3><p>Take your time. Try again. Mistakes are part of getting better.</p><a class="small-link" href="../main-menu-modules.html">Explore the original course →</a></section></aside></div><p class="notice">Design preview · Figure 001 uses your original questions. Other course links open the current app. Preview progress stays separate.</p></main></div>`;
 const names=['Linear Equations','Linear Inequalities','Systems of Equations','Quadratic Equations','Polynomials','Exponents & Radicals','Functions'];
 document.querySelector('#units').innerHTML=names.map((name,i)=>`<a class="unit" href="../module-${i+1}-simple.html"><span class="unit-number">${String(i+1).padStart(2,'0')}</span><div><h3>${name}</h3><p>${i===0?'Build a strong foundation':'Explore this module in the current app'}</p></div><span class="arrow" aria-hidden="true">↗</span></a>`).join('');
 document.querySelector('#start').onclick=start;
}
function start(){state={index:0,selected:null,checked:false,attempts:0,errors:0,started:Date.now(),claimed:false};question();}
function question(){
 const p=problems[state.index]; state.selected=null;state.checked=false;
 app.innerHTML=`<main class="lesson"><header class="lesson-header"><button class="icon-btn" id="exit" aria-label="Exit lesson">×</button><div class="track" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="${problems.length}" aria-valuenow="${state.index}"><div class="fill" style="width:${state.index/problems.length*100}%"></div></div><span class="count">${state.index+1} / ${problems.length}</span></header><section class="question"><span class="eyebrow" style="color:var(--blue)">Figure 001 · One-step equations</span><h1 tabindex="-1">${p.q}</h1><div class="equation">${p.eq}</div><div class="choices"></div></section><footer class="lesson-footer"><div class="feedback" role="status" aria-live="polite">Small steps. Strong foundations.</div><button class="primary" id="check" disabled>Check answer</button></footer></main>`;
 const choices=document.querySelector('.choices');
 if(p.type==='fill-blank'){
  const input=document.createElement('input');input.className='answer';input.type='text';input.inputMode='decimal';input.autocomplete='off';input.setAttribute('aria-label','Your answer');input.placeholder=p.placeholder;choices.append(input);
  input.oninput=()=>{state.selected=input.value.trim();document.querySelector('#check').disabled=!state.selected;};
  input.onkeydown=e=>{if(e.key==='Enter'&&!document.querySelector('#check').disabled){e.preventDefault();check();}};
 }else{
  const values=p.type==='true-false'?['True','False']:p.choices;
  values.forEach((value,i)=>{const b=document.createElement('button');b.className='choice';b.setAttribute('aria-pressed','false');const n=document.createElement('b');n.textContent=i+1;const t=document.createElement('span');t.textContent=value;b.append(n,t);b.onclick=()=>{if(state.checked)return;state.selected=p.type==='true-false'?i===0:i;choices.querySelectorAll('button').forEach(el=>{el.classList.remove('selected','wrong');el.setAttribute('aria-pressed','false');});b.classList.add('selected');b.setAttribute('aria-pressed','true');document.querySelector('#check').disabled=false;};choices.append(b);});
 }
 document.querySelector('#exit').onclick=()=>{if(confirm('Leave this lesson? This attempt will not be saved.'))home();};
 document.querySelector('#check').onclick=check;
 document.querySelector('h1').focus({preventScroll:true});
}
function check(){
 if(state.checked){state.index++;if(state.index===problems.length)finish();else question();return;}
 if(state.selected===null||state.selected==='')return;
 const p=problems[state.index];const correct=p.type==='fill-blank'?Number(state.selected)===Number(p.answer):state.selected===p.answer;
 state.attempts++;
 const feedback=document.querySelector('.feedback');const button=document.querySelector('#check');
 if(correct){state.checked=true;feedback.className='feedback';feedback.innerHTML='<strong>That’s it. Nicely solved!</strong>Keep that momentum going.';document.querySelector('.selected')?.classList.add('correct');document.querySelectorAll('.choice,.answer').forEach(el=>el.disabled=true);button.textContent=state.index===problems.length-1?'Finish lesson':'Continue';const width=(state.index+1)/problems.length*100;document.querySelector('.fill').style.width=width+'%';document.querySelector('[role=progressbar]').setAttribute('aria-valuenow',state.index+1);button.focus();}
 else{state.errors++;feedback.className='feedback error';feedback.innerHTML='<strong>Not quite. Give it another go.</strong>You can take as many tries as you need.';document.querySelector('.selected')?.classList.add('wrong');state.selected=null;button.disabled=true;const input=document.querySelector('.answer');if(input){input.value='';input.focus();}}
}
function finish(){
 state.earned=problems.length*10+(state.errors===0?50:0);
 const seconds=Math.max(1,Math.round((Date.now()-state.started)/1000));
 app.innerHTML=`<main class="finish"><img src="assets/brand.png" alt=""><h1 tabindex="-1">Look at you go.</h1><p class="muted">One more figure solved.<br>One step closer to “I’ve got this.”</p><div class="results"><div><strong>+${state.earned}</strong><span>XP earned</span></div><div><strong>${Math.round(problems.length/state.attempts*100)}%</strong><span>Accuracy</span></div><div><strong>${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}</strong><span>Time learning</span></div></div><button class="primary" id="claim">Keep the momentum →</button><p class="notice" id="save-status">Continue to save your preview progress on this device.</p></main>`;
 document.querySelector('h1').focus();
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)for(let i=0;i<32;i++){const el=document.createElement('i');el.className='confetti';el.style.left=Math.random()*100+'%';el.style.background=['#ffd15c','#5ed8f3','#9cdeac'][i%3];el.style.animationDelay=Math.random()*.4+'s';document.body.append(el);setTimeout(()=>el.remove(),2400);}
 document.querySelector('#claim').onclick=()=>{
  if(state.claimed)return;state.claimed=true;progress.xp+=state.earned;progress.completed=true;progress.sessions++;
  try{localStorage.setItem(key,JSON.stringify(progress));home();}catch{storageAvailable=false;document.querySelector('#save-status').textContent='Device storage is unavailable. Your progress will last for this visit only.';const b=document.querySelector('#claim');b.textContent='Back to learning';b.onclick=home;}
 };
 if(!storageAvailable)document.querySelector('#save-status').textContent='Device storage may be unavailable. Progress can still be kept for this visit.';
}
home();
