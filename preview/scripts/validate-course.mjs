import assert from 'node:assert/strict';
import {course} from '../course.js';
import {answerMatches,graphMatches} from '../lesson-types.js';
let lessons=0,steps=0;
for(const m of course)for(const lesson of m.lessons){
 if(!lesson.available){assert.equal(lesson.questions.length,0);continue;}
 lessons++;assert.equal(lesson.questions.length,lesson.original.length);
 for(const [i,q]of lesson.questions.entries()){
  steps++;const original=lesson.original[i];assert(q.q,'Missing prompt');
  assert.equal(q.q,original.q||original.question||original.title);
  if(original.concept)assert.equal(q.concept,original.concept);
  if(original.content)assert.equal(q.content,original.content);
  if(q.type==='multiple-choice'){
   assert(q.answer>=0&&q.answer<q.choices.length);
   assert.deepEqual(q.choices,original.choices.map(c=>typeof c==='object'?c.text:c));
   const answer=typeof original.answer==='number'?original.choices[original.answer]:original.answer??original.choices.find(c=>c.correct)?.text;
   assert.equal(q.choices[q.answer],answer);
  }else if(q.type==='fill-blank'){assert.equal(q.answer,original.answer);assert(answerMatches(q.answer,q.answer));}
  else if(q.type==='graph'){assert.deepEqual(q.answer,original.correctAnswer);assert(graphMatches(q.answer,q.answer));}
  else if(q.type==='true-false')assert.equal(q.answer,original.answer);
  else assert.equal(q.type,'tutorial');
 }
}
assert.equal(lessons,53);assert.equal(steps,581);assert(!answerMatches('',0));assert(!answerMatches('1b','b'));assert(answerMatches('b','b'));assert(answerMatches('−2',-2));
console.log(`Validated ${lessons} lessons, ${steps} steps and original content parity.`);
