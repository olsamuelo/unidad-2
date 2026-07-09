import { Module } from '@nestjs/common';
import { CreateTaskUseCase } from '../application/create-task.use-case';
import { GetAllTasksUseCase } from '../application/get-all-tasks.use-case';
import { UpdateTaskUseCase } from '../application/update-task.use-case';
import { GetTaskByIdUseCase } from '../application/get-task-by-id.use-case';
import { DeleteTaskUseCase } from '../application/delete-task.use-case';
import { ITaskRepositoryToken } from '../domain/task.repository.interface';
import { TaskController } from './controllers/task.controller';
import { PostgresTaskRepository } from './persistence/task.repository.postgres';

@Module({
  controllers: [TaskController],
  providers: [
    GetAllTasksUseCase,
    CreateTaskUseCase,
    GetTaskByIdUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    {
      provide: ITaskRepositoryToken,
      useClass: PostgresTaskRepository, // Cambiar aquí si la fuente de datos cambia.
    },
  ],
  exports: [CreateTaskUseCase],
})
export class TasksModule {}
