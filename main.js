const quizData = [];
for (let i = 1; i <= 20; i++) {
  quizData.push({ question: `${i}^2`, answer: (i * i).toString() });
}

// ★ 新しいスプレッドシート（GAS）のURLをここに貼り付けてください
const GAS_URL = 'https://script.google.com/a/macros/tanabe-ed.com/s/AKfycbz-4z0jXl30FeYDBXZLc0Mqq0jaeEW9LX02pcYRLj1uvvHUckA5PlR9CfLV1Ld9SdqC/exec';

let currentQuestionIndex = 0;
let answers = [];
let isSubmitting = false; // 連打・二重送信防止用フラグ
let quizStarted = false;

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  
  quizStarted = true;
  // タブ切り替えとウィンドウのフォーカス外れの両方を監視
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleVisibilityChange);
  
  showQuestion();
});

function showQuestion() {
  if (currentQuestionIndex >= quizData.length) {
    submitAnswers();
    return;
  }
  document.getElementById('question-text').innerHTML = `\\(${quizData[currentQuestionIndex].question}\\) =`;
  document.getElementById('answer-input').value = '';
  
  // MathJax v3用の安全な再レンダリング呼び出し
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise();
  }
}

// 「次へ」ボタン
document.getElementById('next-button').addEventListener('click', function(e) {
  e.preventDefault();
  nextQuestion();
});

// Enterキーの連打・重複防止
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && quizStarted && !isSubmitting) {
    e.preventDefault(); // デフォルトの挙動やボタンのクリックイベント重複を防止
    nextQuestion();
  }
});

function nextQuestion() {
  if (isSubmitting || !quizStarted) return;

  const input = document.getElementById('answer-input').value.trim();
  answers.push(input);
  currentQuestionIndex++;

  if (currentQuestionIndex >= quizData.length) {
    submitAnswers();
  } else {
    showQuestion();
  }
}

// 仮想テンキーの関数（HTMLのonclickから呼ぶためグローバルに登録）
window.insertSymbol = function(sym) {
  if (!quizStarted || isSubmitting) return;
  document.getElementById('answer-input').value += sym;
};

window.backspace = function() {
  if (!quizStarted || isSubmitting) return;
  const input = document.getElementById('answer-input');
  input.value = input.value.slice(0, -1);
};

window.clearInput = function() {
  if (!quizStarted || isSubmitting) return;
  document.getElementById('answer-input').value = '';
};

function handleVisibilityChange() {
  // テストが始まっており、かつ画面が隠れた or フォーカスが外れた場合
  if (quizStarted && (document.visibilityState === 'hidden' || !document.hasFocus())) {
    submitAnswers(true); // 強制終了モードで送信
  }
}

function submitAnswers(isForced = false) {
  if (isSubmitting) return;
  isSubmitting = true;
  quizStarted = false; // イベント監視を実質停止

  // イベントを解除
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("blur", handleVisibilityChange);

  // もし途中で強制終了されたら、残りの問題分を空欄で埋める（データのズレ防止）
  while (answers.length < quizData.length) {
    answers.push(isForced ? "【画面離脱による未解答】" : "");
  }

  // ローディング画面の表示
  const loadingScreen = document.getElementById('loading-screen');
  const loadingText = document.getElementById('loading-text');
  loadingScreen.style.display = 'flex';

  const name = document.getElementById('name').value;
  const grade = document.getElementById('grade').value;

  fetch(GAS_URL, {
    method: 'POST',
    mode: 'no-cors', // GASへのPOSTで発生しやすいCORSエラーを回避
    body: JSON.stringify({
      name,
      grade,
      answers,
      isForced // 強制終了だったかどうかのフラグもGASに送る
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(() => {
    loadingText.innerText = isForced ? '画面離脱が検知されたため、そこまでの解答を送信しました。' : '解答を送信しました。';
    
    setTimeout(() => {
      alert(isForced ? '画面離脱によりテストを終了します。' : 'テストが完了しました。');
      location.reload();
    }, 1000);
  }).catch((err) => {
    console.error(err);
    alert('送信中にエラーが発生しました。先生に報告してください。');
    isSubmitting = false;
    loadingScreen.style.display = 'none';
  });
}  if (currentQuestionIndex >= quizData.length) {
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
