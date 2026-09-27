import { energyIcon } from './brand-art.js';
import { dateKey, weekDays } from './activity.js';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function successBurst(combo){
 document.querySelector('.answer-celebration')?.remove();
 const el=document.createElement('div');el.className='answer-celebration';el.setAttribute('aria-hidden','true');
 el.innerHTML=`${energyIcon(combo>=3?'flame':'crystal','medium')}<strong>${combo>=3?`${combo} IN A ROW!`:'SOLVED!'}</strong><span>+10 XP</span>`;
 document.body.append(el);setTimeout(()=>el.remove(),reduced()?700:1250);
}
export function celebrateFinish({xp,days,practiceDays,firstPracticeToday}){
 const modal=document.createElement('dialog');modal.className='celebration-screen';modal.setAttribute('aria-labelledby','celebration-title');
 document.body.append(modal);let phase='xp',frame;
 const stop=()=>cancelAnimationFrame(frame);
 const close=()=>{stop();modal.close();modal.remove();document.querySelector('#claim')?.focus({preventScroll:true});};
 const render=()=>{
  stop();const streak=phase==='streak';
  modal.innerHTML=`<div class="celebration-stage ${streak?'streak-stage':'xp-stage'}"><button class="celebration-skip" aria-label="Skip celebration and view results">Skip animation →</button><div class="celebration-rays" aria-hidden="true"></div><div class="celebration-art">${energyIcon(streak?'flame':'medal','hero')}<span class="celebration-ring"></span>${Array.from({length:12},(_,i)=>`<i class="celebration-particle" style="--angle:${i*30}deg;--delay:${i%4*.1}s"></i>`).join('')}</div><span class="eyebrow">${streak?'YOU SHOWED UP':'LESSON COMPLETE'}</span><h1 id="celebration-title">${streak?'Keep your fire alive.':'You earned this.'}</h1><div class="celebration-count" aria-hidden="true">${streak?days:0}<span>${streak?'day practice streak':'XP earned'}</span></div><p class="sr-only">${streak?`${days} day practice streak`:`${xp} XP earned`}</p>${streak?`<div class="celebration-week" aria-label="Practice this week">${weekDays().map(d=>`<div class="${d.key===dateKey()?'secured-today':''}"><span>${d.label}</span><b aria-label="${d.name}: ${practiceDays.includes(d.key)?'practiced':'not practiced'}">${practiceDays.includes(d.key)?'✓':'·'}</b></div>`).join('')}</div>`:''}<p class="celebration-copy">${streak?'One lesson today. A stronger foundation tomorrow.':'Every step forward deserves a little celebration.'}</p><button class="primary celebration-next">${streak?'Keep it going →':firstPracticeToday?'See my streak →':'View results →'}</button></div>`;
  modal.querySelector('.celebration-skip').onclick=close;
  modal.querySelector('.celebration-next').onclick=()=>{if(!streak&&firstPracticeToday){phase='streak';render();}else close();};
  modal.querySelector('.celebration-next').focus({preventScroll:true});
  if(!streak){const count=modal.querySelector('.celebration-count'),start=performance.now(),duration=reduced()?0:950;
   const tick=now=>{const t=duration?Math.min(1,(now-start)/duration):1;count.firstChild.textContent=Math.round(xp*(1-(1-t)**3));if(t<1&&modal.isConnected)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
  }
 };
 modal.addEventListener('cancel',e=>{e.preventDefault();close();});render();modal.showModal();
}
