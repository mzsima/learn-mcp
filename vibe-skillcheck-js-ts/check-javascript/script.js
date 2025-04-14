// DOM要素の取得
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-button');
const taskList = document.getElementById('task-list');

// タスクを格納する配列 (localStorageから読み込む)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// 初期表示時にlocalStorageからタスクを読み込んで表示する関数
function loadTasks() {
    // taskListをクリア
    taskList.innerHTML = '';
    // tasks配列の各タスクを描画
    tasks.forEach(task => renderTask(task));
}

// タスクをlocalStorageに保存する関数
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 新しいタスクをリストに追加する関数
function addTask() {
    const taskText = taskInput.value.trim(); // 入力値を取得し、前後の空白を削除

    // 入力が空の場合は処理を中断
    if (taskText === '') {
        alert('タスクを入力してください。'); // または何らかのフィードバック
        return;
    }

    // 新しいタスクオブジェクトを作成
    const newTask = {
        id: Date.now(), // ユニークなIDとしてタイムスタンプを使用
        text: taskText,
        completed: false
    };

    // tasks配列に新しいタスクを追加
    tasks.push(newTask);

    // localStorageに保存
    saveTasks();

    // 新しいタスクをDOMに描画
    renderTask(newTask);

    // 入力フィールドを空にする
    taskInput.value = '';
}

// タスクをDOMに描画する関数
function renderTask(task) {
    // li要素を作成
    const listItem = document.createElement('li');
    listItem.setAttribute('data-id', task.id); // data属性にIDを設定

    // チェックボックスを作成
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    // チェックボックスの状態変更イベント
    checkbox.addEventListener('change', () => toggleTask(task.id));

    // タスク名を表示するspan要素を作成
    const taskSpan = document.createElement('span');
    taskSpan.textContent = task.text;
    if (task.completed) {
        taskSpan.classList.add('completed'); // 完了状態ならcompletedクラスを追加
    }

    // 削除ボタンを作成
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    // 削除ボタンのクリックイベント
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    // li要素に各要素を追加
    listItem.appendChild(checkbox);
    listItem.appendChild(taskSpan);
    listItem.appendChild(deleteButton);

    // ul要素にli要素を追加
    taskList.appendChild(listItem);
}

// タスクの完了/未完了を切り替える関数
function toggleTask(taskId) {
    // tasks配列から該当タスクを検索
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed }; // completed状態を反転
        }
        return task;
    });

    // localStorageに保存
    saveTasks();

    // DOMを再描画（特定の要素だけ更新する方が効率的だが、簡単のため全体を再描画）
    loadTasks(); // 再描画して打ち消し線などを反映
}

// タスクを削除する関数
function deleteTask(taskId) {
    // tasks配列から該当タスクを除外
    tasks = tasks.filter(task => task.id !== taskId);

    // localStorageに保存
    saveTasks();

    // DOMから該当タスクのli要素を削除
    const listItem = taskList.querySelector(`li[data-id="${taskId}"]`);
    if (listItem) {
        taskList.removeChild(listItem);
    }
}

// イベントリスナーの設定
// 「追加」ボタンクリック時
addButton.addEventListener('click', addTask);
// 入力フィールドでEnterキー押下時
taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// 初期タスクの読み込みと表示
loadTasks();
