import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PracticanteAsignado {
  idAsignacion: number;
  idPracticante: number;
  idSupervisor: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  emailUsuario: string;
  nombreDoctor: string;
  apellidoDoctor: string;
}

export interface ActividadDTO {
  idActividad: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha: string;
  hora: string;
  estado: string;
  paciente: string;
  supervisor: string;
}

export interface EvaluacionDTO {
  idEvaluacion: number;
  fecha: string;
  puntuacion: number;
  comentario: string;
  supervisor: string;
}

export interface CrearActividadData {
  idPracticante: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha?: string;
  hora?: string;
  idPaciente?: number;
}

export interface CrearEvaluacionData {
  idPracticante: number;
  puntuacion: number;
  comentario: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class DoctorPracticanteService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/doctor/practicantes';

  listarMisPracticantes(): Observable<PracticanteAsignado[]> {
    return this.http.get<ApiResponse<PracticanteAsignado[]>>(`${this.API}/mis-practicantes`)
      .pipe(map(res => res.data));
  }

  listarActividades(): Observable<ActividadDTO[]> {
    return this.http.get<ApiResponse<ActividadDTO[]>>(`${this.API}/actividades`)
      .pipe(map(res => res.data));
  }

  crearActividad(data: CrearActividadData): Observable<ActividadDTO> {
    return this.http.post<ApiResponse<ActividadDTO>>(`${this.API}/actividades`, data)
      .pipe(map(res => res.data));
  }

  listarEvaluaciones(): Observable<EvaluacionDTO[]> {
    return this.http.get<ApiResponse<EvaluacionDTO[]>>(`${this.API}/evaluaciones`)
      .pipe(map(res => res.data));
  }

  evaluarPracticante(data: CrearEvaluacionData): Observable<EvaluacionDTO> {
    return this.http.post<ApiResponse<EvaluacionDTO>>(`${this.API}/evaluaciones`, data)
      .pipe(map(res => res.data));
  }
}
