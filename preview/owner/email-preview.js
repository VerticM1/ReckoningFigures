import {emailTypes,renderEmail} from './email-templates.js?v=c3066521fe53';
const select=document.querySelector('#email-type');let current;
for(const [value,label] of Object.entries(emailTypes)){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}
function render(){current=renderEmail(select.value,{schoolName:'Example School',role:'teacher',invitedEmail:'teacher@example.invalid',expiresText:'22 October 2026 at 5:00 PM, America/New_York',actionUrl:'https://example.invalid/preview-link',helpText:'Need help? Contact your school administrator.',logoUrl:new URL('../assets/brand-transparent.png',location.href).href});document.querySelector('#email-subject').textContent=current.subject;document.querySelector('#email-frame').srcdoc=current.html;document.querySelector('#email-text').textContent=current.text;}
select.onchange=render;render();
function download(kind){const blob=new Blob([current[kind]],{type:kind==='html'?'text/html;charset=utf-8':'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='reckoning-figures-'+select.value+'-draft.'+(kind==='html'?'html':'txt');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.querySelector('#download-html').onclick=()=>download('html');document.querySelector('#download-text').onclick=()=>download('text');
