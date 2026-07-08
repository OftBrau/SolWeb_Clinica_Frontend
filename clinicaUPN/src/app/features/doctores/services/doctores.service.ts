import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface EspecialidadDTO {
  idEspecialidad: number;
  nombre: string;
  costoExtra: number;
}

export interface Doctor {
  idDoctor: number;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: string;
  telefono: string;
  cmp: string;
  fotoUrl?: string;
  estado: string;
  destacado?: boolean;
}

export interface CrearDoctorData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  especialidad: string;
  cmp?: string;
}

export interface ActualizarDoctorData {
  nombre: string;
  apellido: string;
  telefono: string;
  especialidad: string;
  cmp?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class DoctoresService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/admin/doctores';

  listar(): Observable<Doctor[]> {
    return this.http.get<ApiResponse<Doctor[]>>(this.API)
      .pipe(map(res => res.data));
  }

  crear(data: CrearDoctorData): Observable<void> {
    return this.http.post<void>(this.API, data);
  }

  actualizar(id: number, data: ActualizarDoctorData): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}/activar`, {});
  }

  toggleDestacado(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/destacar`, {});
  }

  listarEspecialidades(): Observable<EspecialidadDTO[]> {
    return this.http.get<ApiResponse<EspecialidadDTO[]>>('http://localhost:8080/api/cita-publica/especialidades')
      .pipe(map(res => res.data));
  }

  actualizarEspecialidad(id: number, especialidad: string): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/especialidad`, { especialidad });
  }

  subirFoto(id: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(`${this.API}/${id}/foto`, formData);
  }

  actualizarCostoEspecialidad(id: number, nombre: string, descripcion: string, costoExtra: number): Observable<void> {
    return this.http.put<void>(`http://localhost:8080/api/admin/especialidades/${id}`, {
      nombre, descripcion, costoExtra, estado: 'ACTIVO'
    });
  }
}
