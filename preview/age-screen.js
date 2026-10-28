// Birth information is evaluated locally and is never persisted or sent to a service.
export function ageBand(year,month,day,now=new Date()){
 if(!Number.isInteger(year)||!Number.isInteger(month)||year<1900||month<1||month>12)return 'invalid';
 const delta=(now.getFullYear()-year)*12+now.getMonth()+1-month;
 if(delta<0)return 'invalid';
 if(delta===156){if(!Number.isInteger(day)||day<1||day>new Date(year,month,0).getDate())return 'day';return day<=now.getDate()?'older':'younger';}
 return delta>156?'older':'younger';
}
export function mountAgeScreen(host,{onEligible,onLogin,school=false}){
 const year=new Date().getFullYear();
 host.innerHTML=`<h2>When were you born?</h2><p>Student access is for ages 13 and older, including school and family accounts. Your birth information stays on this page.</p><form id="age-form"><label>Month<select name="month" required style="font:inherit;min-height:48px;width:100%"><option value="">Select month</option>${Array.from({length:12},(_,i)=>`<option value="${i+1}">${new Date(2000,i).toLocaleString('en',{month:'long'})}</option>`).join('')}</select></label><label>Year<select name="year" required style="font:inherit;min-height:48px;width:100%"><option value="">Select year</option>${Array.from({length:year-1899},(_,i)=>`<option value="${year-i}">${year-i}</option>`).join('')}</select></label><label id="birth-day" hidden>Day<input name="day" type="number" min="1" max="31" inputmode="numeric"><small>We need the day to choose the correct setup this month.</small></label><p id="age-info" role="status"></p><button type="submit">Continue</button></form><button type="button" id="age-login">I already have an account</button>`;
 const form=host.querySelector('form'),info=host.querySelector('#age-info');
 form.onsubmit=e=>{e.preventDefault();if(!form.reportValidity())return;const result=ageBand(Number(form.elements.year.value),Number(form.elements.month.value),Number(form.elements.day.value));if(result==='day'){host.querySelector('#birth-day').hidden=false;form.elements.day.required=true;form.elements.day.focus();return;}if(result==='invalid'){info.textContent='Please enter a valid birth month and year.';return;}if(result==='older'){onEligible();return;}host.innerHTML=`<h2>Student access starts at age 13.</h2><p>Reckoning Figures is currently available only to students ages 13 and older. This applies to school invitations and parent-linked accounts too.</p><p>No account has been created. Enrollment for younger learners is postponed.</p>`;};
 host.querySelector('#age-login').onclick=onLogin;
}
