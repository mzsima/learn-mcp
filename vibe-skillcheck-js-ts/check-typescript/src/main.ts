// タスクを表すインターフェース
interface Task {
    id: number; // ユニークなID
    text: string; // タスクの内容
    completed: boolean; // 完了状態
}

// DOM要素への参照を取得
const taskInput = document.getElementById('taskInput') as HTMLInputElement;
const addButton = document.getElementById('addButton') as HTMLButtonElement;
const taskList = document.getElementById('taskList') as HTMLUListElement;

// タスクリストの配列（localStorageから読み込む）
let tasks: Task[] = loadTasks();

// アプリケーションの初期化：保存されているタスクを読み込んで表示
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    // 追加ボタンのイベントリスナーを設定
    addButton.addEventListener('click', addTask);
    // Enterキーでもタスクを追加できるようにする
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });
});

/**
 * localStorageからタスクを読み込む関数
 * @returns {Task[]} 読み込んだタスクの配列。不正なデータの場合は空配列を返す。
 */
function loadTasks(): Task[] {
    const storedTasks = localStorage.getItem('tasks');
    if (!storedTasks) {
        return []; // ローカルストレージにデータがない場合は空配列
    }
    try {
        const parsedTasks = JSON.parse(storedTasks);
        // パースしたデータが配列であり、各要素が必要なプロパティを持つか検証
        if (Array.isArray(parsedTasks) && parsedTasks.every(task =>
            typeof task === 'object' && task !== null &&
            typeof task.id === 'number' &&
            typeof task.text === 'string' &&
            typeof task.completed === 'boolean'
        )) {
            return parsedTasks as Task[]; // 型アサーションでTask[]として返す
        } else {
            console.warn('localStorageに保存されているタスクデータが無効です。空のリストで開始します。');
            localStorage.removeItem('tasks'); // 無効なデータを削除
            return []; // 無効なデータの場合は空配列
        }
    } catch (error) {
        console.error('localStorageからのタスク読み込み中にエラーが発生しました:', error);
        localStorage.removeItem('tasks'); // パースエラー時もデータを削除
        return []; // エラー時も空配列
    }
}

/**
 * タスクをlocalStorageに保存する関数
 */
function saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * タスクリストをDOMに描画する関数
 */
function renderTasks(): void {
    // 既存のリスト項目をクリア
    taskList.innerHTML = '';

    // tasks配列の各タスクに対してリスト項目を作成
    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.classList.add('task-item');
        listItem.dataset.id = task.id.toString(); // データ属性にIDを設定
        if (task.completed) {
            listItem.classList.add('completed'); // 完了済みのクラスを追加
        }

        // チェックボックスを作成
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

        // タスクテキストを作成
        const taskText = document.createElement('span');
        taskText.classList.add('task-text');
        taskText.textContent = task.text;

        // 削除ボタンを作成
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        // 要素をリスト項目に追加
        listItem.appendChild(checkbox);
        listItem.appendChild(taskText);
        listItem.appendChild(deleteButton);

        // リスト項目をul要素に追加
        taskList.appendChild(listItem);
    });
}

/**
 * 新しいタスクを追加する関数
 */
function addTask(): void {
    const text = taskInput.value.trim(); // 入力値を取得し、前後の空白を削除

    // 入力が空でなければタスクを追加
    if (text !== '') {
        const newTask: Task = {
            id: Date.now(), // 簡易的なユニークIDとしてタイムスタンプを使用
            text: text,
            completed: false,
        };

        // tasks配列に新しいタスクを追加
        tasks.push(newTask);

        // localStorageに保存
        saveTasks();

        // リストを再描画
        renderTasks();

        // 入力フィールドをクリア
        taskInput.value = '';
        taskInput.focus(); // 入力フィールドにフォーカスを戻す
    }
}

/**
 * タスクの完了/未完了状態を切り替える関数
 * @param {number} id 対象タスクのID
 */
function toggleTaskCompletion(id: number): void {
    // tasks配列から該当するタスクを探す
    tasks = tasks.map(task => {
        if (task.id === id) {
            // 完了状態を反転させる
            return { ...task, completed: !task.completed };
        }
        return task;
    });

    // localStorageに保存
    saveTasks();

    // リストを再描画
    renderTasks();
}

/**
 * タスクを削除する関数
 * @param {number} id 対象タスクのID
 */
function deleteTask(id: number): void {
    // tasks配列から該当するタスクを除外する
    tasks = tasks.filter(task => task.id !== id);

    // localStorageに保存
    saveTasks();

    // リストを再描画
    renderTasks();
}
