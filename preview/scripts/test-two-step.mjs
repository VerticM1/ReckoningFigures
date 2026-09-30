import assert from 'node:assert/strict';
import {course} from '../course.js';
import {steps,challenge,mistake} from '../two-step.js';
// Verify every displayed transformation preserves the equation for several x values.
const value=(term,x)=>{
 const match=term.match(/^(\d*)x(?: ([+−]) (\d+))?$/);
 if(!match)return Number(term);
 return Number(match[1]||1)*x+(match[2]==='−'?-1:1)*Number(match[3]||0);
};
for(const moves of steps)for(const s of moves)for(const x of [-3,0,2,9]){
 const n=Number(s.operation.slice(2));
 const apply=v=>s.operation[0]==='÷'?v/n:s.operation[0]==='−'?v-n:v+n;
 for(const side of ['Left','Right'])assert.ok(Math.abs(apply(value(s[side.toLowerCase()],x))-value(s['next'+side],x))<1e-9);
}
assert.equal(course[0].lessons[1].questions.length,9);
assert.equal(steps.length,10);
assert.equal(4*Number(challenge.answer)+6,30);
assert.match(mistake(0,1),/can work/); // Don't call a valid alternative mathematically wrong.
assert.match(mistake(2,'5'),/asks for 3x/);
console.log('Validated equality-preserving animations, challenge, and misconception feedback.');
