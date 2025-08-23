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

    this.db.run(createTableQuery);
  }

  close() {
    this.db.close();
  }

  createTodo(title, description = "") {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO todos (title, description)
        VALUES (?, ?)
      `;

      this.db.run(query, [title, description], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, title, description, completed: false });
        }
      });
    });
  }

  getTodos() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM todos ORDER BY created_at DESC";

      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            rows.map((row) => ({
              ...row,
              completed: Boolean(row.completed),
            }))
          );
        }
      });
    });
  }

  getTodoById(id) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM todos WHERE id = ?";

      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            ...row,
            completed: Boolean(row.completed),
          });
        }
      });
    });
  }

  updateTodo(id, updates) {
    return new Promise((resolve, reject) => {
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
        resolve(null);
        return;
      }

      fields.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE todos SET ${fields.join(", ")} WHERE id = ?`;

      this.db.run(query, values, function (err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          resolve({ id, ...updates });
        }
      });
    });
  }

  deleteTodo(id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM todos WHERE id = ?";

      this.db.run(query, [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}
