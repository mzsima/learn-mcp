// タスクを表すインターフェース
interface Task {
    id: number;
    name: string;
    completed: boolean;
}

// DOM要素の取得
const taskInput = document.getElementById('taskInput') as HTMLInputElement;
const addButton = document.getElementById('addButton') as HTMLButtonElement;
const taskList = document.getElementById('taskList') as HTMLUListElement;

// タスクリスト（localStorageから読み込むか、空の配列で初期化）
let tasks: Task[] = loadTasks();

// ページ読み込み時にタスクを描画
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    // 追加ボタンのクリックイベントリスナー
    addButton.addEventListener('click', addTask);
    // Enterキーでのタスク追加
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });
});

/**
 * localStorageからタスクを読み込む関数
 * @returns {Task[]} 読み込んだタスクの配列
 */
function loadTasks(): Task[] {
    const storedTasks = localStorage.getItem('tasks');
    // storedTasksがnullでない、かつ有効なJSON文字列の場合にパースする
    if (storedTasks) {
        try {
            const parsedTasks = JSON.parse(storedTasks);
            // 配列であり、各要素がTaskの形式を満たしているか簡易チェック
            if (Array.isArray(parsedTasks) && parsedTasks.every(task => typeof task.id === 'number' && typeof task.name === 'string' && typeof task.completed === 'boolean')) {
                return parsedTasks;
            }
        } catch (e) {
            console.error("Error parsing tasks from localStorage:", e);
            // パースエラー時は空配列を返す
            return [];
        }
    }
    // storedTasksがnullまたは無効なJSONの場合は空配列を返す
    return [];
}

/**
 * localStorageにタスクを保存する関数
 */
function saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * タスクリストを描画する関数
 */
function renderTasks(): void {
    // 既存のリストをクリア
    taskList.innerHTML = '';

    // 各タスクについてDOM要素を生成して追加
    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.dataset.id = task.id.toString(); // データ属性としてIDを保持

        // チェックボックス
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleComplete(task.id));

        // タスク名
        const taskName = document.createElement('span');
        taskName.textContent = task.name;

        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        // 完了状態に応じてスタイルを適用
        if (task.completed) {
            listItem.classList.add('completed');
        }

        // 要素をリスト項目に追加
        listItem.appendChild(checkbox);
        listItem.appendChild(taskName);
        listItem.appendChild(deleteButton);

        // リスト項目をul要素に追加
        taskList.appendChild(listItem);
    });
}

/**
 * 新しいタスクを追加する関数
 */
function addTask(): void {
    const taskName = taskInput.value.trim(); // 前後の空白を削除

    // タスク名が空でなければ追加
    if (taskName) {
        const newTask: Task = {
            id: Date.now(), // ユニークなIDとしてタイムスタンプを使用
            name: taskName,
            completed: false
        };
        tasks.push(newTask); // 配列に追加
        saveTasks();         // localStorageに保存
        renderTasks();       // リストを再描画
        taskInput.value = ''; // 入力フィールドをクリア
        taskInput.focus();   // 入力フィールドにフォーカスを戻す
    } else {
        // 空のタスクは追加しない（必要であればアラートなどを表示）
        console.warn("Task name cannot be empty.");
        // alert("タスク名を入力してください。"); // ユーザーへのフィードバック例
    }
}

/**
 * タスクの完了/未完了状態を切り替える関数
 * @param {number} id - 対象タスクのID
 */
function toggleComplete(id: number): void {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();   // localStorageに保存
    renderTasks(); // リストを再描画
}

/**
 * タスクを削除する関数
 * @param {number} id - 対象タスクのID
 */
function deleteTask(id: number): void {
    tasks = tasks.filter(task => task.id !== id); // 対象ID以外のタスクで配列を再構成
    saveTasks();   // localStorageに保存
    renderTasks(); // リストを再描画
}
