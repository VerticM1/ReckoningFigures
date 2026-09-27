// Shared brand artwork: the original transparent mark on glossy blue-and-gold objects.
// Decorative images are hidden from screen readers; each widget supplies its own text label.
export const bolt=(size='small')=>`<img class="rf-bolt rf-bolt-${size}" src="assets/brand-transparent.png" alt="" aria-hidden="true">`;
export function brandObject(kind,active=false){
 return `<span class="rf-object rf-${kind} ${active?'is-charged':''}" aria-hidden="true"><span class="rf-object-shadow"></span><span class="rf-object-body"><span class="rf-object-shine"></span>${kind==='battery'?'<span class="rf-charge-cells"><i></i><i></i><i></i></span>':''}${bolt('object')}</span>${kind==='trophy'?'<span class="rf-trophy-stem"></span><span class="rf-trophy-base"></span>':''}<span class="rf-glint">✦</span></span>`;
}
export function homeWidgets(progress,lessons,today){
 const charged=progress.practiceDays.includes(today);
 const targets=lessons.filter(l=>l.available).slice(0,3);
 const count=targets.filter(l=>progress.completedLessons.includes(l.id)).length;
 const unlocked=targets.length>0&&count===targets.length;
 return `<div class="energy-widgets"><button class="energy-widget ${charged?'widget-earned':''}" id="daily-charge">${brandObject('battery',charged)}<span class="widget-copy"><span class="eyebrow">DAILY CHARGE</span><strong>${charged?'Fully charged!':'One lesson. Power up.'}</strong><span>${charged?'Today’s practice is complete':'Complete a lesson today'}</span><span class="widget-meter" aria-hidden="true"><i style="width:${charged?100:0}%"></i></span><small>${charged?'1 / 1 lesson':'0 / 1 lesson'} · View streak →</small></span></button><button class="energy-widget ${unlocked?'widget-earned':''}" id="checkpoint-vault">${brandObject('vault',unlocked)}<span class="widget-copy"><span class="eyebrow">CHECKPOINT VAULT</span><strong>${unlocked?'First Spark unlocked':'Your first spark awaits'}</strong><span>First 3 available figures in this unit</span><span class="widget-meter" aria-hidden="true"><i style="width:${count/Math.max(1,targets.length)*100}%"></i></span><small>${count} / ${targets.length} complete · ${unlocked?'View badge':'View goal'} →</small></span></button></div>`;
}
export function checkpointHTML(progress,lessons){
 const targets=lessons.filter(l=>l.available).slice(0,3),unlocked=targets.every(l=>progress.completedLessons.includes(l.id));
 return `<div class="checkpoint-detail">${brandObject('vault',unlocked)}<span class="eyebrow gold">UNIT CHECKPOINT</span><h2>${unlocked?'First Spark is yours.':'Light your first spark.'}</h2><p>Complete these three figures to earn this unit’s First Spark badge.</p><ul>${targets.map(l=>`<li><span>${progress.completedLessons.includes(l.id)?'✓':'○'}</span> ${l.title}</li>`).join('')}</ul>${unlocked?`<div class="spark-badge">${bolt('medium')}<strong>First Spark</strong><span>Three figures. A strong beginning.</span></div>`:'<p class="muted">Your badge lights up here when all three are complete.</p>'}</div>`;
}
