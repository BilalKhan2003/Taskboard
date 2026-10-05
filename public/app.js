const API = '/api/tasks';
const list = document.getElementById('list');
const form = document.getElementById('add-form');
const input = document.getElementById('title');
const count = document.getElementById('count');
const empty = document.getElementById('empty');
const errorBox = document.getElementById('error');

let tasks = [];

async function api(path = '', options = {}) {
  const res = await fetch(API + path, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function showError(message) {
  errorBox.textContent = message || '';
  errorBox.hidden = !message;
}

function render() {
  list.innerHTML = '';
  for (const t of tasks) {
    const li = document.createElement('li');
    if (t.done) li.className = 'done';

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = t.done;
    box.setAttribute('aria-label', `Mark "${t.title}" as ${t.done ? 'not done' : 'done'}`);
    box.addEventListener('change', () => run(() => api(`/${t.id}`, {
      method: 'PATCH', body: JSON.stringify({ done: box.checked }),
    })));

    const text = document.createElement('span');
    text.textContent = t.title;

    const del = document.createElement('button');
    del.className = 'del';
    del.type = 'button';
    del.textContent = 'Delete';
    del.setAttribute('aria-label', `Delete "${t.title}"`);
    del.addEventListener('click', () => run(() => api(`/${t.id}`, { method: 'DELETE' })));

    li.append(box, text, del);
    list.append(li);
  }
  const open = tasks.filter((t) => !t.done).length;
  count.textContent = tasks.length ? `${open} open, ${tasks.length - open} done` : '';
  empty.hidden = tasks.length > 0;
}

async function load() {
  tasks = await api();
  render();
}

async function run(action) {
  showError('');
  try {
    await action();
    await load();
  } catch (err) {
    showError(err.message);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  run(async () => {
    await api('', { method: 'POST', body: JSON.stringify({ title }) });
    input.value = '';
  });
});

run(load);
