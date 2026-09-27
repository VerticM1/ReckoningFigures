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

// Distinct silhouettes share the logo's amber core, cyan rim and white highlights.
export function energyIcon(kind='flame',size='small'){
 const shapes={
 flame:'<path d="M52 7C60 29 42 32 47 47C56 44 62 36 62 29C91 53 86 87 60 94C30 105 10 83 17 61C20 51 28 45 29 35C32 41 35 46 35 49C40 31 31 23 52 7Z" fill="#ffac08" stroke="#03c9f5" stroke-width="7" stroke-linejoin="round"/><path d="M51 20C51 35 34 43 40 62C34 59 29 55 28 51C15 77 36 96 58 87C77 79 77 57 66 45C62 61 58 65 52 68C47 54 57 47 51 20Z" fill="#ffe72c"/><path d="M47 63C50 74 39 76 45 87C58 89 64 79 60 70C58 77 54 77 53 76Z" fill="#fff9b0"/><path d="M26 63Q19 78 32 85M43 41Q50 32 49 28" stroke="#efffff" stroke-width="3" stroke-linecap="round" fill="none"/>',
 crystal:'<path d="M30 14H69L89 40L50 94L11 40Z" fill="#ffbd0a" stroke="#07c9f3" stroke-width="7" stroke-linejoin="round"/><path d="M30 14L35 40H65L69 14Z" fill="#fff279"/><path d="M11 40H35L50 94Z" fill="#ff8c06"/><path d="M65 40H89L50 94Z" fill="#ed9400"/><path d="M35 40H65L50 94Z" fill="#ffe325"/><path d="M19 37L32 20H65M35 45L48 80" fill="none" stroke="#fffed6" stroke-width="4" stroke-linecap="round"/>',
 medal:'<path d="M23 9H43L52 43L33 51Z M57 9H77L66 51L48 43Z" fill="#00adf2" stroke="#a4f6ff" stroke-width="3"/><circle cx="50" cy="61" r="31" fill="#ffad05" stroke="#04c6ef" stroke-width="7"/><circle cx="50" cy="61" r="23" fill="#ffe044" stroke="#fff6aa" stroke-width="2"/><path d="M36 61L46 71L65 50" fill="none" stroke="#865008" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 54Q29 42 42 38" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'
 };
 return `<svg class="energy-icon energy-${kind} energy-${size}" viewBox="0 0 100 105" aria-hidden="true" focusable="false"><g class="energy-shape">${shapes[kind]||shapes.flame}</g><path class="energy-star" d="M84 10L86 16L93 18L86 20L84 27L82 20L76 18L82 16Z" fill="#dcfcff"/></svg>`;
}
