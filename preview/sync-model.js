// Per-device grow-only XP counters preserve independently earned offline XP.
const union=(a=[],b=[])=>[...new Set([...a,...b])];
export function prepareProgress(progress,device){
 const p=structuredClone(progress);p.cloud=p.cloud||{xpByDevice:{[device]:Math.max(0,Number(p.xp)||0)}};return p;
}
export function mergeProgress(local,remote={}){
 const a=local.cloud?.xpByDevice||{},b=remote.cloud?.xpByDevice||{},xpByDevice={};
 for(const id of new Set([...Object.keys(a),...Object.keys(b)]))xpByDevice[id]=Math.max(Number(a[id])||0,Number(b[id])||0);
 const completedLessons=union(local.completedLessons,remote.completedLessons);
 return {...local,xp:Object.values(xpByDevice).reduce((sum,x)=>sum+x,0),cloud:{xpByDevice},completedLessons,completed:completedLessons.includes(1),visits:union(local.visits,remote.visits).sort(),practiceDays:union(local.practiceDays,remote.practiceDays).sort(),sessions:Math.max(local.sessions||0,remote.sessions||0)};
}
export function earnXP(progress,amount,device){const p=prepareProgress(progress,device);p.cloud.xpByDevice[device]=(p.cloud.xpByDevice[device]||0)+amount;p.xp=Object.values(p.cloud.xpByDevice).reduce((a,b)=>a+b,0);return p;}
