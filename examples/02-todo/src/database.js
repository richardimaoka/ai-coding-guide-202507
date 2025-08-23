import { DatabaseSync } from "node:sqlite";

const dbPath = "./todos.db";

export class Database {
  constructor() {
    this.db = new DatabaseSync(dbPath);
    this.init();
  }

  init() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.exec(createTableQuery);
  }

  close() {
    this.db.close();
  }

  clearAllTodos() {
    const stmt = this.db.prepare("DELETE FROM todos");
    stmt.run();
  }

  createTodo(title, description = "") {
    const query = `
      INSERT INTO todos (title, description, created_at)
      VALUES (?, ?, datetime('now'))
    `;

    const stmt = this.db.prepare(query);
    const result = stmt.run(title, description);
    return { id: result.lastInsertRowid, title, description, completed: false };
  }

  getTodos() {
    const query = "SELECT * FROM todos ORDER BY id DESC";
    const stmt = this.db.prepare(query);
    const rows = stmt.all();
    return rows.map((row) => ({
      ...row,
      completed: Boolean(row.completed),
    }));
  }

  getTodoById(id) {
    const query = "SELECT * FROM todos WHERE id = ?";
    const stmt = this.db.prepare(query);
    const row = stmt.get(id);
    if (!row) {
      return null;
    }
    return {
      ...row,
      completed: Boolean(row.completed),
    };
  }

  updateTodo(id, updates) {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push("title = ?");
      values.push(updates.title);
    }

    if (updates.description !== undefined) {
      fields.push("description = ?");
      values.push(updates.description);
    }

    if (updates.completed !== undefined) {
      fields.push("completed = ?");
      values.push(updates.completed ? 1 : 0);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const query = `UPDATE todos SET ${fields.join(", ")} WHERE id = ?`;
    const stmt = this.db.prepare(query);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return null;
    }
    return { id, ...updates };
  }

  deleteTodo(id) {
    const query = "DELETE FROM todos WHERE id = ?";
    const stmt = this.db.prepare(query);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
