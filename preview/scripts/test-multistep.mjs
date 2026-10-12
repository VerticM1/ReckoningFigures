import assert from 'node:assert/strict';
import {course} from '../course.js';
const lesson=course.flatMap(u=>u.lessons).find(l=>l.id===7);
// Independently stated linear equations: each function returns left minus right.
const cases=[
 ['3(x + 2) = 21',x=>3*(x+2)-21],
 ['4x + 3 + 2x = 21',x=>4*x+3+2*x-21],
 ['−(2x − 5) + 3 = 14',x=>-(2*x-5)+3-14],
 ['(x + 2)/3 + x/6 = 4',x=>(x+2)/3+x/6-4],
 ['2(3x − 1) = 4x + 10',x=>2*(3*x-1)-(4*x+10)],
 ['3(x + 2) = 3x + 4',x=>3*(x+2)-(3*x+4)],
 ['2(3x − 4) = 6x − 8',x=>2*(3*x-4)-(6*x-8)],
 ['−2(x − 3) + 5x = 18',x=>-2*(x-3)+5*x-18],
 ['(x + 4)/2 − x/4 = 5',x=>(x+4)/2-x/4-5]
];
const zero=v=>Math.abs(v)<1e-10;
assert.equal(lesson.questions.length,9);
for(const [i,q]of lesson.questions.entries()){
 const [eq,f]=cases[i];assert.equal(q.eq,eq);const constant=f(0),coefficient=f(1)-constant;
 const matches=q.choices.map((choice,index)=>{
  if(choice==='There is no solution')return zero(coefficient)&&!zero(constant)?index:-1;
  if(choice==='Every real number is a solution')return zero(coefficient)&&zero(constant)?index:-1;
  // "Only" is not true for an identity even when that individual value works.
  if(zero(coefficient))return -1;
  const match=choice.match(/^x = ([−\-]?\d+)(?:\/(\d+))?$/);assert(match);
  const value=Number(match[1].replace('−','-'))/Number(match[2]||1);return zero(f(value))?index:-1;
 }).filter(i=>i>=0);
 assert.deepEqual(matches,[q.answer],`Question ${i+1} must have exactly one correct choice`);
 assert.equal(q.explanations.length,q.choices.length);assert.equal(q.explanations[q.answer],q.explanation);
 assert(q.explanations.every(t=>t.length>25));
 if(q.phase==='check')assert(!q.concept);
}
assert.equal(lesson.questions.filter(q=>q.phase==='check').length,2);
console.log('PASS all nine revised multi-step keys, unique correct choices, solution classifications, feedback and fresh closing questions.');
