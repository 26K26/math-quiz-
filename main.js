body {
  font-family: Arial, sans-serif;
  text-align: center;
  margin: 20px;
}
#keypad button {
  margin: 3px;
  padding: 10px;
  font-size: 16px;
  width: 50px; /* 押しやすいように幅を固定 */
}
#answer-input {
  font-size: 20px;
  width: 200px;
  margin: 10px;
  text-align: center;
}
#next-button {
  margin-top: 15px;
  padding: 10px 20px;
  font-size: 16px;
}    window.MathJax.typesetPromise();
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
