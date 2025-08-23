import { PrismaClient } from '@prisma/client';

export class Database {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async close() {
    await this.prisma.$disconnect();
  }

  async clearAllTodos() {
    await this.prisma.todo.deleteMany();
  }

  async createTodo(title, description = '') {
    return await this.prisma.todo.create({
      data: {
        title,
        description,
      },
    });
  }

  async getTodos() {
    return await this.prisma.todo.findMany({
      orderBy: {
        id: 'desc',
      },
    });
  }

  async getTodoById(id) {
    return await this.prisma.todo.findUnique({
      where: { id },
    });
  }

  async updateTodo(id, updates) {
    try {
      return await this.prisma.todo.update({
        where: { id },
        data: updates,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        // Record not found
        return null;
      }
      throw error;
    }
  }

  async deleteTodo(id) {
    try {
      await this.prisma.todo.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        // Record not found
        return false;
      }
      throw error;
    }
  }
}