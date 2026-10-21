import {applyVerification,checkReset,finishReset} from './owner/client.js?v=account-mail-20261021';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),code=params.get('oobCode'),mode=params.get('mode');
let next='/preview/school/';
try{const u=new URL(params.get('next')||next,location.origin);if(u.origin===location.origin&&['/preview/pilot.html','/preview/school/','/preview/school/staff-join.html','/preview/school/join.html','/preview/owner/','/preview/'].includes(u.pathname))next=u.pathname+u.search;}catch{}
// Remove the one-time code from the address bar; this page never loads analytics.
history.replaceState(null,'',location.pathname);
$('continue').href=next;
function done(title,message){$('title').textContent=title;$('status').textContent=message;$('reset').hidden=true;$('continue').hidden=false;}
function failed(){done('Let’s get you a new link.','This link is invalid, expired, or has already been used. If you already verified your email, continue. Otherwise return to the page where you requested it and request a new link.');}
try{
 if(!code)throw Error();
 if(mode==='verifyEmail'){await applyVerification(code);done('Email verified.','You’re all set. Return to your open application tab; it will update automatically. You can also continue below.');}
 else if(mode==='resetPassword'){
 await checkReset(code);$('title').textContent='Choose a new password.';$('status').textContent='Use at least 6 characters. A longer, unique password helps keep your account secure.';$('reset').hidden=false;
 $('reset').onsubmit=async event=>{event.preventDefault();const password=$('password'),confirm=$('confirm');if(password.value!==confirm.value){$('status').textContent='Your passwords do not match.';confirm.focus();return;}const button=$('reset').querySelector('button');button.disabled=true;
 try{await finishReset(code,password.value);password.value='';confirm.value='';done('Password updated.','Sign in with your new password. Your progress and school access are unchanged.');}
 catch(e){if(['auth/weak-password','auth/password-does-not-meet-requirements'].includes(e.code))$('status').textContent='Choose a stronger password that meets your account requirements.';else if(e.code==='auth/network-request-failed')$('status').textContent='Check your connection and try again.';else failed();}finally{button.disabled=false;}};
 }else throw Error();
}catch{failed();}
