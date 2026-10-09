import assert from 'node:assert/strict';
import {course} from '../course.js';
import {answerMatches,graphMatches,renderSpecial} from '../lesson-types.js';
import {JSDOM} from 'jsdom';
const lesson=id=>course.flatMap(m=>m.lessons).find(l=>l.id===id);
const question=(id,n)=>lesson(id).questions[n-1];
const key=(id,n)=>{const q=question(id,n);return q.choices[q.answer];};
for(const m of course)for(const l of m.lessons)for(const q of l.questions){
 if(q.type==='multiple-choice')assert.equal(new Set(q.choices.map(c=>c.trim().replaceAll('−','-'))).size,q.choices.length,`${l.id}: duplicate choice text`);
}
for(const n of [8,9,10])assert.equal(question(16,n).eq,lesson(16).original[n-1].inequality);
assert(question(16,9).eq);assert(question(16,10).eq);
assert.equal(question(10,4).answer,true);
assert.match(question(11,3).q,/before the tip/);
assert.equal(key(26,10),'One solution');
assert.equal(key(56,12),'5 - x');
assert(!question(56,12).choices.includes('-x + 5'));
assert.match(key(58,4),/Nonnegative/);
for(const n of [8,12])assert.match(key(54,n),/x ≠ 0/);
const correct={position:0,circleType:'closed',direction:'left'};
for(const position of ['',null,undefined,NaN,'oops'])assert(!graphMatches({...correct,position},correct));
assert(graphMatches(correct,correct));assert(!graphMatches({...correct,direction:'right'},correct));
assert(answerMatches('−2','-2'));assert(answerMatches('-2','−2'));assert(!answerMatches('',0));
const dom=new JSDOM('<div class="choices"></div><button id="check" disabled>Check</button>');
globalThis.document=dom.window.document;
let value;renderSpecial({type:'graph'},v=>{value=v;document.querySelector('#check').disabled=false;});
for(const [id,v]of [['graph-position','0'],['graph-circle','closed'],['graph-direction','left']]){const el=document.getElementById(id);el.value=v;el.dispatchEvent(new dom.window.Event('input'));}
assert(graphMatches(value,correct));assert(!document.querySelector('#check').disabled);
const endpoint=document.getElementById('graph-position');endpoint.value='';endpoint.dispatchEvent(new dom.window.Event('input'));assert(document.querySelector('#check').disabled);
delete globalThis.document;
console.log('Curriculum regressions passed: unique choice text, inequality context, corrected keys, domain wording and graph input.');
