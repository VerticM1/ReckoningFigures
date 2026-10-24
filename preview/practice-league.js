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
 const gap=above?above.xp-earned+1:0;
 return `<div class="league league-refreshed"><header class="league-heading"><span class="eyebrow">YOUR MOMENTUM</span><h2>Make your mark.</h2><p>Spark practice league · Simulated opponents</p><span class="round-clock">${Math.ceil((data.ends-now)/3600000)} hours left in this round</span></header><section class="league-overview" aria-label="Your round summary"><div><small>YOUR PLACE</small><strong>#${rank+1}</strong></div><div><small>ROUND XP</small><strong>${earned}</strong></div><div><small>NEXT STEP</small><strong>${above?gap+' XP':'Leading'}</strong></div></section><p class="league-nudge">${above?`One figure at a time. You’re ${gap} XP from moving ahead of ${above.name}.`:'You’re setting the pace. Keep practicing at a rhythm that works for you.'}</p><ol aria-label="Practice league standings">${data.rows.map((r,i)=>`<li class="${r.simulated?'':'you'}"><b class="rank-number">${i+1}</b><span class="league-avatar ${r.simulated?'':'your-avatar'}" aria-hidden="true">${r.simulated?r.name.slice(0,1):'RF'}</span><span>${r.name}<small>${r.simulated?'Practice opponent':'Your progress this round'}</small></span><strong>${r.xp}<small>XP</small></strong></li>`).join('')}</ol><p class="account-note">This is a practice leaderboard with simulated opponents, not other students. Scores update every six hours, and each round lasts three days. Your round progress stays on this device.</p></div>`;
}
