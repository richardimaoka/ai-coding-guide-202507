import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Database } from './database.js';

describe('Database CRUD Operations', () => {
  let db;

  beforeEach(() => {
    db = new Database();
  });

  afterEach(() => {
    db.close();
  });

  it('should create a new todo', async () => {
    const todo = await db.createTodo('Test Todo', 'Test Description');
    
    expect(todo).toMatchObject({
      title: 'Test Todo',
      description: 'Test Description',
      completed: false
    });
    expect(todo.id).toBeTypeOf('number');
  });

  it('should get all todos', async () => {
    await db.createTodo('Todo 1', 'Description 1');
    await db.createTodo('Todo 2', 'Description 2');
    
    const todos = await db.getTodos();
    
    expect(todos).toHaveLength(2);
    expect(todos[0].title).toBe('Todo 2'); // Should be ordered by created_at DESC
    expect(todos[1].title).toBe('Todo 1');
  });

  it('should get todo by id', async () => {
    const created = await db.createTodo('Test Todo', 'Test Description');
    const todo = await db.getTodoById(created.id);
    
    expect(todo).toMatchObject({
      id: created.id,
      title: 'Test Todo',
      description: 'Test Description',
      completed: false
    });
  });

  it('should return null for non-existent todo', async () => {
    const todo = await db.getTodoById(999);
    expect(todo).toBeNull();
  });

  it('should update todo title and description', async () => {
    const created = await db.createTodo('Original Title', 'Original Description');
    
    const updated = await db.updateTodo(created.id, {
      title: 'Updated Title',
      description: 'Updated Description'
    });
    
    expect(updated).toMatchObject({
      id: created.id,
      title: 'Updated Title',
      description: 'Updated Description'
    });
    
    const todo = await db.getTodoById(created.id);
    expect(todo.title).toBe('Updated Title');
    expect(todo.description).toBe('Updated Description');
  });

  it('should update todo completion status', async () => {
    const created = await db.createTodo('Test Todo');
    
    const updated = await db.updateTodo(created.id, { completed: true });
    
    expect(updated).toMatchObject({
      id: created.id,
      completed: true
    });
    
    const todo = await db.getTodoById(created.id);
    expect(todo.completed).toBe(true);
  });

  it('should return null when updating non-existent todo', async () => {
    const result = await db.updateTodo(999, { title: 'New Title' });
    expect(result).toBeNull();
  });

  it('should delete todo', async () => {
    const created = await db.createTodo('Test Todo');
    
    const deleted = await db.deleteTodo(created.id);
    expect(deleted).toBe(true);
    
    const todo = await db.getTodoById(created.id);
    expect(todo).toBeNull();
  });

  it('should return false when deleting non-existent todo', async () => {
    const deleted = await db.deleteTodo(999);
    expect(deleted).toBe(false);
  });

  it('should handle empty updates', async () => {
    const created = await db.createTodo('Test Todo');
    
    const result = await db.updateTodo(created.id, {});
    expect(result).toBeNull();
  });
});