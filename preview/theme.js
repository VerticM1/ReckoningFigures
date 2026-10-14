(()=>{
 const key='rfAppearance';const root=document.documentElement;
 const read=()=>{try{return localStorage.getItem(key)==='dark'?'dark':'light'}catch{return 'light'}};
 const apply=value=>{root.dataset.theme=value;root.style.colorScheme=value;const b=document.querySelector('.rf-theme-toggle');if(b){b.textContent=value==='light'?'Dark mode':'Light mode';b.setAttribute('aria-label','Switch to '+(value==='light'?'dark':'light')+' mode');b.setAttribute('aria-pressed',String(value==='dark'));}};
 apply(read());
 document.addEventListener('DOMContentLoaded',()=>{const bar=document.createElement('div');bar.className='rf-appearance';const b=document.createElement('button');b.type='button';b.className='rf-theme-toggle';bar.append(b);document.body.prepend(bar);b.onclick=()=>{const value=root.dataset.theme==='dark'?'light':'dark';apply(value);try{localStorage.setItem(key,value)}catch{}};apply(root.dataset.theme);});
 window.addEventListener('storage',event=>{if(event.key===key||event.key===null)apply(read())});
})();
