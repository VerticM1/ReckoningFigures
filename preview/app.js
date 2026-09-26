import { coaching, mountCoaching, revealHint } from './coaching.js';
import { pathArt } from './path-art.js';
import { course } from './course.js';
import { renderSpecial, graphMatches, answerMatches } from './lesson-types.js';
let activeModule=0,activeLesson=course[0].lessons[0],problems=activeLesson.questions;
import { animateEntrance, answerMotion, selectMotion, transitionQuestion } from './motion.js';
import { dateKey, markDay, streak, weekDays } from './activity.js';
const app = document.querySelector('#app');
const key = 'reckoningPreviewV1';
let progress = {xp:0, completed:false, sessions:0};
let storageAvailable = true;
try { const saved = JSON.parse(localStorage.getItem(key) || 'null'); if(saved && typeof saved.xp === 'number') progress = {...progress,...saved}; } catch {storageAvailable=false;}
progress.completedLessons=Array.isArray(progress.completedLessons)?progress.completedLessons:(progress.completed?[1]:[]);
activeModule=Math.max(0,Math.min(6,Number(progress.selectedModule)||0));
progress.visits = Array.isArray(progress.visits)?progress.visits:[];
progress.practiceDays = Array.isArray(progress.practiceDays)?progress.practiceDays:[];
function persistActivity(){
 try{localStorage.setItem(key,JSON.stringify(progress));storageAvailable=true;}catch{storageAvailable=false;}
}
function recordVisit(){progress.visits=markDay(progress.visits);persistActivity();}
recordVisit();
// Returning to the tab after midnight records the new local day as well.
function refreshDay(){const changed=!progress.visits.includes(dateKey());recordVisit();if(changed&&document.querySelector('.shell'))home();}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay();});
window.addEventListener('focus',refreshDay);
function calendarCard(){
 const practice=streak(progress.practiceDays),visits=streak(progress.visits),today=dateKey();
 return `<section class="sidecard activity-card"><div class="activity-heading"><span class="eyebrow gold">Show up. Power up.</span><span aria-hidden="true">ϟ</span></div><div class="streak-number">${practice.current}<span>day practice streak</span></div><p>${progress.practiceDays.includes(today)?'Today is in the books. Nicely done!':practice.current?'Keep it going with a lesson today.':'One lesson today starts your streak.'}</p><div class="week" aria-label="Activity this week">${weekDays().map(day=>{const done=progress.practiceDays.includes(day.key),visited=progress.visits.includes(day.key);return `<div class="day ${done?'practiced':visited?'visited':''} ${day.key===today?'today':''}" aria-label="${day.name}: ${done?'lesson completed':visited?'visited':'no activity'}${day.key===today?', today':''}"><span>${day.label}</span><b aria-hidden="true">${done?'✓':visited?'•':'–'}</b></div>`;}).join('')}</div><div class="calendar-legend"><span>● Visited</span><span>✓ Practiced</span></div><div class="activity-totals"><div><strong>${progress.visits.length}</strong><span>days visited</span></div><div><strong>${visits.current}</strong><span>visit streak</span></div><div><strong>${practice.best}</strong><span>best practice</span></div></div><p class="activity-note">${storageAvailable?'Activity starts with this preview and is saved on this device.':'Device storage is unavailable. Activity lasts for this visit only.'}</p></section>`;
}
let state;
const icon = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const icons = [icon('<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>'),icon('<path d="m13 2-9 12h7l-1 8 10-13h-8z"/>'),icon('<path d="M8 3h8v7a4 4 0 0 1-8 0zM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v6m-4 1h8"/>'),icon('<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>')];
const brand = '<img src="assets/brand-transparent.png" alt="Reckoning Figures lightning logo"><span>Reckoning<br>Figures</span>';
function home(){
 const module=course[activeModule],lessons=module.lessons,figures=lessons.map(l=>l.title);
 const offsets=[0,-70,-105,-70,0,70,105,70,0,-70,-105,-70];
 const pending=lessons.findIndex(l=>l.available&&!progress.completedLessons.includes(l.id));
 const current=pending<0?lessons.findIndex(l=>l.available):pending;
 const completedCount=lessons.filter(l=>progress.completedLessons.includes(l.id)).length;
 const symbols=['x','2x','÷','½','−','⇄','✦','0.5','a','?','?','★'];
 const nodes=figures.map((title,i)=>`<li class="path-step ${i===current?'next-step':''} ${progress.completedLessons.includes(lessons[i].id)?'done-step':''}" style="--shift:${offsets[i]}px"><button class="path-node" data-figure="${i}" ${i===current?'aria-current="step"':''} aria-label="Figure ${lessons[i].id}: ${title}${progress.completedLessons.includes(lessons[i].id)?', completed':i===current?', next lesson':''}">${!lessons[i].available?'…':progress.completedLessons.includes(lessons[i].id)?'✓':symbols[i]}</button>${i===current?'<span class="start-pointer">'+(completedCount?'UP NEXT':'START HERE')+'</span>':''}<span class="path-caption">${title}</span>${i===current?`<div class="node-preview"><span class="eyebrow">Figure ${String(lessons[i].id).padStart(3,'0')}</span><strong>${title}</strong><span>${lessons[i].premium?'Premium lesson':'Ready for your next challenge?'}</span><button class="primary" id="start">${progress.completedLessons.includes(lessons[i].id)?'Practice again':'Let’s solve it'} →</button></div>`:''}${pathArt(i)}</li>`).join('');
 const points=offsets.slice(0,lessons.length).map((x,i)=>[210+x,65+i*180]);
 const path=points.map(([x,y],i)=>i?`C ${points[i-1][0]} ${y-110}, ${x} ${y-70}, ${x} ${y}`:`M ${x} ${y}`).join(' ');
 app.innerHTML=`<div class="shell page learn-shell"><aside class="sidebar"><a class="brand" href="#">${brand}</a><nav class="nav" aria-label="Main navigation"><a class="active" href="#" aria-current="page">${icons[0]}Learn</a><a href="../daily-challenge.html">${icons[1]}Practice</a><a href="../leaderboard.html">${icons[2]}Leaderboard</a><a href="../profile.html">${icons[3]}Profile</a></nav><div class="foot">A little practice.<br>A lot more confidence.<br><a href="../main-menu-modules.html">Original app ↗</a></div></aside><main class="learn-main"><header class="learn-top"><div class="course-badge"><img src="assets/brand-transparent.png" alt=""><span>Algebra <b>1</b></span></div><div class="topstats"><button class="pill streak-button" id="open-streak" aria-label="View activity calendar, ${streak(progress.practiceDays).current} day practice streak">ϟ <span>${streak(progress.practiceDays).current}</span></button><span class="pill gold">✦ ${progress.xp} XP</span></div></header><section class="journey"><header class="unit-banner"><div><span class="eyebrow">ALGEBRA 1 · UNIT ${module.id}</span><h1>${activeModule===0?'Find your balance.':module.name}</h1><p>${module.name} · ${completedCount} of ${lessons.length} figures complete</p></div><button id="open-course" class="course-menu" aria-label="Browse all course modules">${icon('<path d="M5 6h14M5 12h14M5 18h14"/>')}</button></header><div class="world"><div class="world-decoration" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><img src="assets/brand-transparent.png" alt=""><span class="floating-math math-one">x + you</span><span class="floating-math math-two">= possibility</span><i class="star star-one">✦</i><i class="star star-two">✧</i></div><div class="path-map"><svg class="path-line" viewBox="0 0 420 2110" preserveAspectRatio="none" aria-hidden="true"><path d="${path}"/></svg><ol class="lesson-path" aria-label="${module.name} lesson path">${nodes}</ol></div></div><div class="next-unit"><span class="eyebrow">${activeModule<6?'UP AHEAD':'KEEP GROWING'}</span><h2>${activeModule<6?course[activeModule+1].name:'Every figure makes you stronger.'}</h2><button class="hint-toggle" id="next-module">${activeModule<6?'Explore next unit →':'Back to unit 1 →'}</button></div><p class="path-note">Progress is saved on this device. Five source lessons (020–024) are unavailable; premium access requirements still apply.</p></section></main><dialog class="learn-dialog" id="learn-dialog"><button class="dialog-close icon-btn" aria-label="Close dialog">×</button><div id="dialog-body"></div></dialog></div>`;
 const openDialog=(html)=>{document.querySelector('#dialog-body').innerHTML=html;document.querySelector('#learn-dialog').showModal();};
 const launch=(i)=>{const lesson=lessons[i];if(!lesson.available){openDialog('<div class="figure-detail"><h2>Lesson not available yet</h2><p>This lesson file is missing from the original project. Your progress is safe; choose another figure.</p></div>');return;}
 let premium=false;try{premium=JSON.parse(localStorage.getItem('userProgress')||'{}').premium===true;}catch{}
 if(lesson.premium&&!premium){openDialog('<div class="figure-detail"><h2>Premium lesson</h2><p>This lesson requires Premium access in the original app. That requirement is preserved here.</p><a class="small-link" href="../main-menu-modules.html">Open the original app →</a></div>');return;}start(lesson);};
 document.querySelector('#start').onclick=()=>launch(current);
 document.querySelectorAll('[data-figure]').forEach(button=>button.onclick=()=>{const i=Number(button.dataset.figure);if(i===current){document.querySelector('#start').focus();return;}openDialog(`<div class="figure-detail"><span class="eyebrow">FIGURE ${String(lessons[i].id).padStart(3,'0')}</span><h2>${figures[i]}</h2><p>${!lessons[i].available?'The original source file is missing.':progress.completedLessons.includes(lessons[i].id)?'Revisit this figure and strengthen your skills.':'Practice this figure in the redesigned lesson experience.'}</p><button class="primary" id="launch-figure">${lessons[i].available?'Open lesson':'View availability'} →</button></div>`);document.querySelector('#launch-figure').onclick=()=>{document.querySelector('#learn-dialog').close();launch(i);};});
 document.querySelector('#open-streak').onclick=()=>openDialog(calendarCard());
 const selectModule=(id)=>{activeModule=id;progress.selectedModule=id;persistActivity();home();window.scrollTo(0,0);};
 document.querySelector('#next-module').onclick=()=>selectModule((activeModule+1)%7);
 document.querySelector('#open-course').onclick=()=>{openDialog('<div class="course-list"><h2>Your algebra journey</h2>'+course.map((m,i)=>`<button class="unit" data-module="${i}"><span class="unit-number">${i+1}</span><h3>${m.name}</h3><span class="arrow">→</span></button>`).join('')+'</div>');document.querySelectorAll('[data-module]').forEach(b=>b.onclick=()=>{document.querySelector('#learn-dialog').close();selectModule(Number(b.dataset.module));});};
 const dialog=document.querySelector('#learn-dialog');document.querySelector('.dialog-close').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}};
}
function start(lesson=activeLesson){activeLesson=lesson;problems=lesson.questions;window.scrollTo(0,0);state={index:0,selected:null,checked:false,attempts:0,errors:0,started:Date.now(),claimed:false,combo:0,transitioning:false};question();}
function question(){
 const p=problems[state.index]; state.selected=null;state.checked=false;state.transitioning=false;state.questionErrors=0;
 app.innerHTML=`<main class="lesson"><header class="lesson-header"><button class="icon-btn" id="exit" aria-label="Exit lesson">×</button><div class="track" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="${problems.length}" aria-valuenow="${state.index}"><div class="fill" style="width:${state.index/problems.length*100}%"></div></div><span class="combo" aria-label="${state.combo} correct answers in a row">ϟ ${state.combo}</span><span class="count">${state.index+1} / ${problems.length}</span></header><section class="question"><span class="eyebrow" style="color:var(--blue)">Figure ${String(activeLesson.id).padStart(3,'0')} · ${activeLesson.title}</span><h1 tabindex="-1">${p.q}</h1><div class="equation" aria-label="${p.eq}"><span class="equation-text">${p.eq}</span><span class="energy-reward" aria-hidden="true"></span></div><div class="lesson-concept"></div><div class="choices"></div></section><footer class="lesson-footer"><div class="feedback" role="status" aria-live="polite">Small steps. Strong foundations.</div><button class="primary" id="check" disabled>Check answer</button></footer></main>`;
 const choices=document.querySelector('.choices');
 if(!p.eq)document.querySelector('.equation').hidden=true;
 if(p.eq?.length>22)document.querySelector('.equation').classList.add('long-equation');
 if(p.concept)document.querySelector('.lesson-concept').innerHTML=p.concept;
 const special=p.type==='tutorial'||p.type==='graph';
 if(special)renderSpecial(p,value=>{state.selected=value;document.querySelector('#check').disabled=false;});
 if(p.type==='fill-blank'){
  const input=document.createElement('input');input.className='answer';input.type='text';input.inputMode=Number.isFinite(Number(p.answer))?'decimal':'text';input.autocomplete='off';input.setAttribute('aria-label','Your answer');input.placeholder=p.placeholder;choices.append(input);
  input.oninput=()=>{state.selected=input.value.trim();document.querySelector('#check').disabled=!state.selected;};
  input.onkeydown=e=>{if(e.key==='Enter'&&!document.querySelector('#check').disabled){e.preventDefault();check();}};
 }else if(!special){
  const values=p.type==='true-false'?['True','False']:p.choices;
  values.forEach((value,i)=>{const b=document.createElement('button');b.className='choice';b.setAttribute('aria-pressed','false');const n=document.createElement('b');n.textContent=i+1;const t=document.createElement('span');t.textContent=value;b.append(n,t);b.onclick=()=>{if(state.checked)return;state.selected=p.type==='true-false'?i===0:i;choices.querySelectorAll('button').forEach(el=>{el.classList.remove('selected','wrong');el.setAttribute('aria-pressed','false');});b.classList.add('selected');selectMotion(b);b.setAttribute('aria-pressed','true');document.querySelector('#check').disabled=false;};choices.append(b);});
 }
 if(activeLesson.id===1)mountCoaching(state.index);
 document.querySelector('#exit').onclick=()=>{if(state.transitioning)return;if(confirm('Leave this lesson? This attempt will not be saved.'))home();};
 document.querySelector('#check').onclick=check;
 if(p.type==='tutorial'){state.checked=true;document.querySelector('#check').disabled=false;document.querySelector('#check').textContent='Got it — continue';}
 document.querySelector('h1').focus({preventScroll:true});
 animateEntrance();
}
function check(){
 if(state.transitioning)return;
 if(state.checked){state.transitioning=true;document.querySelector('#check').disabled=true;transitionQuestion(()=>{state.index++;if(state.index===problems.length)finish();else question();});return;}
 if(state.selected===null||state.selected==='')return;
 const p=problems[state.index];const correct=p.type==='graph'?graphMatches(state.selected,p.answer):p.type==='fill-blank'?answerMatches(state.selected,p.answer):state.selected===p.answer;
 state.attempts++;
 const feedback=document.querySelector('.feedback');const button=document.querySelector('#check');
 if(correct){state.checked=true;state.combo++;feedback.className='feedback';feedback.innerHTML='<strong>'+([3,5,9].includes(state.combo)?'ϟ '+state.combo+' in a row!':'That’s it. Nicely solved!')+'</strong>';const explanation=document.createElement('span');explanation.textContent=activeLesson.id===1?coaching[state.index][1]:'Correct. Keep building on what you know.';feedback.append(explanation);document.querySelector('.selected')?.classList.add('correct');document.querySelectorAll('.choice,.answer,.graph-controls input,.graph-controls select').forEach(el=>el.disabled=true);button.textContent=state.index===problems.length-1?'Finish lesson':'Continue';const width=(state.index+1)/problems.length*100;document.querySelector('.fill').style.width=width+'%';document.querySelector('[role=progressbar]').setAttribute('aria-valuenow',state.index+1);button.focus();answerMotion(true,state.combo);}
 else{state.errors++;state.questionErrors++;state.combo=0;feedback.className='feedback error';feedback.innerHTML='<strong>Not quite. Give it another go.</strong>You can take as many tries as you need.';document.querySelector('.selected')?.classList.add('wrong');state.selected=null;button.disabled=true;const input=document.querySelector('.answer');if(input){input.value='';input.focus();}answerMotion(false,0);if(activeLesson.id===1)revealHint(state.index,state.questionErrors);else{const help=document.createElement('span');help.textContent=state.questionErrors>=2?'Review the answer: '+(p.type==='multiple-choice'?p.choices[p.answer]:p.type==='graph'?`${p.answer.position}, ${p.answer.circleType} circle, shade ${p.answer.direction}`:String(p.answer)):(p.concept?'Re-read the example above, then try applying the same idea.':'Check the operation, signs, and what the question is asking.');feedback.append(help);}}
}
function finish(){
 const firstPracticeToday=!progress.practiceDays.includes(dateKey());
 progress.practiceDays=markDay(progress.practiceDays);
 recordVisit();
 const scored=problems.filter(p=>p.type!=='tutorial').length;
 state.earned=scored*10+(state.errors===0?50:0);
 const seconds=Math.max(1,Math.round((Date.now()-state.started)/1000));
 app.innerHTML=`<main class="finish"><img src="assets/brand-transparent.png" alt=""><h1 tabindex="-1">Look at you go.</h1><p class="muted">One more figure solved.<br>One step closer to “I’ve got this.”</p><div class="finish-streak ${firstPracticeToday?'streak-new':''}">ϟ ${streak(progress.practiceDays).current}-day practice streak · ${firstPracticeToday?'Day secured!':'Today complete'}</div><p class="finish-note">${firstPracticeToday?'You showed up and practiced. Come back tomorrow to keep it going.':'More practice, more confidence. Your streak is already safe for today.'}</p><div class="results"><div><strong>+${state.earned}</strong><span>XP earned</span></div><div><strong>${Math.round(scored/Math.max(1,state.attempts)*100)}%</strong><span>Accuracy</span></div><div><strong>${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}</strong><span>Time learning</span></div></div><button class="primary" id="claim">Keep the momentum →</button><p class="notice" id="save-status">Continue to save your preview progress on this device.</p></main>`;
 document.querySelector('h1').focus();
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)for(let i=0;i<32;i++){const el=document.createElement('i');el.className='confetti';el.style.left=Math.random()*100+'%';el.style.background=['#ffd15c','#5ed8f3','#9cdeac'][i%3];el.style.animationDelay=Math.random()*.4+'s';document.body.append(el);setTimeout(()=>el.remove(),2400);}
 document.querySelector('#claim').onclick=()=>{
  if(state.claimed)return;state.claimed=true;progress.xp+=state.earned;progress.completedLessons=[...new Set([...progress.completedLessons,activeLesson.id])];progress.completed=progress.completedLessons.includes(1);progress.sessions++;
  try{localStorage.setItem(key,JSON.stringify(progress));home();}catch{storageAvailable=false;document.querySelector('#save-status').textContent='Device storage is unavailable. Your progress will last for this visit only.';const b=document.querySelector('#claim');b.textContent='Back to learning';b.onclick=home;}
 };
 if(!storageAvailable)document.querySelector('#save-status').textContent='Device storage may be unavailable. Progress can still be kept for this visit.';
}
home();
