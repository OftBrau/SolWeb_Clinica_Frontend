import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Asignacion {
  idAsignacion: number;
  idPracticante: number;
  idSupervisor: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  emailUsuario: string;
  nombreDoctor: string;
  apellidoDoctor: string;
}

export interface PracticanteDisponible {
  idPracticante: number;
  nombre: string;
  apellido: string;
  email: string;
}

export interface AsignarRequest {
  idPracticante: number;
  idSupervisor: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AdminPracticanteService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/admin/practicantes';
  private readonly DOCTORES_API = 'http://localhost:8080/api/admin/doctores';

  listarAsignaciones(): Observable<Asignacion[]> {
    return this.http.get<ApiResponse<Asignacion[]>>(this.API)
      .pipe(map(res => res.data));
  }

  listarDisponibles(): Observable<PracticanteDisponible[]> {
    return this.http.get<ApiResponse<PracticanteDisponible[]>>(`${this.API}/disponibles`)
      .pipe(map(res => res.data));
  }

  listarDoctores(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(this.DOCTORES_API)
      .pipe(map(res => res.data));
  }

  asignar(data: AsignarRequest): Observable<void> {
    return this.http.post<void>(`${this.API}/asignar`, data);
  }

  eliminar(idAsignacion: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${idAsignacion}`);
  }
}
