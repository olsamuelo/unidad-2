import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus, TASK_STATUS_LABELS } from '../../../core/models/task.model';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent {
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['id', 'title', 'description', 'status', 'createdAt', 'actions'];
  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly statusLabels = TASK_STATUS_LABELS;

  /** Conteos para las tarjetas de resumen del dashboard (solo presentación). */
  readonly stats = computed(() => {
    const tasks = this.tasks();
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    };
  });

  constructor() {
    this.listar();
  }

  listar(): void {
    this.loading.set(true);
    this.taskService.listar().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showMessage('No se pudieron cargar las tareas', 'error-snackbar');
      },
    });
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '480px',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showMessage('Tarea creada correctamente', 'success-snackbar');
        this.listar();
      }
    });
  }

  onEdit(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '480px',
      data: { mode: 'edit', task },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showMessage('Tarea actualizada correctamente', 'success-snackbar');
        this.listar();
      }
    });
  }

  onDelete(task: Task): void {
    const confirmed = confirm(`¿Deseas eliminar la tarea "${task.title}"?`);
    if (!confirmed) {
      return;
    }

    this.taskService.eliminar(task.id).subscribe({
      next: () => {
        this.showMessage('Tarea eliminada correctamente', 'success-snackbar');
        this.listar();
      },
      error: () => this.showMessage('No se pudo eliminar la tarea', 'error-snackbar'),
    });
  }

  getStatusLabel(status: TaskStatus): string {
    return this.statusLabels[status];
  }

  statusClass(status: TaskStatus): string {
    const classes: Record<TaskStatus, string> = {
      PENDING: 'is-pending',
      IN_PROGRESS: 'is-progress',
      COMPLETED: 'is-completed',
    };
    return classes[status];
  }

  private showMessage(message: string, panelClass: string): void {
    this.snackBar.open(message, '', {
      duration: 4000,
      panelClass: [panelClass],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}