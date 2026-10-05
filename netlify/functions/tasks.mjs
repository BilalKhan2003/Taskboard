// REST API for tasks. Runs as a Netlify Function; data lives in Netlify Database (Postgres).
import { getDatabase } from '@netlify/database';

// Connection is resolved automatically (local dev database or Netlify Database in production).
const db = getDatabase();

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default async (req) => {
  try {
    const url = new URL(req.url);
    const idPart = url.pathname.replace(/^\/api\/tasks\/?/, '');
    const id = idPart ? Number(idPart) : null;
    if (idPart && !Number.isInteger(id)) return json({ error: 'Invalid task id.' }, 400);

    switch (req.method) {
      case 'GET': {
        const rows = await db.sql`SELECT * FROM tasks ORDER BY done, created_at DESC`;
        return json(rows);
      }

      case 'POST': {
        const { title } = await req.json();
        const clean = String(title ?? '').trim().slice(0, 200);
        if (!clean) return json({ error: 'Title is required.' }, 400);
        const [row] = await db.sql`INSERT INTO tasks (title) VALUES (${clean}) RETURNING *`;
        return json(row, 201);
      }

      case 'PATCH': {
        if (!id) return json({ error: 'Task id is required.' }, 400);
        const body = await req.json();
        const title = body.title !== undefined ? String(body.title).trim().slice(0, 200) : null;
        const done = typeof body.done === 'boolean' ? body.done : null;
        if (title === '') return json({ error: 'Title cannot be empty.' }, 400);
        const [row] = await db.sql`
          UPDATE tasks
          SET title = COALESCE(${title}, title),
              done  = COALESCE(${done}, done)
          WHERE id = ${id}
          RETURNING *`;
        return row ? json(row) : json({ error: 'Task not found.' }, 404);
      }

      case 'DELETE': {
        if (!id) return json({ error: 'Task id is required.' }, 400);
        const rows = await db.sql`DELETE FROM tasks WHERE id = ${id} RETURNING id`;
        return rows.length ? json({ deleted: id }) : json({ error: 'Task not found.' }, 404);
      }

      default:
        return json({ error: 'Method not allowed.' }, 405);
    }
  } catch (err) {
    console.error(err);
    return json({ error: 'Something went wrong on the server.' }, 500);
  }
};

export const config = { path: ['/api/tasks', '/api/tasks/:id'] };
