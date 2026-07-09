import { Component, Inject, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../../core/services/task.service';
import { Task, TASK_STATUS_LABELS, TaskStatus } from '../../../core/models/task.model';

export interface TaskDialogData {
  mode: 'create' | 'edit';
  task?: Task;
}

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss',
})
export class TaskDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<TaskDialogComponent>);

  readonly saving = signal(false);
  readonly statusOptions: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  readonly statusLabels = TASK_STATUS_LABELS;

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    status: ['PENDING' as TaskStatus],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: TaskDialogData) {
    if (this.data.mode === 'edit' && this.data.task) {
      this.taskForm.patchValue({
        title: this.data.task.title,
        description: this.data.task.description,
        status: this.data.task.status,  // ← Carga el estado actual
      });
    }
  }

  get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  isInvalid(controlName: string): boolean {
    const control = this.taskForm.get(controlName);
    return !!control && control.touched && control.invalid;
  }

  onSave(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const { title, description, status } = this.taskForm.getRawValue();
    
    // Debug: Verifica qué valores se están enviando
    console.log('📤 Enviando:', { title, description, status, mode: this.data.mode });

    this.saving.set(true);

    if (this.isEdit) {
      const updateData: { title: string; description: string; status: TaskStatus } = {
        title: title!,
        description: description!,
        status: status as TaskStatus,  // ← Asegura el tipo correcto
      };
      
      console.log('🔄 Actualizando tarea:', this.data.task!.id, updateData);
      
      this.taskService.actualizar(this.data.task!.id, updateData).subscribe({
        next: (task) => {
          console.log('✅ Tarea actualizada:', task);
          this.saving.set(false);
          this.dialogRef.close(task);
        },
        error: (error) => {
          console.error('❌ Error al actualizar:', error);
          this.saving.set(false);
          this.snackBar.open('Ocurrió un error al guardar la tarea', '', {
            duration: 4000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    } else {
      this.taskService.crear({ title: title!, description: description! }).subscribe({
        next: (task) => {
          console.log('✅ Tarea creada:', task);
          this.saving.set(false);
          this.dialogRef.close(task);
        },
        error: (error) => {
          console.error('❌ Error al crear:', error);
          this.saving.set(false);
          this.snackBar.open('Ocurrió un error al guardar la tarea', '', {
            duration: 4000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}