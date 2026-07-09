// Capa de aplicación: caso de uso "listar todas las tareas".
import { Inject, Injectable } from '@nestjs/common';
import type { ITaskRepository } from '../domain/task.repository.interface';
import { ITaskRepositoryToken } from '../domain/task.repository.interface';
import { Task } from '../domain/task.entity';

@Injectable()
export class GetAllTasksUseCase {
  constructor(
    @Inject(ITaskRepositoryToken)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }
}
