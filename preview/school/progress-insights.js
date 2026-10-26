// Deterministic teacher-review suggestions, not diagnostic or placement decisions.
// Keep display strings separate so the digest can gain reviewed translations.
export const messages={en:{title:'Weekly practice summary',period:'Reporting period (UTC)',practiced:'Skills practiced',strengths:'Promising practice signals',change:'Repeat-work comparison',next:'Suggested next step',limits:'These are client-reported first completions, not an independent assessment. Outside help is unknown. Later retries within the same assignment are not recorded.',none:'No saved practice in this period.',noStrength:'Not enough evidence to identify a strength yet.',noChange:'No comparable repeat-work results this week. Improvement after later retries is not recorded.',review:'Review with your teacher before choosing the next practice.'}};
const prerequisite={2:1,3:2,4:3,5:1,6:2,7:6,8:7,9:7,10:7,11:10,12:7,13:1,14:13,15:14,16:13,17:16,18:15,19:3,20:19,21:20,22:21,23:6,24:21,25:23,26:30,28:35,29:28,30:28,31:30,32:27,33:27,34:30,36:35,37:35,38:37,39:38,40:37,41:37,42:35,44:43,45:43,46:45,47:43,48:47,49:48,50:48,52:51,53:20,54:51,55:54,56:9,57:52,58:53,59:43,60:51,62:20,63:61};
export function catalog(course){return new Map(course.flatMap(u=>u.lessons.filter(l=>l.available).map(l=>[l.id,{...l,skill:u.name}])));}
export function millis(value){if(value?.toMillis)return value.toMillis();if(value?.seconds)return value.seconds*1000;return typeof value==='string'?Date.parse(value):Number(value)||0;}
export function usable(r){return Number.isInteger(r.questions)&&r.questions>0&&Number.isInteger(r.firstTry)&&r.firstTry>=0&&r.firstTry<=r.questions&&Number.isInteger(r.supportSteps)&&r.supportSteps>=0;}
export function recommendations(rows,people,course){
 const lessons=catalog(course),members=new Set(people.map(p=>p.id)),latest=new Map();
 for(const r of rows){if(!members.has(r.uid)||!lessons.has(r.lessonId)||!usable(r))continue;const key=r.uid+':'+r.lessonId,old=latest.get(key);if(!old||millis(r.completedAt)>millis(old.completedAt))latest.set(key,r);}
 const groups=new Map();for(const r of latest.values()){
  if(r.firstTry/r.questions>=.7&&r.supportSteps===0)continue;
  const lesson=lessons.get(r.lessonId),prior=lessons.get(prerequisite[r.lessonId]);
  // Recommend revisiting the observed figure; a prerequisite is a question to check, not an inferred gap.
  if(!groups.has(lesson.id))groups.set(lesson.id,{lesson,prerequisite:prior||null,students:[]});
  groups.get(lesson.id).students.push({uid:r.uid,firstTry:r.firstTry,questions:r.questions,supportSteps:r.supportSteps});
 }return [...groups.values()];
}
export function digest({rows,uid,course,start,end}){
 const lessons=catalog(course),all=rows.filter(r=>r.uid===uid&&usable(r)&&lessons.has(r.lessonId)&&millis(r.completedAt)>0).sort((a,b)=>millis(a.completedAt)-millis(b.completedAt));
 const week=all.filter(r=>millis(r.completedAt)>=start&&millis(r.completedAt)<end),latest=new Map();for(const r of week)latest.set(r.lessonId,r);
 const strengths=[...latest.values()].filter(r=>r.firstTry/r.questions>=.8&&r.supportSteps===0).map(r=>({lesson:lessons.get(r.lessonId),percent:Math.round(r.firstTry/r.questions*100)}));
 const comparisons=[];for(const r of latest.values()){const prior=all.filter(p=>p.lessonId===r.lessonId&&p.questions===r.questions&&millis(p.completedAt)<millis(r.completedAt)&&p.assignmentId!==r.assignmentId).at(-1);if(prior)comparisons.push({lesson:lessons.get(r.lessonId),before:Math.round(prior.firstTry/prior.questions*100),after:Math.round(r.firstTry/r.questions*100)});}
 const suggestions=recommendations(week,[{id:uid}],course);
 return {count:week.length,skills:[...new Set(week.map(r=>`${lessons.get(r.lessonId).skill}: ${lessons.get(r.lessonId).title}`))],strengths,comparisons,next:suggestions[0]||null};
}
export function digestText(data,{name,start,end,locale='en'}){
 const t=messages[locale]||messages.en;
 return `${t.title}\n${name}\n${t.period}: ${start} – ${end}\n\n${t.practiced}: ${data.skills.join(', ')||t.none}\nSaved figure completions: ${data.count}\n\n${t.strengths}: ${data.strengths.map(s=>`${s.lesson.title}: ${s.percent}% first try, no app support recorded`).join('; ')||t.noStrength}\n\n${t.change}: ${data.comparisons.map(c=>`${c.lesson.title}: ${c.before}% to ${c.after}% first try on separate assignments`).join('; ')||t.noChange}\n\n${t.next}: ${data.next?`Revisit Figure ${data.next.lesson.id}, ${data.next.lesson.title}. ${t.review}`:data.count?'Discuss the next topic with your teacher.':'Start with a teacher-selected figure.'}\n\n${t.limits}`;
}
