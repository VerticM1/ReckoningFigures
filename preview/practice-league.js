// Deliberately simulated competitors; never presented as real users.
export function league(now=Date.now(),earned=0){
 const duration=3*24*60*60*1000,round=Math.floor(now/duration),elapsed=now%duration;
 const names=['Vector','Nova','Orbit','Delta','Prism','Pixel','Comet'];
 const step=Math.floor(elapsed/(6*60*60*1000));
 const rows=names.map((name,i)=>({name,simulated:true,xp:40+((round*17+i*37)%110)+step*(12+(i*7+round)%21)}));
 rows.push({name:'You',simulated:false,xp:earned});rows.sort((a,b)=>b.xp-a.xp||a.name.localeCompare(b.name));
 return {round,ends:(round+1)*duration,rows};
}
export function leagueHTML(progress,now=Date.now()){
 const current=league(now),earned=progress.leagueXP?.[current.round]||0;const data=league(now,earned);
 return `<div class="league"><span class="eyebrow gold">PRACTICE LEAGUE</span><h2>A little friendly competition.</h2><p>These are simulated players, not real people. Earn lesson XP to climb this three-day practice round.</p><small>New round in ${Math.ceil((data.ends-now)/3600000)} hours · Opponent scores update every 6 hours.</small><ol>${data.rows.map((r,i)=>`<li class="${r.simulated?'':'you'}"><b>${i+1}</b><span>${r.name}<small>${r.simulated?'Simulated player':'Your XP this round'}</small></span><strong>${r.xp} XP</strong></li>`).join('')}</ol><p class="account-note">Practice-league scores stay on this device. No money or prizes are attached.</p></div>`;
}
