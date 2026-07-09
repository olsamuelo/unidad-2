// Puerto del dominio: contrato que debe cumplir cualquier implementación de persistencia.
import { Task } from './task.entity';

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  findAll(): Promise<Task[]>;
  findById(id: number): Promise<Task | null>;
  update(task: Task): Promise<Task>;
  delete(id: number): Promise<boolean>;
}

/** Token de inyección de dependencias para desacoplar el dominio de Prisma. */
export const ITaskRepositoryToken = Symbol('ITaskRepository');
