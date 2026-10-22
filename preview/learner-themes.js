const palettes={
 original:{name:'Original',bg:'#101a24',panel:'#192632',line:'#354654',accent:'#ffd15c',blue:'#5ed8f3'},
 pink:{name:'Pink Fire',bg:'#241322',panel:'#352035',line:'#65405e',accent:'#ffadd6',blue:'#ff8fc5'},
 spring:{name:'Spring',bg:'#10251e',panel:'#1b352a',line:'#3c6250',accent:'#c6ef99',blue:'#8fe5c8'},
 summer:{name:'Summer',bg:'#092630',panel:'#153a44',line:'#3b6370',accent:'#ffdc85',blue:'#7de6ec'},
 autumn:{name:'Autumn',bg:'#281c17',panel:'#3b2b22',line:'#685043',accent:'#ffc18b',blue:'#efb890'},
 winter:{name:'Winter',bg:'#172137',panel:'#23324b',line:'#485b79',accent:'#c5d6ff',blue:'#98dfff'}
};
const season=()=>['winter','winter','spring','spring','spring','summer','summer','summer','autumn','autumn','autumn','winter'][new Date().getMonth()];
let selected='original';try{selected=localStorage.getItem('rfLearnerTheme')||selected;}catch{}
if(!palettes[selected]&&selected!=='seasonal')selected='original';
function apply(){const p=palettes[selected==='seasonal'?season():selected],root=document.documentElement;root.dataset.learnerTheme=selected;for(const [key,value] of Object.entries(p))if(key!=='name')root.style.setProperty('--'+(key==='accent'?'gold':key),value);root.style.setProperty('--flame',p.blue);document.querySelector('meta[name="theme-color"]')?.setAttribute('content',p.bg);}
apply();
export function mountThemePicker(anchor,openDialog){
 const button=document.createElement('button');button.className='learning-plan-link appearance-button';button.textContent='Colors & themes';anchor.after(button);
 button.onclick=()=>{
 openDialog(`<span class="eyebrow">MAKE IT YOURS</span><h2>Colors & themes</h2><p>Choose your homepage colors. Saved on this device.</p><div class="theme-options" role="group" aria-label="Homepage theme">${Object.entries(palettes).map(([key,p])=>`<button data-palette="${key}" aria-pressed="${selected===key}"><span class="theme-swatch" style="background:${p.bg};border-color:${p.accent}"><i style="background:${p.blue}"></i></span>${p.name}</button>`).join('')}<button data-palette="seasonal" aria-pressed="${selected==='seasonal'}">Match the season</button></div><p class="theme-note">Seasonal colors follow Northern Hemisphere seasons. Pick any season yourself, anytime.</p>`);
 document.querySelectorAll('[data-palette]').forEach(choice=>choice.onclick=()=>{selected=choice.dataset.palette;try{localStorage.setItem('rfLearnerTheme',selected);}catch{}apply();document.querySelectorAll('[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.palette===selected)));});
 };
}
