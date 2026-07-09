import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { TASK_STATUSES } from '../../../domain/task-status';
import type { TaskStatus } from '../../../domain/task-status';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    description: 'El estado de la tarea',
    enum: TASK_STATUSES,
    example: 'PENDING',
    required: false,
  })
  @IsOptional()
  @IsEnum(TASK_STATUSES, {
    message: 'El estado debe ser PENDING, IN_PROGRESS o COMPLETED',
  })
  status?: TaskStatus;
}
