// Capa de aplicación: caso de uso "crear tarea".
import { Inject, Injectable } from '@nestjs/common';
import type { ITaskRepository } from '../domain/task.repository.interface';
import { ITaskRepositoryToken } from '../domain/task.repository.interface';
import { Task } from '../domain/task.entity';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(ITaskRepositoryToken)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(title: string, description: string): Promise<Task> {
    // id=0 es un placeholder: el repositorio asigna el id real al persistir.
    const task = new Task(0, title, description, 'PENDING', new Date());
    return this.taskRepository.create(task);
  }
}
