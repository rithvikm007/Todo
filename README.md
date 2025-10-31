# Mini Todo (In-Memory + JWT)

This is a very small example todo API using Node.js, Express, in-memory storage, and JWT-based auth.

Features
- Register / Login (returns JWT)
- CRUD todos (title + body) stored per user in memory with incremental IDs
- Simple, zero-database, zero-file-I/O setup

Files
- `index.js` — server entry
- `routes/auth.js` — register/login with in-memory user storage
- `routes/todos.js` — CRUD endpoints, protected with JWT, in-memory todo storage

Install

Open PowerShell in this folder and run:

```powershell
npm install
```

Run

Set a strong JWT secret in your environment for production. For local dev you can skip and the app will use a development secret.

```powershell
npm start
```

Endpoints (examples using curl)

Register:

```bash
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"username":"alice","password":"s3cret"}'
```

Login:

```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"alice","password":"s3cret"}'
```

Create todo (replace TOKEN):

```bash
curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d '{"title":"Buy milk","body":"2 liters"}'
```

List todos:

```bash
curl -X GET http://localhost:3000/todos -H "Authorization: Bearer TOKEN"
```

Notes
- This is intentionally minimal. In-memory storage means all data is lost on server restart — it's meant for learning and quick demos.
- Change the `JWT_SECRET` environment variable before deploying or sharing.
- User IDs and Todo IDs are simple incremental integers (1, 2, 3, ...)

Next steps (suggestions)
- Add simple validation and rate-limiting
- Swap in-memory storage for a proper database (SQLite, PostgreSQL, MongoDB, etc.) when needed
