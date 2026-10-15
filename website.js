const form = document.querySelector('#sample-form');
const answer = document.querySelector('#answer');
const feedback = document.querySelector('#feedback');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!answer.value.trim()) return;
  const correct = Number(answer.value) === 4;
  feedback.textContent = correct ? 'Exactly! Subtract 6 to get 3x = 12, then divide by 3. x = 4.' : 'Try another step: subtract 6 from both sides to get 3x = 12. What is 12 ÷ 3?';
  answer.setAttribute('aria-invalid', String(!correct));
  document.querySelector('.progress i').style.width = correct ? '100%' : '65%';
});
