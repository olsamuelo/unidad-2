import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTaskRequest, Task, UpdateTaskRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  listar(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  crear(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task);
  }

  actualizar(id: number, task: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${id}`, task);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
