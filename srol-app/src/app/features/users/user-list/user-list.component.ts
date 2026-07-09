import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { AppUser, USER_ROLE_LABELS } from '../../../core/models/user.model';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    NgClass,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['id', 'name', 'email', 'role', 'actions'];
  readonly users = signal<AppUser[]>([]);
  readonly loading = signal(false);
  readonly roleLabels = USER_ROLE_LABELS;

  /** Id del usuario logueado, para evitar que se elimine a sí mismo. */
  readonly currentUserId = computed(() => this.authService.user()?.id);

  /** Conteos para las tarjetas de resumen del dashboard (solo presentación). */
  readonly stats = computed(() => {
    const users = this.users();
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'ADMIN').length,
      normales: users.filter((u) => u.role === 'USER').length,
    };
  });

  constructor() {
    this.listar();
  }

  listar(): void {
    this.loading.set(true);
    this.userService.listar().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        console.error('Error al listar usuarios:', error);
        this.showMessage('No se pudieron cargar los usuarios', 'error-snackbar');
      },
    });
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '480px',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showMessage('Usuario creado correctamente', 'success-snackbar');
        this.listar();
      }
    });
  }

  onEdit(user: AppUser): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '480px',
      data: { mode: 'edit', user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showMessage('Usuario actualizado correctamente', 'success-snackbar');
        this.listar();
      }
    });
  }

  onDelete(user: AppUser): void {
    if (user.id === this.currentUserId()) {
      this.showMessage('No puedes eliminar tu propio usuario', 'error-snackbar');
      return;
    }

    const confirmed = confirm(`¿Deseas eliminar al usuario "${user.name}"?`);
    if (!confirmed) {
      return;
    }

    this.userService.eliminar(user.id).subscribe({
      next: () => {
        this.showMessage('Usuario eliminado correctamente', 'success-snackbar');
        this.listar();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al eliminar usuario:', error);
        const message =
          typeof error.error?.message === 'string'
            ? error.error.message
            : 'No se pudo eliminar el usuario';
        this.showMessage(message, 'error-snackbar');
      },
    });
  }

  getRoleLabel(role: AppUser['role']): string {
    return this.roleLabels[role];
  }

  roleClass(role: AppUser['role']): string {
    return role === 'ADMIN' ? 'is-admin' : 'is-user';
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
