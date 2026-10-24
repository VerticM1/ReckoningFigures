import {Capacitor} from '@capacitor/core';
import {App} from '@capacitor/app';
import {Network} from '@capacitor/network';
import {Haptics,NotificationType} from '@capacitor/haptics';
import {mobileDestination} from './policy.js';

if(Capacitor.isNativePlatform()){
 document.documentElement.classList.add('rf-native');
 const banner=document.createElement('div');banner.id='native-network';banner.role='status';banner.hidden=true;banner.textContent='Offline. Cloud sync and account details need a connection.';document.body.prepend(banner);
 const connection=s=>{banner.hidden=s.connected;document.documentElement.classList.toggle('rf-offline',!s.connected);};
 Network.getStatus().then(connection).catch(()=>{});Network.addListener('networkStatusChange',s=>{connection(s);if(s.connected)window.dispatchEvent(new Event('rf:resume'));}).catch(()=>{});
 App.addListener('appStateChange',({isActive})=>window.dispatchEvent(new Event(isActive?'rf:resume':'rf:pause'))).catch(()=>{});
 document.addEventListener('rf:answer',async event=>{try{if(localStorage.getItem('rfHaptics')==='off')return;await Haptics.notification({type:event.detail.correct?NotificationType.Success:NotificationType.Warning});}catch{}});
 // Email/password is the initial native authentication path. Web popup OAuth
 // will be replaced by a native provider flow before it is exposed on iOS.
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('a[href]');if(!link)return;
  const target=mobileDestination(link.getAttribute('href'),location.href);
  if(target){event.preventDefault();event.stopImmediatePropagation();location.assign(target);}
 },true);
 const profile=document.getElementById('profile');if(profile){
  const card=document.createElement('section');card.className='card';card.innerHTML='<h2>App preferences</h2><label><input type="checkbox" id="native-haptics"> Haptic feedback for answers</label><p class="muted" id="native-version"></p>';profile.append(card);
  const toggle=card.querySelector('input');try{toggle.checked=localStorage.getItem('rfHaptics')!=='off';}catch{toggle.checked=true;}toggle.onchange=()=>{try{localStorage.setItem('rfHaptics',toggle.checked?'on':'off');}catch{}};
  App.getInfo().then(info=>card.querySelector('p').textContent=`Version ${info.version} (${info.build})`).catch(()=>{});
 }
}
