// Motion remains decorative: no answer or navigation depends on an animation finishing.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => motionPreference.matches;
motionPreference.addEventListener?.('change', () => {
  if (!reduced()) return;
  document.getAnimations?.().forEach(animation => animation.cancel());
  document.querySelectorAll('.answer-spark').forEach(spark => spark.remove());
});
function move(el, frames, options = {}) {
  if (!el || reduced() || !el.animate) return null;
  return el.animate(frames, { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)', ...options });
}
export function selectMotion(el) {
  move(el, [{ transform: 'scale(.97) translateY(2px)' }, { transform: 'scale(1.018)' }, { transform: 'scale(1)' }], { duration: 240 });
}
export function animateEntrance() {
  const equation = document.querySelector('.equation-text');
  if (equation) {
    // Text nodes keep the original equation intact, including operators and spacing.
    const text = equation.textContent;
    equation.textContent = '';
    text.split(/(\s+)/).forEach((token, index) => {
      const span = document.createElement('span');
      span.textContent = token;
      span.className = 'math-token';
      span.setAttribute('aria-hidden', 'true');
      equation.append(span);
      if (token.trim()) move(span, [
        { opacity: 0, transform: 'translateY(16px) scale(.85)' },
        { opacity: 1, transform: 'translateY(-3px) scale(1.04)', offset: .75 },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], { duration: 380, delay: Math.min(index * 30, 180), fill: 'backwards' });
    });
  }
  document.querySelectorAll('.choice,.answer').forEach((el, index) => {
    move(el, [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 320, delay: 100 + index * 55, fill: 'backwards' });
  });
}
export function transitionQuestion(next) {
  const question = document.querySelector('.question');
  const animation = move(question, [
    { opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(-22px)' }
  ], { duration: 160, easing: 'ease-in' });
  if (!animation) { next(); return; }
  let advanced = false;
  const done = () => { if (!advanced) { advanced = true; clearTimeout(fallback); next(); } };
  const fallback = setTimeout(done, 220);
  animation.finished.then(done, done);
}
export function answerMotion(correct, combo) {
  const footer = document.querySelector('.lesson-footer');
  footer.classList.toggle('success-panel', correct);
  footer.classList.toggle('retry-panel', !correct);
  move(footer, [{ opacity: .55, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 290 });
  const badge = document.querySelector('.combo');
  badge.textContent = `ϟ ${combo}`;
  badge.setAttribute('aria-label', `${combo} correct answers in a row`);
  badge.classList.toggle('charged', combo >= 3);
  const equation = document.querySelector('.equation');
  if (!correct) {
    move(document.querySelector('.answer') || document.querySelector('.selected'),
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 260 });
    return;
  }
  move(document.querySelector('.selected') || document.querySelector('.answer'),
    [{ transform: 'scale(1)' }, { transform: 'scale(1.025)' }, { transform: 'scale(1)' }], { duration: 350 });
  move(equation, [{ borderColor: '#2b3b49' }, { borderColor: '#9cdeac', boxShadow: '0 0 30px #9cdeac25' }, { borderColor: '#2b3b49' }], { duration: 600 });
  move(badge, [{ transform: 'scale(1)' }, { transform: 'scale(1.22)' }, { transform: 'scale(1)' }], { duration: 420 });
  const reward = document.querySelector('.energy-reward');
  reward.textContent = combo >= 3 ? `ϟ ${combo} IN A ROW · +10 XP` : 'ϟ +10 XP';
  // The XP reflects the existing ten points per solved question; no extra combo reward.
  reward.classList.add('visible');
  move(reward, [
    { opacity: 0, transform: 'translate(-50%, 14px) scale(.65)' },
    { opacity: 1, transform: 'translate(-50%, -4px) scale(1.08)', offset: .7 },
    { opacity: 1, transform: 'translate(-50%, 0) scale(1)' }
  ], { duration: 430 });
  if (reduced()) return;
  const rect = equation.getBoundingClientRect();
  const count = combo >= 3 ? 14 : 7;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('span');
    spark.className = 'answer-spark';
    spark.setAttribute('aria-hidden', 'true');
    spark.style.left = `${rect.left + rect.width / 2}px`;
    spark.style.top = `${rect.top + rect.height / 2}px`;
    spark.style.background = i % 2 ? 'var(--blue)' : 'var(--gold)';
    document.body.append(spark);
    const angle = Math.PI * 2 * i / count;
    const distance = Math.min(rect.width / 2, 105);
    move(spark, [
      { opacity: 1, transform: 'translate(0,0) scale(1)' },
      { opacity: 0, transform: `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * 65}px) scale(.2)` }
    ], { duration: 650, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => spark.remove(), 700);
  }
}
