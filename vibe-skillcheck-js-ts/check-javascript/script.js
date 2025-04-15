// DOM要素の取得
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');

// タスクを格納する配列 (localStorageから読み込む)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// タスクリストを描画する関数
function renderTasks() {
    // リストをクリア
    taskList.innerHTML = '';

    // tasks配列の各タスクに対して要素を作成
    tasks.forEach((task, index) => {
        const li = document.createElement('li');

        // チェックボックス
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleComplete(index)); // 完了/未完了切り替え

        // タスク名 (span)
        const span = document.createElement('span');
        span.textContent = task.text;
        if (task.completed) {
            span.classList.add('completed'); // 完了済みクラスを追加
        }

        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => deleteTask(index)); // 削除処理

        // li要素に各要素を追加
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteButton);

        // ul要素にli要素を追加
        taskList.appendChild(li);
    });
}

// タスクを追加する関数
function addTask() {
    const taskText = taskInput.value.trim(); // 前後の空白を削除

    // 入力が空でなければタスクを追加
    if (taskText !== '') {
        tasks.push({ text: taskText, completed: false }); // 新しいタスクを配列に追加
        taskInput.value = ''; // 入力フィールドをクリア
        saveTasks(); // localStorageに保存
        renderTasks(); // リストを再描画
    } else {
        alert('タスクを入力してください。'); // 空の場合はアラート
    }
}

// タスクの完了/未完了を切り替える関数
function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed; // 状態を反転
    saveTasks(); // localStorageに保存
    renderTasks(); // リストを再描画
}

// タスクを削除する関数
function deleteTask(index) {
    tasks.splice(index, 1); // 配列からタスクを削除
    saveTasks(); // localStorageに保存
    renderTasks(); // リストを再描画
}

// タスクをlocalStorageに保存する関数
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// イベントリスナーの設定
addButton.addEventListener('click', addTask);
// Enterキーでもタスクを追加できるようにする
taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// 初期描画（ページ読み込み時にlocalStorageからタスクを読み込んで表示）
renderTasks();
