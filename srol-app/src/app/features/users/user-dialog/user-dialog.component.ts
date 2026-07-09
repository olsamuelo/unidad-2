import { Component, Inject, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { AppUser, USER_ROLE_LABELS } from '../../../core/models/user.model';
import { UserRole } from '../../../core/models/auth.model';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user?: AppUser;
}

@Component({
  selector: 'app-user-dialog',
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
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss',
})
export class UserDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<UserDialogComponent>);

  readonly saving = signal(false);
  readonly roleOptions: UserRole[] = ['ADMIN', 'USER'];
  readonly roleLabels = USER_ROLE_LABELS;

  /** Evita que un admin se quite su propio rol por accidente al editarse a sí mismo. */
  readonly isEditingSelf = computed(
    () => this.data.mode === 'edit' && this.data.user?.id === this.authService.user()?.id,
  );

  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    role: ['USER' as UserRole, [Validators.required]],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDialogData) {
    if (this.data.mode === 'edit' && this.data.user) {
      this.userForm.patchValue({
        name: this.data.user.name,
        email: this.data.user.email,
        role: this.data.user.role,
      });

      if (this.isEditingSelf()) {
        // No puedes cambiar tu propio rol: se bloquea el control para evitar auto-desadministrarte.
        this.userForm.get('role')?.disable();
      }
    } else {
      // En creación la contraseña es obligatoria; en edición es opcional
      // (solo se envía si el administrador quiere cambiarla).
      this.userForm
        .get('password')
        ?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!control && control.touched && control.invalid;
  }

  onSave(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const { name, email, password, role } = this.userForm.getRawValue();
    this.saving.set(true);

    const request$ = this.isEdit
      ? this.userService.actualizar(this.data.user!.id, {
          name: name!,
          email: email!,
          role: role as UserRole,
          ...(password ? { password } : {}),
        })
      : this.userService.crear({
          name: name!,
          email: email!,
          password: password!,
          role: role as UserRole,
        });

    request$.subscribe({
      next: (user) => {
        this.saving.set(false);
        this.dialogRef.close(user);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.showError(this.mapErrorMessage(error));
      },
    });
  }

  /** Traduce errores comunes del backend a un mensaje claro para el usuario. */
  private mapErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
    }
    if (error.status === 409) {
      return 'Ya existe un usuario con ese correo';
    }

    // NestJS suele devolver { message: string | string[] } en errores de validación (400).
    const backendMessage = error.error?.message;
    if (Array.isArray(backendMessage)) {
      return backendMessage.join(' · ');
    }
    if (typeof backendMessage === 'string') {
      return backendMessage;
    }

    return 'Ocurrió un error al guardar el usuario';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private showError(message: string): void {
    this.snackBar.open(message, '', {
      duration: 4000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
