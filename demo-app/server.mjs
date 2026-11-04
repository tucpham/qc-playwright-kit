// Tiny demo app so the kit can be tried end-to-end without a real project.
// Team task list: login, add task, mark done, delete (admin only). In-memory, no dependencies.
import http from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.DEMO_PORT ?? 4173);
const USERS = {
  admin: { password: 'admin123', role: 'admin' },
  user: { password: 'user123', role: 'user' },
};
const sessions = new Map(); // token -> username
const todos = new Map(); // id -> { id, title, done, createdBy }

const send = (res, status, body, headers = {}) => {
  const isJson = typeof body !== 'string';
  res.writeHead(status, {
    'content-type': isJson ? 'application/json' : 'text/html; charset=utf-8',
    ...headers,
  });
  res.end(isJson ? JSON.stringify(body) : body);
};

const readJson = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

const currentUser = (req) => {
  const bearer = req.headers.authorization?.replace(/^Bearer /, '');
  const cookie = /(?:^|;\s*)session=([^;]+)/.exec(req.headers.cookie ?? '')?.[1];
  const username = sessions.get(bearer ?? cookie);
  return username ? { username, role: USERS[username].role } : null;
};

const page = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${title}</title><style>
body{font-family:system-ui;max-width:560px;margin:40px auto;padding:0 16px}
li{display:flex;gap:8px;align-items:center;padding:4px 0}
label{flex:1} [role=alert]{color:#b00020} [role=status]{color:#0a7a2f;min-height:1.2em}
</style></head><body>${body}</body></html>`;

const loginHtml = page(
  'Sign in',
  `<h1>Sign in</h1>
<form id="f">
  <p><label>Username <input name="username" autocomplete="username"></label></p>
  <p><label>Password <input name="password" type="password" autocomplete="current-password"></label></p>
  <button type="submit">Sign in</button>
  <p id="err" role="alert"></p>
</form>
<script>
document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const r = await fetch('/api/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(fd)) });
  if (r.ok) location.href = '/';
  else document.getElementById('err').textContent = (await r.json()).error;
});
</script>`,
);

const appHtml = (user) =>
  page(
    'Tasks',
    `<h1>Tasks</h1>
<p>Signed in as <strong>${user.username}</strong> (${user.role})</p>
<form id="add" novalidate>
  <label for="title">New task</label> <input id="title">
  <button type="submit">Add</button>
  <p id="err" role="alert"></p>
</form>
<div role="status" id="toast"></div>
<ul aria-label="Task list" id="list"></ul>
<script>
const isAdmin = ${user.role === 'admin'};
const list = document.getElementById('list');
const toast = (m) => { document.getElementById('toast').textContent = m; };
function render(t) {
  const li = document.createElement('li');
  li.dataset.testid = 'task-' + t.id;
  const label = document.createElement('label');
  const cb = document.createElement('input');
  cb.type = 'checkbox'; cb.checked = t.done;
  cb.addEventListener('change', () => fetch('/api/todos/' + t.id, { method: 'PATCH', body: JSON.stringify({ done: cb.checked }) }));
  label.append(cb, ' ', t.title);
  li.append(label);
  if (isAdmin) {
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      const r = await fetch('/api/todos/' + t.id, { method: 'DELETE' });
      if (r.ok) { li.remove(); toast('Task deleted'); }
    });
    li.append(del);
  }
  list.append(li);
}
fetch('/api/todos').then((r) => r.json()).then((items) => items.forEach(render));
document.getElementById('add').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('title');
  const err = document.getElementById('err');
  err.textContent = '';
  if (!input.value.trim()) { err.textContent = 'Task title is required'; return; }
  // small artificial delay: realistic async UI, punishes tests that do not wait properly
  await new Promise((r) => setTimeout(r, 150));
  const r = await fetch('/api/todos', { method: 'POST', body: JSON.stringify({ title: input.value }) });
  const t = await r.json();
  render(t); toast('Task "' + t.title + '" added'); input.value = '';
});
</script>`,
  );

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const user = currentUser(req);
  const idMatch = /^\/api\/todos\/([\w-]+)$/.exec(url.pathname);

  if (url.pathname === '/health') return send(res, 200, { ok: true });
  if (req.method === 'GET' && url.pathname === '/login') return send(res, 200, loginHtml);
  if (req.method === 'GET' && url.pathname === '/') {
    return user ? send(res, 200, appHtml(user)) : send(res, 302, '', { location: '/login' });
  }

  if (req.method === 'POST' && url.pathname === '/api/login') {
    const { username, password } = await readJson(req);
    if (!USERS[username] || USERS[username].password !== password) {
      return send(res, 401, { error: 'Invalid username or password' });
    }
    const token = randomUUID();
    sessions.set(token, username);
    return send(res, 200, { token, role: USERS[username].role }, {
      'set-cookie': `session=${token}; Path=/; HttpOnly; SameSite=Lax`,
    });
  }

  if (url.pathname.startsWith('/api/') && !user) return send(res, 401, { error: 'Unauthorized' });

  if (req.method === 'GET' && url.pathname === '/api/todos') return send(res, 200, [...todos.values()]);
  if (req.method === 'POST' && url.pathname === '/api/todos') {
    const title = String((await readJson(req)).title ?? '').trim();
    if (!title) return send(res, 400, { error: 'Task title is required' });
    const todo = { id: randomUUID(), title, done: false, createdBy: user.username };
    todos.set(todo.id, todo);
    return send(res, 201, todo);
  }
  if (idMatch) {
    const todo = todos.get(idMatch[1]);
    if (!todo) return send(res, 404, { error: 'Not found' });
    if (req.method === 'GET') return send(res, 200, todo);
    if (req.method === 'PATCH') {
      const { done } = await readJson(req);
      todo.done = Boolean(done);
      return send(res, 200, todo);
    }
    if (req.method === 'DELETE') {
      if (user.role !== 'admin') return send(res, 403, { error: 'Only admins can delete tasks' });
      todos.delete(todo.id);
      return send(res, 204, '');
    }
  }
  return send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log(`Demo app on http://localhost:${PORT}`));
