import {course} from './course.js';
const store='rfOrganizationDemoV1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const homeworkRequested=new URLSearchParams(location.search).has('homeworkDemo');
export function homeworkContext(){try{const params=new URLSearchParams(location.search),data=JSON.parse(localStorage.getItem(store)),assignment=data.assignments.find(a=>a.id===params.get('homeworkDemo')&&a.mode==='homework'),learner=data.learners.find(l=>l.id===params.get('learner'));if(!assignment||!learner||!assignment.learnerIds.includes(learner.id))return null;return {assignment,learner};}catch{return null;}}
export function homeworkHome(app,context,start,art){
 if(!context){app.innerHTML='<main class="finish"><h1>This demo assignment is unavailable.</h1><p>Open a homework preview from the educator workspace in the same browser. It may have been reset.</p><a class="primary" href="organization/">Back to educator workspace</a></main>';return;}
 const fresh=homeworkContext();if(!fresh)return homeworkHome(app,null,start,art);
 const {assignment:a,learner:l}=fresh,data=JSON.parse(localStorage.getItem(store));
 const lessons=a.lessonIds.map(id=>course.flatMap(m=>m.lessons).find(l=>l.id===id)).filter(l=>l?.available&&!l.premium);
 app.innerHTML=`<main class="homework-home page"><a class="hint-toggle" href="organization/">← Educator workspace</a><p class="notice">LOCAL DEMO · ${esc(l.name)} · No real student delivery</p><section class="homework-hero">${art}<span class="eyebrow">HOMEWORK PRACTICE</span><h1>${esc(a.title)}</h1><p>Due ${esc(a.due)} · Work at your own pace.</p><p>Hints and examples are welcome. Practice is about making progress.</p></section>${a.instructions?`<section class="homework-note"><strong>From your teacher</strong><p>${esc(a.instructions)}</p></section>`:''}<div class="homework-list">${lessons.map(lesson=>{const done=data.attempts.some(t=>t.assignmentId===a.id&&t.learnerId===l.id&&t.lessonId===lesson.id);return `<article><div><span class="eyebrow">FIGURE ${lesson.id}</span><h2>${esc(lesson.title)}</h2><p>${done?'Completed · You can practice again':lesson.questions.length+' original steps'}</p></div><button class="primary" data-homework-lesson="${lesson.id}">${done?'Practice again':'Start figure'}</button></article>`}).join('')}</div><p class="notice">The teacher demo records completion, first-try answers, and steps where the app showed support. It cannot tell whether help was used outside the app. No timed score or cheating label.</p></main>`;
 app.querySelectorAll('[data-homework-lesson]').forEach(b=>b.onclick=()=>start(lessons.find(l=>l.id===Number(b.dataset.homeworkLesson))));
}
export function saveHomework(context,lessonId,state,questions,seconds){
 const current=homeworkContext();if(!current||current.assignment.id!==context.assignment.id)throw Error('This demo assignment was removed. Return to the educator workspace.');
 const data=JSON.parse(localStorage.getItem(store));if(data.attempts.some(a=>a.id===state.sessionId))return;
 const d=new Date(),date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 data.attempts.push({id:state.sessionId,assignmentId:context.assignment.id,learnerId:context.learner.id,lessonId,date,completedAt:d.toISOString(),questions,firstTry:state.firstTry,minutes:Math.max(1,Math.round(seconds/60)),supportSteps:state.supportSteps.size,mode:'homework'});
 localStorage.setItem(store,JSON.stringify(data));
}
