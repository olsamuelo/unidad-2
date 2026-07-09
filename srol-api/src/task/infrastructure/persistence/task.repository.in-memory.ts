import { Injectable } from '@nestjs/common';
import { Task } from '@/task/domain/task.entity';
import { ITaskRepository } from '@/task/domain/task.repository.interface';

/**
 * Implementación en memoria de ITaskRepository. Útil para pruebas rápidas o
 * desarrollo sin base de datos; no se registra en TaskModule (que usa
 * PostgresTaskRepository), pero se conserva para poder intercambiarla.
 */
@Injectable()
export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Task[] = [];

  async create(task: Task): Promise<Task> {
    this.tasks.push(task);
    return task;
  }

  async findAll(): Promise<Task[]> {
    return this.tasks;
  }

  async findById(id: number): Promise<Task | null> {
    return this.tasks.find((task) => task.id === id) ?? null;
  }

  async update(updateTask: Task): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === updateTask.id);
    this.tasks[index] = updateTask;
    return updateTask;
  }

  async delete(id: number): Promise<boolean> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }
}
