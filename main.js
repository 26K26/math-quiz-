const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}
const GAS_URL = 'https://script.google.com/a/macros/tanabe-ed.com/s/AKfycbz-4z0jXl30FeYDBXZLc0Mqq0jaeEW9LX02pcYRLj1uvvHUckA5PlR9CfLV1Ld9SdqC/exec';
let currentQuestionIndex = 0;
let answers = [];

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  document.addEventListener("visibilitychange", handleVisibilityChange);
  showQuestion();
});

function showQuestion() {
  if (currentQuestionIndex >= quizData.length) {
    submitAnswers();
    return;
  }
  document.getElementById('question-text').innerHTML = `\(${quizData[currentQuestionIndex].question}\) =`;
  document.getElementById('answer-input').value = '';
  MathJax.typeset();
}

document.getElementById('next-button').addEventListener('click', nextQuestion);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') nextQuestion();
});

function nextQuestion() {
  const input = document.getElementById('answer-input').value.trim();
  answers.push(input);
  currentQuestionIndex++;

  if (currentQuestionIndex >= quizData.length) {
    submitAnswers();
  } else {
    showQuestion();
  }
}

function insertSymbol(sym) {
  const input = document.getElementById('answer-input');
  input.value += sym;
}

function backspace() {
  const input = document.getElementById('answer-input');
  input.value = input.value.slice(0, -1);
}

function clearInput() {
  document.getElementById('answer-input').value = '';
}

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    submitAnswers();
  }
}

function submitAnswers() {
  const name = document.getElementById('name').value;
  const grade = document.getElementById('grade').value;
  const cls = document.getElementById('class').value;
  fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      name,
      grade,
      class: cls,
      answers
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(() => {
    alert('解答を送信しました。');
    location.reload();
  });
}
