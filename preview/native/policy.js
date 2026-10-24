export function mobileDestination(href,base){
 let url;try{url=new URL(href,base);}catch{return '/preview/native/unavailable.html';}
 const origin=new URL(base);const local=url.protocol===origin.protocol&&url.host===origin.host;
 if(local){
  if(url.pathname==='/')return '/preview/';
  if(!url.pathname.startsWith('/preview/'))return '/preview/native/unavailable.html';
  if(url.pathname.startsWith('/preview/owner/')||url.pathname.startsWith('/preview/organization/')||['/preview/family/','/preview/family/index.html','/preview/family/sandbox.html','/preview/family/success.html','/preview/pilot.html'].includes(url.pathname))return '/preview/native/unavailable.html';
  return null;
 }
 if(url.hostname==='checkout.stripe.com'||url.hostname==='billing.stripe.com')return '/preview/native/unavailable.html';
 if(['https:','mailto:'].includes(url.protocol))return null;
 return '/preview/native/unavailable.html';
}
