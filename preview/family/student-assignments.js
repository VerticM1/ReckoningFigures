import {FAMILY_ASSIGNMENTS_ENABLED} from './assignment-config.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const visibleAssignments=data=>data?.paired===true?(data.tasks||[]).filter(t=>!['Completed','Cancelled'].includes(t.status)):[];
let cleanup=()=>{};
export function clearFamilyAssignments(){cleanup();cleanup=()=>{};}
export function mountStudentAssignments({anchor,getUser,getApi,course,start}){
 clearFamilyAssignments();if(!FAMILY_ASSIGNMENTS_ENABLED||!getUser()?.emailVerified||!anchor)return;
 const uid=getUser().uid,host=document.createElement('div');host.hidden=true;anchor.after(host);let busy=false,disposed=false;
 const valid=()=>!disposed&&host.isConnected&&getUser()?.uid===uid;
 async function refresh(){if(busy)return;if(!valid()){clearFamilyAssignments();return;}busy=true;
 try{const api=await getApi(),data=await api.familyPractice({action:'studentList'});if(!valid())return;const tasks=visibleAssignments(data);host.hidden=!tasks.length;if(!tasks.length){host.replaceChildren();return;}
 host.innerHTML=`<section class="family-assigned" aria-label="Practice assigned by your parent"><span class="eyebrow">FROM YOUR PARENT</span><h2>Assigned to you</h2><p class="family-save-status" role="status"></p>${tasks.map(t=>`<article><h3>${esc(t.title)}</h3><p>${t.completed.length} of ${t.lessonIds.length} figures${t.due?' · Due '+esc(t.due):''}</p><div>${t.lessonIds.filter(id=>!t.completed.includes(id)).map(id=>`<button class="hint-toggle" data-task="${esc(t.id)}" data-lesson="${id}" ${t.availableIds.includes(id)?'':'disabled'}>${t.availableIds.includes(id)?'Start':'Premium required ·'} Figure ${id}</button>`).join('')}</div></article>`).join('')}</section>`;
 host.querySelectorAll('[data-task]').forEach(button=>button.onclick=async()=>{host.querySelectorAll('button').forEach(b=>b.disabled=true);const status=host.querySelector('[role=status]');status.textContent='Opening practice…';try{const lessonId=Number(button.dataset.lesson),lesson=course.flatMap(u=>u.lessons).find(l=>l.id===lessonId);if(!lesson?.available)throw Error('This figure is not available.');const result=await api.familyPractice({action:'start',id:button.dataset.task,lessonId});if(!valid())return;if(result.completed){await refresh();return;}start(lesson,{uid,id:button.dataset.task,lessonId,nonce:result.nonce});}catch(e){if(valid()){status.textContent=e.message||'Could not open practice. Try again.';host.querySelectorAll('[data-task]').forEach(b=>{const task=tasks.find(t=>t.id===b.dataset.task);b.disabled=!task.availableIds.includes(Number(b.dataset.lesson));});}}});
 }catch{if(valid()){host.hidden=true;host.replaceChildren();}}finally{busy=false;}}
 const focus=()=>refresh(),timer=setInterval(()=>{if(!document.hidden)refresh();},30000);window.addEventListener('focus',focus);cleanup=()=>{disposed=true;clearInterval(timer);window.removeEventListener('focus',focus);host.remove();};refresh();
}
export async function saveFamilyAssignment(run,user,api){if(!run)return;if(user?.uid!==run.uid)throw Error('Your account changed. Sign in again and reopen the assignment.');await api.familyPractice({action:'complete',id:run.id,lessonId:run.lessonId,nonce:run.nonce});}
