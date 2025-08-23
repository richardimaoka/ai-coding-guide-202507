import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("./sample.db");

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

const insert = db.prepare("INSERT INTO users (name) VALUES (?)");
insert.run("John Doe");

const select = db.prepare("SELECT * FROM users");
const users = select.all();

console.log("Users:", users);

db.close();
