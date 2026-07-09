// Capa de dominio: el modelo de datos puro, sin dependencias de framework ni ORM.
import { TaskStatus } from './task-status';

export class Task {
  constructor(
    public readonly id: number,
    public title: string,
    public description: string,
    public status: TaskStatus,
    public createdAt: Date,
  ) {}

  /** Regla de negocio simple: marcar la tarea como finalizada. */
  complete(): void {
    this.status = 'COMPLETED';
  }
}
