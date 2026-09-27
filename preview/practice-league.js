import { bolt, brandObject } from './brand-art.js';
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
 const rank=data.rows.findIndex(r=>!r.simulated),above=data.rows[rank-1];
 return `<div class="league"><header class="league-heading"><span class="eyebrow gold">PRACTICE LEAGUE</span><h2>Spark League</h2><p>Simulated opponents · Three-day round</p><span class="round-clock">${Math.ceil((data.ends-now)/3600000)} hours left</span></header><div class="league-showcase">${brandObject('trophy',true)}<p>Small steps. Serious energy.</p></div><div class="league-personal">${bolt('medium')}<span><strong>Your position: #${rank+1}</strong><small>${above?`${above.xp-earned+1} XP to move ahead of ${above.name}`:'You’re leading this practice round.'}</small></span><b>${earned} XP</b></div><ol>${data.rows.map((r,i)=>`<li class="${r.simulated?'':'you'}"><b class="rank-number">${i+1}</b><span class="league-avatar ${r.simulated?'':'your-avatar'}" aria-hidden="true">${r.simulated?r.name.slice(0,1):bolt('medium')}</span><span>${r.name}<small>${r.simulated?'Simulated player':'Your XP this round'}</small></span><strong>${r.xp} XP</strong></li>`).join('')}</ol><p class="account-note">Opponents are simulated, not real people. Their scores update every 6 hours. Practice-league scores stay on this device. No money or prizes are attached.</p></div>`;
}
