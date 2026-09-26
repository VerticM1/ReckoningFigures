export function answerMatches(value, answer){
 const entered=String(value).trim().replaceAll('−','-');const expected=String(answer).trim();
 return entered!=='' && (Number.isFinite(Number(expected))?Number.isFinite(Number(entered))&&Number(entered)===Number(expected):entered===expected);
}
export function graphMatches(value,answer){return value&&Number(value.position)===answer.position&&value.circleType===answer.circleType&&value.direction===answer.direction;}
function line(position=0,circleType='open',direction='right',basic=false){
 const x=155+position*23;
 return `<svg class="number-line" viewBox="0 0 310 100" role="img" aria-label="${basic?'Number line from minus five to five':`${circleType} circle at ${position}, shaded ${direction}`}"><path d="M22 45H288" stroke="#89a9bb" stroke-width="2"/>${basic?'':`<path d="M${x} 45H${direction==='left'?22:288}" stroke="#5ed8f3" stroke-width="6"/><path d="${direction==='left'?'M30 37 22 45 30 53':'M280 37 288 45 280 53'}" stroke="#5ed8f3" stroke-width="3" fill="none"/>`}${Array.from({length:11},(_,i)=>{const n=i-5;return `<path d="M${40+i*23} 39v12" stroke="#adc4d2"/><text x="${40+i*23}" y="74" text-anchor="middle" fill="#c5dce7" font-size="12">${n}</text>`;}).join('')}${basic?'':`<circle cx="${x}" cy="45" r="7" stroke="#ffd15c" stroke-width="3" fill="${circleType==='open'?'#192632':'#ffd15c'}"/>`}</svg>`;
}
export function renderSpecial(p,onChange){
 const box=document.querySelector('.choices');
 if(p.type==='tutorial'){
  const text=document.createElement('div');text.className='tutorial-copy';if(p.content)text.innerHTML=p.content;else text.textContent=p.text||'';box.append(text);
  if(p.visual){const v=p.visual;const drawing=document.createElement('div');drawing.innerHTML=v.type==='comparison'?line(v.left.pos,v.left.type,v.left.dir)+line(v.right.pos,v.right.type,v.right.dir):line(v.position||0,v.type==='closed-circle'?'closed':'open',v.shade||'right',v.type==='basic-line');box.append(drawing);}return;
 }
 const form=document.createElement('div');form.className='graph-controls';
 form.innerHTML='<div class="graph-preview"></div><label>Endpoint<input id="graph-position" type="number" min="-5" max="5" step="1" placeholder="−5 to 5"></label><label>Circle<select id="graph-circle"><option value="">Choose…</option><option value="open">Open ○</option><option value="closed">Closed ●</option></select></label><label>Shade<select id="graph-direction"><option value="">Choose…</option><option value="left">Left ←</option><option value="right">Right →</option></select></label>';
 box.append(form);form.querySelector('.graph-preview').innerHTML=line(0,'open','right',true);
 const update=()=>{const position=form.querySelector('input').value,circleType=form.querySelector('#graph-circle').value,direction=form.querySelector('#graph-direction').value;if(position!==''&&Number.isInteger(Number(position))&&Math.abs(Number(position))<=5&&circleType&&direction){form.querySelector('.graph-preview').innerHTML=line(Number(position),circleType,direction);onChange({position:Number(position),circleType,direction});}else{document.querySelector('#check').disabled=true;}};
 form.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',update));
}
