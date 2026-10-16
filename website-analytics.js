import {measurementId} from './analytics-config.js';
// Public marketing pages only. Never install on learner or staff workspaces.
if (/^G-[A-Z0-9]+$/.test(measurementId)) {
 const key='rfWebsiteAnalyticsConsent';let active=false;
 const read=()=>{try{return localStorage.getItem(key);}catch{return null;}};
 const write=value=>{try{localStorage.setItem(key,value);}catch{}};
 const event=(name,params={})=>{if(active)window.gtag('event',name,params);};
 function enable(){if(active)return;window['ga-disable-'+measurementId]=false;active=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config',measurementId,{send_page_view:false,page_location:location.origin+location.pathname,page_referrer:'',allow_google_signals:false,allow_ad_personalization_signals:false});const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+measurementId;document.head.append(script);event('page_view',{page_location:location.origin+location.pathname,page_title:document.title,page_referrer:''});}
 const panel=document.createElement('aside');panel.setAttribute('aria-label','Website analytics preferences');panel.style.cssText='position:fixed;bottom:16px;left:16px;right:16px;z-index:30;background:white;color:#102e3b;border:1px solid #aec6cf;padding:18px;border-radius:12px;box-shadow:0 8px 30px #102e3b22';
 const copy=document.createElement('p');copy.textContent='Allow optional website analytics? Google Analytics helps us understand visits and pilot applications. We do not send your application details. You can decline and still use the site.';
 const yes=document.createElement('button'),no=document.createElement('button'),settings=document.createElement('button');yes.textContent='Allow analytics';no.textContent='Decline';settings.textContent='Analytics preferences';for(const b of [yes,no,settings])b.className='button secondary';panel.append(copy,yes,no);document.body.append(panel,settings);settings.onclick=()=>panel.hidden=false;yes.onclick=()=>{write('allow');enable();panel.hidden=true;};no.onclick=()=>{write('deny');window['ga-disable-'+measurementId]=true;active=false;panel.hidden=true;};settings.style.cssText='display:block;margin:16px auto';const saved=read();panel.hidden=!!saved;if(saved==='allow')enable();
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const path=new URL(a.href,location.href).pathname;if(path.endsWith('/pilot.html'))event('pilot_application_click');else if(path.endsWith('/preview/'))event('learning_app_click');});
 window.addEventListener('rf:pilot-submitted',()=>event('pilot_application_submitted'));
}
