import { bolt, energyIcon } from './brand-art.js';
import { dateKey, weekDays } from './activity.js';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function successBurst(combo){
 document.querySelector('.answer-celebration')?.remove();
 const el=document.createElement('div');el.className='answer-celebration';el.setAttribute('aria-hidden','true');
 el.innerHTML=`${energyIcon(combo>=3?'flame':'crystal','medium')}<strong>${combo>=3?`${combo} IN A ROW!`:'SOLVED!'}</strong><span>+10 XP</span>`;
 document.body.append(el);setTimeout(()=>el.remove(),reduced()?700:1250);
}
// Three beats: arrival → earned results → new-day streak. No animation awards XP.
export function celebrateFinish({xp,days,practiceDays,firstPracticeToday,scored,accuracy,seconds,independent=false,onComplete}){
 const modal=document.createElement('dialog');
 modal.className='celebration-screen';modal.setAttribute('aria-labelledby','celebration-title');
 document.body.append(modal);
 let phase=reduced()?'results':'intro',frame,timer,closed=false;
 const stop=()=>{cancelAnimationFrame(frame);clearTimeout(timer);};
 const close=()=>{if(closed)return;closed=true;stop();modal.close();modal.remove();onComplete();};
 const change=next=>{phase=next;render();};
 const particles=()=>Array.from({length:16},(_,i)=>`<i class="celebration-particle" style="--angle:${i*22.5}deg;--delay:${.3+i%4*.08}s"></i>`).join('');
 function render(){
  stop();
  if(phase==='intro'){
   modal.innerHTML=`<div class="celebration-stage intro-stage"><div class="victory-banner" aria-hidden="true"><div class="victory-speedlines"></div>${bolt('object')}</div><div class="intro-confetti" aria-hidden="true">${particles()}</div><h1 id="celebration-title">${firstPracticeToday?'First lesson today!':'Another figure solved!'}</h1><p class="celebration-copy">That’s another step forward.</p><button class="primary celebration-next">See my results →</button></div>`;
   modal.querySelector('.celebration-next').onclick=()=>change('results');
   timer=setTimeout(()=>change('results'),1700);
  }else if(phase==='results'){
   modal.innerHTML=`<div class="celebration-stage results-stage"><div class="celebration-rays" aria-hidden="true"></div><div class="celebration-art">${energyIcon('medal','hero')}<span class="celebration-ring"></span>${particles()}</div><span class="eyebrow">LESSON COMPLETE</span><h1 id="celebration-title">${scored} steps solved!</h1><p class="celebration-copy">${independent?'And you solved the final challenge without hints.':'A little more practice. A little more confidence.'}</p><div class="earned-cards"><div class="earned-card earned-xp"><span>Total XP</span><strong aria-hidden="true">${energyIcon('crystal')}<b class="earned-xp-number">${reduced()?xp:0}</b></strong><span class="sr-only">${xp} XP earned</span></div><div class="earned-card earned-accuracy"><span>Accuracy</span><strong><i aria-hidden="true">✓</i>${accuracy}%</strong></div><div class="earned-card earned-time"><span>Time</span><strong><i aria-hidden="true">◷</i>${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}</strong></div></div><button class="primary celebration-next">${firstPracticeToday?'Continue to my streak →':'Save & return to Learn →'}</button></div>`;
   modal.querySelector('.celebration-next').onclick=()=>firstPracticeToday?change('streak'):close();
   if(!reduced()){
    const count=modal.querySelector('.earned-xp-number'),start=performance.now();
    const tick=now=>{const t=Math.max(0,Math.min(1,(now-start-250)/850));count.textContent=Math.round(xp*(1-(1-t)**3));if(t<1&&!closed)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
   }
  }else{
   const today=dateKey();
   modal.innerHTML=`<div class="celebration-stage streak-stage staged-ignition"><div class="celebration-art">${energyIcon('flame','hero')}<span class="celebration-ring"></span>${particles()}</div><h1 id="celebration-title" class="sr-only">${days} day practice streak</h1><div class="streak-counter" aria-hidden="true"><span class="streak-before">${Math.max(0,days-1)}</span><span class="streak-after">${days}</span></div><p class="streak-unit">day practice streak</p><div class="celebration-week" aria-label="Practice this week">${weekDays().map(d=>`<div class="${practiceDays.includes(d.key)?'day-practiced':''} ${d.key===today?'secured-today':''}"><span>${d.label}</span><b aria-label="${d.name}: ${practiceDays.includes(d.key)?'practiced':'not practiced'}">${practiceDays.includes(d.key)?'✓':'·'}</b></div>`).join('')}</div><p class="celebration-copy">${days===1?'Your streak starts here. Come back tomorrow for day 2!':`Keep learning tomorrow to make it ${days+1}!`}</p><button class="primary celebration-next">Keep the momentum →</button></div>`;
   modal.querySelector('.celebration-next').onclick=close;
  }
  const skip=document.createElement('button');skip.className='celebration-skip';skip.textContent=phase==='intro'?'Skip intro →':'Save & finish →';skip.onclick=phase==='intro'?()=>change('results'):close;
  modal.querySelector('.celebration-stage').prepend(skip);
  modal.querySelector('.celebration-next').focus({preventScroll:true});
 }
 modal.addEventListener('cancel',e=>{e.preventDefault();close();});render();modal.showModal();
}
