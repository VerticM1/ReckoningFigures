// Organization sandbox data is isolated from learner progress and Firebase.
export const STORAGE_KEY='rfOrganizationDemoV1';
export const dayKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function daysAgo(n,now=new Date()){const d=new Date(now);d.setDate(d.getDate()-n);return dayKey(d);}
export function seed(now=new Date()){
 const learners=['Alex R.','Jordan M.','Casey T.','Morgan S.','Taylor K.','Riley D.','Avery B.','Quinn L.','Sam P.','Jamie H.','Drew N.','Cameron W.'].map((name,i)=>({id:`l${i+1}`,name,classId:i<7?'c1':'c2'}));
 const attempts=[];learners.forEach((l,i)=>{if(i===6||i===11)return;for(let n=0;n<5;n++){const age=(i===2?9:0)+n*2+i%3;attempts.push({id:`a${i}-${n}`,learnerId:l.id,lessonId:1+n%3,date:daysAgo(age,now),questions:9,firstTry:i===1?4:i===4?5:7+n%3,minutes:5+i%5});}});
 return {version:1,classes:[{id:'c1',name:'Algebra foundations',instructor:'Demo instructor',description:'Small-group practice · Mon / Wed'},{id:'c2',name:'After-school explorers',instructor:'Demo instructor',description:'Independent practice · Tue / Thu'}],learners,attempts,assignments:[{id:'as1',title:'Build your equation confidence',classId:'c1',learnerIds:learners.filter(l=>l.classId==='c1').map(l=>l.id),lessonIds:[1,2],created:daysAgo(6,now),due:daysAgo(-2,now)}],support:[]};
}
export function scopedLearners(data,classId='all'){return data.learners.filter(l=>classId==='all'||l.classId===classId);}
export function scopedAttempts(data,classId='all',days=7,now=new Date()){
 const ids=new Set(scopedLearners(data,classId).map(l=>l.id));const start=days?daysAgo(days-1,now):'0000-00-00';return data.attempts.filter(a=>ids.has(a.learnerId)&&a.date>=start&&a.date<=dayKey(now));
}
export function metrics(attempts){const questions=attempts.reduce((n,a)=>n+a.questions,0),firstTry=attempts.reduce((n,a)=>n+a.firstTry,0);return {sessions:attempts.length,active:new Set(attempts.map(a=>a.learnerId)).size,minutes:attempts.reduce((n,a)=>n+a.minutes,0),accuracy:questions?Math.round(100*firstTry/questions):null,questions};}
export function learnerStatus(attempts){const m=metrics(attempts);return m.sessions===0?'No practice yet':m.accuracy<70?'Check in':'Practicing';}
export function assignmentProgress(data,assignment){
 return assignment.learnerIds.map(id=>{
 const attempts=data.attempts.filter(a=>a.learnerId===id&&assignment.lessonIds.includes(a.lessonId)&&(assignment.mode==='homework'?a.assignmentId===assignment.id:a.date>=assignment.created)&&a.date<=dayKey());
 const done=assignment.lessonIds.every(lesson=>attempts.some(a=>a.lessonId===lesson));
 const known=attempts.length>0&&attempts.every(a=>Number.isInteger(a.supportSteps));
 const support=known?attempts.reduce((n,a)=>n+a.supportSteps,0):null;
 return {id,done,support,status:!done?'Pending':support===null?'Completed · Support unknown':support>0?'Completed with support':'Completed · No app support recorded'};
 });
}
export function addClass(data,{name,description=''}){name=name.trim();if(!name||name.length>60)throw Error('Enter a class name of 1–60 characters.');if(data.classes.some(c=>c.name.toLowerCase()===name.toLowerCase()))throw Error('A class with that name already exists.');const c={id:crypto.randomUUID(),name,description:description.trim().slice(0,140),instructor:'Demo instructor'};data.classes.push(c);return c;}
export function addAssignment(data,{classId,title,lessonIds,due,instructions=''},availableIds){
 const learners=scopedLearners(data,classId);if(!data.classes.some(c=>c.id===classId)||!learners.length)throw Error('Choose a class with demo learners first.');
 if(!title.trim()||title.trim().length>80)throw Error('Enter an assignment title of 1–80 characters.');
 if(!lessonIds.length||lessonIds.some(id=>!availableIds.includes(id)))throw Error('Select at least one available lesson.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(due)||due<dayKey())throw Error('Choose today or a future due date.');
 const a={id:crypto.randomUUID(),mode:'homework',instructions:instructions.trim().slice(0,500),title:title.trim(),classId,learnerIds:learners.map(l=>l.id),lessonIds:[...new Set(lessonIds)],created:dayKey(),due};data.assignments.push(a);return a;
}
export function csv(rows){return '\uFEFF'+rows.map(row=>row.map(value=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
