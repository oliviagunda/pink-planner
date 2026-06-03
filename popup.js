// ===== DEFAULT QUOTES (one per day cycling) =====
const DEFAULT_QUOTES = [
  { text: "she believed she could, so she did.", author: "— r.s. grey" },
  { text: "in a world full of trends, remain a classic.", author: "— coco chanel" },
  { text: "do it with passion or not at all.", author: "" },
  { text: "you are enough, a thousand times enough.", author: "— atticus" },
  { text: "be your own kind of beautiful.", author: "" },
  { text: "bloom where you are planted.", author: "" },
  { text: "choose kindness and laugh often.", author: "" },
  { text: "she is clothed in strength and dignity.", author: "— proverbs 31:25" },
  { text: "pretty girls don't have bad days, only bad moments.", author: "" },
  { text: "darling, you are a work of art.", author: "" },
  { text: "life is short, buy the shoes.", author: "" },
  { text: "wake up, be amazing, repeat.", author: "" },
  { text: "be a girl with a mind, a woman with attitude, a lady with class.", author: "" },
  { text: "you glow differently when you are actually happy.", author: "" },
  { text: "collect moments, not things.", author: "" },
  { text: "be so good they can't ignore you.", author: "— steve martin" },
  { text: "always be a first rate version of yourself.", author: "— judy garland" },
  { text: "your vibe attracts your tribe.", author: "" },
  { text: "make today so beautiful that yesterday gets jealous.", author: "" },
  { text: "she turned her can'ts into cans and her dreams into plans.", author: "— kobi yamada" },
  { text: "a little progress each day adds up to big results.", author: "" },
  { text: "you were born to stand out.", author: "" },
  { text: "do small things with great love.", author: "— mother teresa" },
  { text: "wear your confidence like a crown.", author: "" },
  { text: "today is a good day to have a good day.", author: "" },
  { text: "she remembered who she was and the game changed.", author: "— lalah delia" },
  { text: "magic is believing in yourself.", author: "" },
  { text: "always find time for the things that make you feel alive.", author: "" },
  { text: "soft but not weak. kind but not naive.", author: "" },
  { text: "you have exactly the right amount of time to do everything you are meant to do.", author: "" },
  { text: "be the energy you want to attract.", author: "" },
];

// ===== HELPERS =====
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getDateLabel() {
  const d = new Date();
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getDayIndex() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % DEFAULT_QUOTES.length;
}

// ===== STATE =====
let todos = [];
let customQuote = null; // { text, author } or null to use default
let quoteImage = "images/default-photo.jpg"; // URL string or null
let editingQuote = false;

// ===== STORAGE =====
function saveState() {
  chrome.storage.local.set({ todos, customQuote, quoteImage });
}

function loadState(callback) {
  chrome.storage.local.get(['todos', 'customQuote', 'quoteImage'], (data) => {
    todos = data.todos || [];
    customQuote = data.customQuote || null;
    quoteImage = data.quoteImage ?? "images/default-photo.jpg";
    callback();
  });
}

// ===== RENDER DATE =====
function renderDate() {
  document.getElementById('date-label').textContent = getDateLabel();
}

// ===== RENDER QUOTE =====
function renderQuote() {
  const q = customQuote || DEFAULT_QUOTES[getDayIndex()];
  document.getElementById('quote-text').textContent = q.text;
  document.getElementById('quote-author').textContent = q.author;
}

// ===== RENDER IMAGE =====
function renderImage() {
  const frame = document.getElementById('image-frame');
  const img = document.getElementById('quote-image');
  const placeholder = document.getElementById('image-placeholder');
  const removeBtn = document.getElementById('remove-image-btn');

  if (quoteImage) {
    img.src = quoteImage;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    removeBtn.style.display = 'flex';
  } else {
    img.src = '';
    img.style.display = 'none';
    placeholder.style.display = 'flex';
    removeBtn.style.display = 'none';
  }
}

// ===== RENDER TODOS =====
function renderTodos() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';

  if (todos.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="empty-icon">✿</span>
        <p>no tasks yet — you deserve a break! ♡</p>
      </li>`;
    updateProgress(0, 0);
    return;
  }

  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.className = 'todo-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => toggleTodo(index));

    const span = document.createElement('span');
    span.className = 'todo-text' + (todo.done ? ' done' : '');
    span.textContent = todo.text;
    span.addEventListener('click', () => toggleTodo(index));

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '✕';
    del.title = 'Delete';
    del.addEventListener('click', () => deleteTodo(index));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(del);
    list.appendChild(li);
  });

  const done = todos.filter(t => t.done).length;
  updateProgress(done, todos.length);
}

function updateProgress(done, total) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-label').textContent =
    total === 0 ? '✿ all clear!' : `${done} of ${total} done ✓`;
}

// ===== TODO ACTIONS =====
function addTodo(text) {
  if (!text.trim()) return;
  todos.push({ text: text.trim(), done: false });
  saveState();
  renderTodos();
}

function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  saveState();
  renderTodos();
}

function deleteTodo(index) {
  todos.splice(index, 1);
  saveState();
  renderTodos();
}

// ===== QUOTE EDIT =====
function openQuoteEdit() {
  const q = customQuote || DEFAULT_QUOTES[getDayIndex()];
  document.getElementById('quote-input').value = q.text;
  document.getElementById('author-input').value = q.author;
  document.getElementById('quote-display').style.display = 'none';
  document.getElementById('quote-edit-area').style.display = 'block';
  document.getElementById('edit-quote-btn').style.display = 'none';
  document.getElementById('quote-input').focus();
}

function saveQuote() {
  const text = document.getElementById('quote-input').value.trim();
  const author = document.getElementById('author-input').value.trim();
  if (text) {
    customQuote = { text, author };
    saveState();
  }
  closeQuoteEdit();
  renderQuote();
}

function closeQuoteEdit() {
  document.getElementById('quote-display').style.display = 'flex';
  document.getElementById('quote-edit-area').style.display = 'none';
  document.getElementById('edit-quote-btn').style.display = 'block';
}

// ===== IMAGE ACTIONS =====
function setImage(url) {
  if (!url.trim()) return;
  quoteImage = url.trim();
  saveState();
  renderImage();
  document.getElementById('image-url-input').value = '';
}

function removeImage() {
  quoteImage = null;
  saveState();
  renderImage();
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  loadState(() => {
    renderDate();
    renderQuote();
    renderImage();
    renderTodos();
  });

  // Add todo
  const input = document.getElementById('new-todo');
  document.getElementById('add-btn').addEventListener('click', () => {
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTodo(input.value);
      input.value = '';
    }
  });

  // Quote edit
  document.getElementById('edit-quote-btn').addEventListener('click', openQuoteEdit);
  document.getElementById('save-quote-btn').addEventListener('click', saveQuote);
  document.getElementById('cancel-quote-btn').addEventListener('click', () => {
    closeQuoteEdit();
  });

  document.getElementById('quote-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveQuote(); }
    if (e.key === 'Escape') closeQuoteEdit();
  });

  // Image
  document.getElementById('set-image-btn').addEventListener('click', () => {
    setImage(document.getElementById('image-url-input').value);
  });

  document.getElementById('image-url-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') setImage(e.target.value);
  });

  document.getElementById('remove-image-btn').addEventListener('click', removeImage);
});
