// Capa de aplicación: caso de uso "actualizar tarea".
import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import type { ITaskRepository } from '../domain/task.repository.interface';
import { Task } from '../domain/task.entity';
import { TASK_STATUSES } from '../domain/task-status';
import { GetTaskByIdUseCase } from './get-task-by-id.use-case';
import { ITaskRepositoryToken } from '../domain/task.repository.interface';

type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'status'>>;

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(ITaskRepositoryToken)
    private readonly taskRepository: ITaskRepository,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
  ) {}

  async execute(id: number, updateData: UpdateTaskInput): Promise<Task> {
    // Lanza NotFoundException si la tarea no existe.
    const task = await this.getTaskByIdUseCase.execute(id);

    if (updateData.title?.trim()) {
      task.title = updateData.title.trim();
    }

    if (updateData.description?.trim()) {
      task.description = updateData.description.trim();
    }

    if (updateData.status) {
      if (!TASK_STATUSES.includes(updateData.status)) {
        throw new BadRequestException(
          `Estado inválido: "${updateData.status}". Estados permitidos: ${TASK_STATUSES.join(', ')}`,
        );
      }
      task.status = updateData.status;
    }

    return this.taskRepository.update(task);
  }
}
