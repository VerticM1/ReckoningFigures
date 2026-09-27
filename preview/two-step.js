import { bolt } from './brand-art.js';
// Presentation and coaching layer; the imported course questions remain untouched.
export const challenge = {type:'fill-blank',eq:'4x + 6 = 30',q:'Your turn. Solve this new equation for x.',answer:'6',placeholder:'x = ?'};
const plan=(left,right,operation,nextLeft,nextRight)=>({left,right,operation,nextLeft,nextRight});
const subtract=(a,b,c)=>plan(`${a}x + ${b}`,String(c),`− ${b}`,`${a}x`,String(c-b));
const add=(a,b,c)=>plan(`${a}x − ${b}`,String(c),`+ ${b}`,`${a}x`,String(c+b));
const divide=(a,c)=>plan(`${a}x`,String(c),`÷ ${a}`,'x',String(c/a));
export const steps = [
 [subtract(2,5,13)], [divide(2,8)], [subtract(3,4,19)],
 [subtract(3,4,19),divide(3,15)], [add(4,3,9)],
 [add(5,7,18),divide(5,25)], [subtract(2,10,26),divide(2,16)],
 [add(6,12,24),divide(6,36)],
 [plan('20','3x + 2','− 2','18','3x'),plan('18','3x','÷ 3','6','x')],
 [subtract(4,6,30),divide(4,24)]
];
export const nudges = [
 'Undo the +5 first. Apply the same operation to both sides.',
 '2x means 2 times x. Which operation undoes multiplication?',
 'Find 19 − 4. This question asks for the number beside 3x, not x yet.',
 'Remove the +4, then split the remaining total into 3 equal groups.',
 'The constant is −3. Adding 3 cancels it.',
 'Undo the −7 with addition, then undo multiplication by 5.',
 'Undo the +10 first. You will still have 2x, so there is another step.',
 'Add 12 to both sides, then divide both sides by 6.',
 'The variable can be on either side. Subtract 2 from both sides, then divide by 3.',
 'Undo the +6, then undo multiplication by 4. Keep both sides equal.'
];
export function mistake(index,selected){
 if(index===0&&selected===1)return 'Dividing both sides by 2 can work, but you must divide every term, including 5. Removing +5 first avoids fractions.';
 if(index===0&&selected===2)return 'Adding 5 keeps equality, but makes the left side 2x + 10. Try the operation that cancels +5.';
 if(index===1&&selected===0)return 'The 2 is multiplying x. Subtracting 2 does not undo multiplication.';
 if(index===1&&selected===2)return 'Multiplying gives 4x = 16. Try the inverse of multiplication to leave one x.';
 if(index===2&&Number(selected)===5)return '5 is the value of x. This step asks for 3x: calculate 19 − 4.';
 if(index===6&&Number(selected)===16)return '16 is the value of 2x. Divide it into two equal groups to find x.';
 if(index===9&&Number(selected)===24)return '24 is the value of 4x. There is one more operation to leave x alone.';
 return nudges[index];
}
const equationText=s=>`${s.left} = ${s.right}`;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export function mountTwoStep(index,onHint){
 const moves=steps[index],first=moves[0];let hintLevel=0,playing=false;
 const shell=document.createElement('section');shell.className='solver-studio';
 shell.innerHTML=`<div class="studio-heading"><span class="eyebrow">${index<2?'SEE THE STEPS':index===9?'YOUR SOLO CHALLENGE':'BUILD YOUR CONFIDENCE'}</span><span class="studio-spark" aria-hidden="true">${bolt('medium')}</span></div><div class="solver-board" role="img"><div class="solver-pan"><span class="solver-value"></span><span class="solver-operation" aria-hidden="true"></span></div><b aria-hidden="true">=</b><div class="solver-pan"><span class="solver-value"></span><span class="solver-operation" aria-hidden="true"></span></div></div><p class="solver-caption" role="status">${index<2?'Choose an answer below. Watch the same operation happen on both sides.':index===9?'Try this one on your own. Help is here if you need it.':'Keep both sides equal as you work toward one x.'}</p><div class="solver-trail" aria-label="Worked steps"></div><div class="studio-actions"><button class="hint-toggle" aria-expanded="false">✧ Give me a nudge</button><button class="solver-replay" hidden>Replay steps ↻</button></div><div class="hint-copy" role="status" hidden></div>`;
 document.querySelector('.equation').hidden=true;document.querySelector('.lesson-concept').before(shell);
 const board=shell.querySelector('.solver-board'),values=shell.querySelectorAll('.solver-value'),ops=shell.querySelectorAll('.solver-operation'),caption=shell.querySelector('.solver-caption'),trail=shell.querySelector('.solver-trail'),hint=shell.querySelector('.hint-copy'),hintButton=shell.querySelector('.hint-toggle'),replay=shell.querySelector('.solver-replay');
 const set=(l,r)=>{[l,r].forEach((text,i)=>{values[i].replaceChildren();const match=text.match(/^(\d*)x(?: ([+−]) (\d+))?$/);if(!match){values[i].textContent=text;return;}if(match[1]){const factor=document.createElement('span');factor.className='term-factor';factor.textContent=match[1];values[i].append(factor);}values[i].append('x');if(match[2]){const constant=document.createElement('span');constant.className='term-constant';constant.textContent=` ${match[2]} ${match[3]}`;values[i].append(constant);}});board.setAttribute('aria-label',`${l} equals ${r}`);};set(first.left,first.right);
 function showHint(){
  hintLevel++;onHint();hint.hidden=false;hintButton.setAttribute('aria-expanded','true');
  hint.textContent=hintLevel===1?nudges[index]:moves.map(s=>`${equationText(s)} → ${s.operation} on both sides → ${s.nextLeft} = ${s.nextRight}`).join('. ');
  hintButton.textContent=hintLevel===1?'Show the worked steps':'Steps shown';hintButton.disabled=hintLevel>=2;
 }
 hintButton.onclick=showHint;
 async function play(){
  if(playing)return;playing=true;replay.disabled=true;trail.replaceChildren();set(first.left,first.right);board.classList.remove('solver-solved');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  shell.scrollIntoView({behavior:'instant',block:'start'});
  try{for(const s of moves){
   if(!shell.isConnected)return;
   set(s.left,s.right);ops.forEach(el=>{el.textContent=s.operation;el.classList.add('operation-visible');});
   caption.textContent=`${s.operation} on BOTH sides. Equality stays intact.`;
   board.querySelectorAll(s.operation.startsWith('÷')?'.term-factor':'.term-constant').forEach(el=>el.classList.add('term-cancelled'));
   if(!reduced){ops.forEach(el=>el.animate?.([{opacity:0,transform:'translateY(-12px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,fill:'both'}));await wait(850);}
   if(!shell.isConnected)return;
   set(s.nextLeft,s.nextRight);ops.forEach(el=>{el.classList.remove('operation-visible');el.textContent='';});
   const row=document.createElement('p');row.textContent=`${s.operation} on both sides → ${s.nextLeft} = ${s.nextRight}`;trail.append(row);
   if(!reduced){values.forEach(el=>el.animate?.([{transform:'scale(.88)',opacity:.5},{transform:'scale(1)',opacity:1}],{duration:350}));await wait(450);}
  }
  board.classList.add('solver-solved');caption.textContent=index===0?'The +5 is gone. Next, we will turn 2x into one x.':index===2?'3x = 15. Next, divide both sides by 3 to find x.':index===4?'The −3 is gone. Dividing both sides by 4 would give x = 3.':index===9?'Check it: 4 × 6 + 6 = 30. You solved a new equation.':'Same operation, both sides. Each step keeps the equation true.';
  }finally{playing=false;replay.hidden=false;replay.disabled=false;}
 }
 replay.onclick=play;
 return {success:play,wrong(selected){caption.textContent=mistake(index,selected);return caption.textContent;},get usedHint(){return hintLevel>0;}};
}
