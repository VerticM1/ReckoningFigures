import {course} from './course.js';
const store='rfOrganizationDemoV1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const homeworkRequested=['homeworkDemo','schoolHomework'].some(k=>new URLSearchParams(location.search).has(k));
export function homeworkContext(){try{const params=new URLSearchParams(location.search),data=JSON.parse(localStorage.getItem(store)),assignment=data.assignments.find(a=>a.id===params.get('homeworkDemo')&&a.mode==='homework'),learner=data.learners.find(l=>l.id===params.get('learner'));if(!assignment||!learner||!assignment.learnerIds.includes(learner.id))return null;return {assignment,learner};}catch{return null;}}
export function homeworkHome(app,context,start,art){
 if(schoolHomeworkRequested)return cloudHomeworkHome(app,context,start,art);
 if(!context){app.innerHTML='<main class="finish"><h1>This demo assignment is unavailable.</h1><p>Open a homework preview from the educator workspace in the same browser. It may have been reset.</p><a class="primary" href="organization/">Back to educator workspace</a></main>';return;}
 const fresh=homeworkContext();if(!fresh)return homeworkHome(app,null,start,art);
 const {assignment:a,learner:l}=fresh,data=JSON.parse(localStorage.getItem(store));
 const lessons=a.lessonIds.map(id=>course.flatMap(m=>m.lessons).find(l=>l.id===id)).filter(l=>l?.available&&!l.premium);
 app.innerHTML=`<main class="homework-home page"><a class="hint-toggle" href="organization/">← Educator workspace</a><p class="notice">LOCAL DEMO · ${esc(l.name)} · No real student delivery</p><section class="homework-hero">${art}<span class="eyebrow">HOMEWORK PRACTICE</span><h1>${esc(a.title)}</h1><p>Due ${esc(a.due)} · Work at your own pace.</p><p>Hints and examples are welcome. Practice is about making progress.</p></section>${a.instructions?`<section class="homework-note"><strong>From your teacher</strong><p>${esc(a.instructions)}</p></section>`:''}<div class="homework-list">${lessons.map(lesson=>{const done=data.attempts.some(t=>t.assignmentId===a.id&&t.learnerId===l.id&&t.lessonId===lesson.id);return `<article><div><span class="eyebrow">FIGURE ${lesson.id}</span><h2>${esc(lesson.title)}</h2><p>${done?'Completed · You can practice again':lesson.questions.length+' original steps'}</p></div><button class="primary" data-homework-lesson="${lesson.id}">${done?'Practice again':'Start figure'}</button></article>`}).join('')}</div><p class="notice">The teacher demo records completion, first-try answers, and steps where the app showed support. It cannot tell whether help was used outside the app. No timed score or cheating label.</p></main>`;
 app.querySelectorAll('[data-homework-lesson]').forEach(b=>b.onclick=()=>start(lessons.find(l=>l.id===Number(b.dataset.homeworkLesson))));
}
export function saveHomework(context,lessonId,state,questions,seconds){
 if(context.cloud)return saveCloudHomework(context,lessonId,state,questions,seconds);
 const current=homeworkContext();if(!current||current.assignment.id!==context.assignment.id)throw Error('This demo assignment was removed. Return to the educator workspace.');
 const data=JSON.parse(localStorage.getItem(store));if(data.attempts.some(a=>a.id===state.sessionId))return;
 const d=new Date(),date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 data.attempts.push({id:state.sessionId,assignmentId:context.assignment.id,learnerId:context.learner.id,lessonId,date,completedAt:d.toISOString(),questions,firstTry:state.firstTry,minutes:Math.max(1,Math.round(seconds/60)),supportSteps:state.supportSteps.size,mode:'homework'});
 localStorage.setItem(store,JSON.stringify(data));
}

