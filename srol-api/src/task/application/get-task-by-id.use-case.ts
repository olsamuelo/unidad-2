// Capa de aplicación: caso de uso "obtener tarea por id".
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ITaskRepository } from '../domain/task.repository.interface';
import { Task } from '../domain/task.entity';
import { ITaskRepositoryToken } from '../domain/task.repository.interface';

@Injectable()
export class GetTaskByIdUseCase {
  constructor(
    @Inject(ITaskRepositoryToken)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(id: number): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`La tarea ${id} no existe`);
    }

    return task;
  }
}
