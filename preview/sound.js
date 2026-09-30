// Original synthesized cues: no downloaded music or media permissions required.
let context, muted=false, active=[];
try { muted=localStorage.getItem('rfSoundMuted')==='true'; } catch {}
export const soundMuted=()=>muted;
export function stopSound(){for(const oscillator of active){try{oscillator.stop();}catch{}}active=[];}
export function toggleSound(){muted=!muted;stopSound();try{localStorage.setItem('rfSoundMuted',String(muted));}catch{}return muted;}
const scores={
 correct:[[659,0,.09],[988,.08,.16]],
 wrong:[[294,0,.13],[247,.12,.18]],
 3:[[523,0,.1],[659,.09,.1],[784,.18,.22]],
 5:[[523,0,.1],[659,.09,.1],[784,.18,.12],[1047,.3,.3]],
 7:[[262,0,.2],[523,.08,.12],[659,.18,.12],[784,.28,.15],[1047,.42,.18],[1319,.55,.38]],
 perfect:[[523,0,.15],[659,.12,.15],[784,.24,.15],[1047,.4,.45],[1319,.4,.45]],
 streak:[[392,.12,.13],[523,.3,.13],[659,.5,.15],[784,.72,.2],[1047,1.02,.5],[1319,1.02,.5]]
};
export function playSound(kind){
 if(muted||!scores[kind])return;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  context||=new Audio();stopSound();
  // Called from answer/continue taps, allowing iOS to unlock audio.
  if(context.state==='suspended')context.resume().catch(()=>{});
  const start=context.currentTime+.025;
  for(const [frequency,delay,duration] of scores[kind]){
   const oscillator=context.createOscillator(),gain=context.createGain();
   oscillator.type=kind==='wrong'?'sine':'triangle';oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(0,start+delay);gain.gain.linearRampToValueAtTime(.065,start+delay+.012);gain.gain.exponentialRampToValueAtTime(.001,start+delay+duration);
   oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start+delay);oscillator.stop(start+delay+duration+.02);
   active.push(oscillator);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();active=active.filter(o=>o!==oscillator);};
  }
 }catch{/* Audio must never block learning. */}
}
export function soundButton(){return `<button class="sound-toggle" aria-label="${muted?'Turn sound on':'Mute sound'}" aria-pressed="${!muted}">${muted?'Sound off':'Sound on'}</button>`;}
export function bindSoundButton(root=document){root.querySelectorAll('.sound-toggle').forEach(button=>button.onclick=()=>{toggleSound();button.outerHTML=soundButton();bindSoundButton(root);});}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSound();});
