import assert from 'node:assert/strict';
import {course} from '../course.js';
const lessons=course.flatMap(u=>u.lessons);
const q=(id,n)=>lessons.find(l=>l.id===id).questions[n-1];
const key=(id,n)=>q(id,n).choices[q(id,n).answer];
function numeric(id,n,value){const question=q(id,n),matches=question.choices.map((c,i)=>Math.abs(Number(c.replace(/ g$/,'').replace('−','-'))-value)<1e-9?i:-1).filter(i=>i>=0);assert.deepEqual(matches,[question.answer],`${id}/${n}`);}
function models(id,n,fs,expected){const matches=fs.map((f,i)=>[0,1,2,3,5].every(t=>Math.abs(f(t)-expected(t))<1e-8)?i:-1).filter(i=>i>=0);assert.deepEqual(matches,[q(id,n).answer]);}
numeric(59,1,100*2**3);numeric(59,2,1+20/100);
models(59,3,[t=>500-10*t,t=>500*.9**t,t=>500*1.1**t,t=>500*.1**t],t=>500*(1-10/100)**t);
assert.equal(key(59,4),'Initially 80; grows 25% yearly');
numeric(59,5,200*.8**2);
models(59,6,[t=>5+10*t,t=>3*5**t,t=>5*3**t,t=>5*t**3],t=>5*3**t);
assert.equal(key(59,7),`L: $${20+10*3}, E: $${20*2**3}; E has more`);
assert.equal(key(59,8),'Real growth may slow because resources and space are limited');numeric(59,9,1-30/100);
assert.equal(key(59,10),'First linear; second exponential');
models(59,11,[t=>60+50*t,t=>60*1.5**t,t=>60*.5**t,t=>1.5*60**t],t=>60*(1+50/100)**t);
numeric(59,12,320*.5**3);
numeric(60,1,11-7);
models(60,2,[n=>5+3*n,n=>3+5*(n-1),n=>5+3*(n-1),n=>5*3**(n-1)],n=>5+3*(n-1));
numeric(60,3,20-4*(5-1));numeric(60,4,6/3);numeric(60,5,2*3**(4-1));
const recur=(start,next)=>{const out=[start];for(let i=1;i<4;i++)out.push(next(out.at(-1)));return out;};
for(const [n,target,options] of [[6,[10,7,4,1],[[10,x=>x-3],[10,x=>3*x],[7,x=>x-3],[10,x=>x+3]]],[7,[81,27,9,3],[[81,x=>x-54],[27,x=>x/3],[81,x=>x/3],[81,x=>3*x]]]])assert.deepEqual(options.map(([s,f],i)=>JSON.stringify(recur(s,f))===JSON.stringify(target)?i:-1).filter(i=>i>=0),[q(60,n).answer]);
assert.equal(key(60,8),'Positive integers only');numeric(60,9,12+3*(6-1));
models(60,10,[n=>40*.5**n,n=>40-20*(n-1),n=>40*.5**(n-1),n=>20*2**(n-1)],n=>40*.5**(n-1));
numeric(60,11,-2+5*(7-1));numeric(60,12,96*.5**(5-1));
for(const id of [59,60]){const lesson=lessons.find(l=>l.id===id);assert.equal(lesson.questions.length,12);assert(lesson.premium);for(const question of lesson.questions){assert(question.explanation);assert.equal(question.explanations.length,4);}assert(lesson.questions.slice(-2).every(q=>q.phase==='check'&&!q.concept));}
console.log('PASS 24 model/sequence keys, numeric distractor uniqueness, model and recursion fixtures, feedback and fresh closing questions.');
