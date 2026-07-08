import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  estado: string;
}

export interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: string;
  password?: string;
}

export interface EditarUsuarioRequest {
  nombre: string;
  apellido: string;
  telefono?: string;
}

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/admin/usuarios';

  listar(page: number = 0, size: number = 10): Observable<PageResult<Usuario>> {
    return this.http.get<ApiResponse<PageResult<Usuario>>>(`${this.API}?page=${page}&size=${size}`)
      .pipe(map(res => res.data));
  }

  asignarRol(id: number, rol: string): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/rol`, { rol });
  }

  crear(request: CrearUsuarioRequest): Observable<Usuario> {
    return this.http.post<ApiResponse<Usuario>>(this.API, request)
      .pipe(map(res => res.data));
  }

  editar(id: number, request: EditarUsuarioRequest): Observable<Usuario> {
    return this.http.put<ApiResponse<Usuario>>(`${this.API}/${id}`, request)
      .pipe(map(res => res.data));
  }

  cambiarEstado(id: number, estado: string): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/estado`, { estado });
  }
}
