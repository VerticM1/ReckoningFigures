export const coaching = [
 ['Undo the +5. Whatever you do to the left side, do to the right side too.', 'Subtract 5 from both sides: x + 5 − 5 = 12 − 5, so x = 7.'],
 ['Start at 12 and count back 5. Subtraction makes this positive number smaller.', '12 − 5 = 7. Check by adding back: 7 + 5 = 12.'],
 ['Replace x with 8. Now ask: 8 plus what number equals 15?', '8 + 7 = 15, so the missing number is 7.'],
 ['Undo the +7 by subtracting 7 from both sides.', 'x + 7 − 7 = 15 − 7, so x = 8. Check: 8 + 7 = 15.'],
 ['To undo addition, use subtraction. Adding 9 would leave x + 18 on the left.', 'The statement is false. Subtract 9 from both sides to get x = 11.'],
 ['Subtract 12 from both sides to leave x by itself.', 'x = 25 − 12 = 13. Check: 13 + 12 = 25.'],
 ['What operation undoes +6? Apply it to both sides.', 'Subtract 6: x = 18 − 6 = 12. Check: 12 + 6 = 18.'],
 ['Subtract 15 from 38. You can subtract 10, then subtract 5 more.', 'x = 38 − 15 = 23. Check: 23 + 15 = 38.'],
 ['x can be on either side of the equals sign. Subtract 8 from both sides.', '23 − 8 = x + 8 − 8, so 15 = x. That means x = 15.']
];
export function mountCoaching(index) {
 const container=document.createElement('section');container.className='coach';
 container.innerHTML='<button class="hint-toggle" aria-expanded="false">✧ Need a nudge?</button><div class="hint-copy" role="status" hidden></div>';
 document.querySelector('.choices').after(container);
 const button=container.querySelector('button'),copy=container.querySelector('.hint-copy');
 button.onclick=()=>{const opening=copy.hidden;copy.hidden=!opening;button.setAttribute('aria-expanded',String(opening));copy.textContent=coaching[index][0];};
 if(index!==0)return;
 const lab=document.createElement('details');lab.className='balance-lab';
 lab.innerHTML=`<summary>⚖ Try it on a balance <small>optional practice</small></summary><div class="lab-body"><p>Keep both sides equal. Choose an operation and watch what happens.</p><div class="balance-board" aria-live="polite"><div class="balance-side"><span class="math-chip variable">x</span><span class="math-chip constant">+ 5</span></div><b class="equal-sign">=</b><div class="balance-side"><span class="math-chip total">12</span></div></div><div class="operation-row"><button data-operation="-5">− 5 on both sides</button><button data-operation="5">+ 5 on both sides</button></div><p class="lab-message" role="status">Which operation leaves x by itself?</p><button class="lab-reset">Reset balance</button></div>`;
 container.after(lab);
 lab.querySelectorAll('[data-operation]').forEach(button=>button.onclick=()=>{
  const subtraction=button.dataset.operation==='-5';
  lab.querySelector('.constant').textContent=subtraction?'+ 0':'+ 10';
  lab.querySelector('.total').textContent=subtraction?'7':'17';
  lab.querySelector('.balance-board').classList.toggle('balanced-win',subtraction);
  lab.querySelector('.lab-message').textContent=subtraction?'x + 5 − 5 = 12 − 5. Now x = 7. Both sides stay equal!':'x + 5 + 5 = 12 + 5. Both sides stay equal, but x is still not alone. Reset and try subtraction.';
  lab.querySelectorAll('[data-operation]').forEach(b=>b.disabled=true);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)lab.querySelectorAll('.math-chip').forEach(el=>el.animate?.([{transform:'translateY(-8px)',opacity:.4},{transform:'translateY(0)',opacity:1}],{duration:450,easing:'ease-out'}));
 });
 lab.querySelector('.lab-reset').onclick=()=>{lab.querySelector('.constant').textContent='+ 5';lab.querySelector('.total').textContent='12';lab.querySelector('.balance-board').classList.remove('balanced-win');lab.querySelector('.lab-message').textContent='Which operation leaves x by itself?';lab.querySelectorAll('[data-operation]').forEach(b=>b.disabled=false);};
}
export function revealHint(index,attempts){
 const copy=document.querySelector('.hint-copy');copy.hidden=false;copy.textContent=coaching[index][attempts>=2?1:0];document.querySelector('.hint-toggle').setAttribute('aria-expanded','true');
}
