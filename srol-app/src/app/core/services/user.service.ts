import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  listar(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.baseUrl}/${id}`);
  }

  crear(user: CreateUserRequest): Observable<AppUser> {
    return this.http.post<AppUser>(this.baseUrl, user);
  }

  actualizar(id: number, user: UpdateUserRequest): Observable<AppUser> {
    return this.http.patch<AppUser>(`${this.baseUrl}/${id}`, user);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
