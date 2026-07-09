import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Task } from '@/task/domain/task.entity';
import { TaskStatus } from '@/task/domain/task-status';
import { ITaskRepository } from '@/task/domain/task.repository.interface';

/** Forma cruda de una fila `Task` tal como la devuelve Prisma. */
interface TaskRow {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
}

/** Implementación de ITaskRepository respaldada por PostgreSQL vía Prisma. */
@Injectable()
export class PostgresTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(task: Task): Promise<Task> {
    const { id: _id, ...data } = task;
    const row = (await this.prisma.task.create({ data })) as TaskRow;
    return this.toDomain(row);
  }

  async findAll(): Promise<Task[]> {
    const rows = (await this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    })) as TaskRow[];

    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number): Promise<Task | null> {
    const row = (await this.prisma.task.findUnique({ where: { id } })) as TaskRow | null;
    return row ? this.toDomain(row) : null;
  }

  async update(task: Task): Promise<Task> {
    const row = (await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
      },
    })) as TaskRow;

    return this.toDomain(row);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.task.delete({ where: { id } });
      return true;
    } catch {
      // Prisma lanza si el registro no existe; lo traducimos a "no se pudo borrar".
      return false;
    }
  }

  /** Convierte una fila plana de Prisma en una instancia real de la entidad Task. */
  private toDomain(row: TaskRow): Task {
    return new Task(row.id, row.title, row.description, row.status as TaskStatus, row.createdAt);
  }
}