// Connected homework uses the existing renderer and celebrations.
let cloudApi=null,cloudError='';
const cloudParams=new URLSearchParams(location.search);
export const schoolHomeworkRequested=cloudParams.has('schoolHomework');
export async function loadHomework(){
 if(!schoolHomeworkRequested)return homeworkContext();
 try{
  cloudApi=await import('./owner/client.js?v=ec991ac9ca14');
  const user=await new Promise(resolve=>{const unsubscribe=cloudApi.observe(u=>{unsubscribe();resolve(u);});});
  if(!user)throw Error('Sign in through your class page, then open this assignment again.');
  const school=cloudParams.get('school'),classId=cloudParams.get('class'),assignmentId=cloudParams.get('schoolHomework');
  if(![school,classId,assignmentId].every(id=>/^[A-Za-z0-9_-]{1,128}$/.test(id||'')))throw Error('Invalid assignment link.');
  const ctx=await cloudApi.schoolContext(school);
  if(ctx.member?.role!=='student'||ctx.member.state!=='active')throw Error('Use an enrolled student account to complete school homework.');
  const assignment=await cloudApi.classroom.assignment(school,classId,assignmentId);
  return {cloud:true,school,classId,assignment,learner:{id:user.uid},uid:user.uid};
 }catch(e){cloudError=e.code==='permission-denied'?'Your account cannot open this assignment. Check class enrollment and that the connected-class rules are published.':e.message;return null;}
}
export async function cloudHomeworkHome(app,context,start,art){
 const back=`school/classroom.html?school=${encodeURIComponent(cloudParams.get('school')||'')}&class=${encodeURIComponent(cloudParams.get('class')||'')}`;
 if(!context){app.innerHTML=`<main class="finish"><h1>Open your school assignment</h1><p>${esc(cloudError||'Assignment unavailable.')}</p><a class="primary" href="${back}">Back to class / Sign in</a></main>`;return;}
 app.innerHTML='<main class="finish"><p role="status">Loading your saved homework…</p></main>';
 try{
  if(cloudApi.currentUid()!==context.uid)throw Error('Your account changed. Return to class and sign in again.');
  const access=await cloudApi.schoolContext(context.school),license=access.school.license,open=['pilot','active'].includes(access.school.status)&&license.startsOn.toMillis()<=Date.now()&&Date.now()<license.endsOn.toMillis();
  const a=await cloudApi.classroom.assignment(context.school,context.classId,context.assignment.id),results=await cloudApi.classroom.results(context.school,context.classId,a.id,false);
  const lessons=a.lessonIds.map(id=>course.flatMap(u=>u.lessons).find(l=>l.id===id)).filter(l=>l?.available&&!l.premium);
  app.innerHTML=`<main class="homework-home page"><a class="hint-toggle" href="${back}">← Back to class</a><p class="notice">CONNECTED SCHOOL PRACTICE</p><section class="homework-hero">${art}<span class="eyebrow">HOMEWORK PRACTICE</span><h1>${esc(a.title)}</h1><p>Due ${esc(a.due)} · Work at your own pace.</p><p>${open?'Hints and examples are welcome.':'Your school license is inactive. Saved results remain available; ask your administrator to restore practice access.'}</p></section>${a.instructions?`<section class="homework-note"><strong>From your teacher</strong><p>${esc(a.instructions)}</p></section>`:''}<div class="homework-list">${lessons.map(l=>{const done=results.some(r=>r.lessonId===l.id);return `<article><div><span class="eyebrow">FIGURE ${l.id}</span><h2>${esc(l.title)}</h2><p>${done?'Completion saved to your class':l.questions.length+' original steps'}</p></div><button class="primary" data-cloud-lesson="${l.id}" ${open?'':'disabled'}>${done?'Practice again':'Start figure'}</button></article>`;}).join('')}</div><p class="notice">Your first saved completion, first-try answers and app support are shared with your teacher. Later practice does not replace that result. Outside help is unknown. Finish a figure and keep this page open until saving completes. Unfinished figures currently restart if you close the page.</p></main>`;
  app.querySelectorAll('[data-cloud-lesson]').forEach(b=>b.onclick=()=>start(lessons.find(l=>l.id===Number(b.dataset.cloudLesson))));
 }catch(e){app.innerHTML=`<main class="finish"><h1>Could not load homework</h1><p>${esc(e.message)}</p><a class="primary" href="${back}">Return to class</a></main>`;}
}
export async function saveCloudHomework(context,lessonId,state,questions,seconds){
 if(cloudApi.currentUid()!==context.uid)throw Error('Your account changed. Return to class and sign in again.');
 await cloudApi.classroom.submit(context.school,context.classId,context.assignment.id,{lessonId,questions,firstTry:state.firstTry,supportSteps:state.supportSteps.size,seconds:Math.min(604800,seconds),sessionId:state.sessionId});
}
