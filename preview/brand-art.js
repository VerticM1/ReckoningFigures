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

// Custom silhouettes share the logo's electric blue edges and glossy highlights.
export function energyIcon(kind='flame',size='small'){
 const shapes={
 flame:'<path d="M53 6C64 25 46 36 49 47C59 43 64 33 65 27C91 52 88 84 64 96C35 109 10 89 15 66C18 53 29 44 29 32C36 40 38 47 37 53C45 33 32 23 53 6Z" fill="#087be1" stroke="#42e6ff" stroke-width="6" stroke-linejoin="round"/><path d="M52 20C55 38 37 43 41 64L31 52C17 77 33 96 56 92C77 88 82 65 68 46C65 59 58 66 53 69C46 57 57 41 52 20Z" fill="#16bdf6"/><path d="M50 52C56 67 43 71 48 86C62 89 72 76 64 63L58 74Z" fill="#94f8ff"/><path d="M25 66Q20 80 34 88M45 37L50 26" stroke="#dcffff" stroke-width="3" stroke-linecap="round" fill="none"/><g class="flame-current" fill="none" stroke="#edffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path class="flame-arc arc-one" d="M52 26L43 49L56 46L40 76L52 70L47 88"/><path class="flame-arc arc-two" d="M67 51L58 65L68 63L59 83"/><path class="flame-arc arc-three" d="M30 57L25 70L34 68L31 81"/></g>',

 crystal:'<path d="M30 14H69L89 40L50 94L11 40Z" fill="#ffbd0a" stroke="#07c9f3" stroke-width="7" stroke-linejoin="round"/><path d="M30 14L35 40H65L69 14Z" fill="#fff279"/><path d="M11 40H35L50 94Z" fill="#ff8c06"/><path d="M65 40H89L50 94Z" fill="#ed9400"/><path d="M35 40H65L50 94Z" fill="#ffe325"/><path d="M19 37L32 20H65M35 45L48 80" fill="none" stroke="#fffed6" stroke-width="4" stroke-linecap="round"/>',
 medal:'<path d="M23 9H43L52 43L33 51Z M57 9H77L66 51L48 43Z" fill="#00adf2" stroke="#a4f6ff" stroke-width="3"/><circle cx="50" cy="61" r="31" fill="#ffad05" stroke="#04c6ef" stroke-width="7"/><circle cx="50" cy="61" r="23" fill="#ffe044" stroke="#fff6aa" stroke-width="2"/><path d="M36 61L46 71L65 50" fill="none" stroke="#865008" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 54Q29 42 42 38" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'
 };
 return `<svg class="energy-icon energy-${kind} energy-${size}" viewBox="0 0 100 105" aria-hidden="true" focusable="false"><g class="energy-shape">${shapes[kind]||shapes.flame}</g><path class="energy-star" d="M84 10L86 16L93 18L86 20L84 27L82 20L76 18L82 16Z" fill="#dcfcff"/></svg>`;
}

export function balanceIcon(){return `<svg class="balance-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M24 8V38M10 14H38M17 39H31" fill="none" stroke="#45dfff" stroke-width="4" stroke-linecap="round"/><path d="M10 15L4 29H16ZM38 15L32 29H44Z" fill="#17639c" stroke="#85efff" stroke-width="2" stroke-linejoin="round"/><path d="M4 29Q10 39 16 29M32 29Q38 39 44 29" fill="#ffd85b" stroke="#e6ad29" stroke-width="2"/><path d="M26 3L19 12H25L22 20L31 9H25Z" fill="#ffe779" stroke="#00bce9" stroke-width="1.5"/></svg>`;}
