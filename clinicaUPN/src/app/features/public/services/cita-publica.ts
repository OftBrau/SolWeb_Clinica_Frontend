import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// ============================================================
//  cita-publica.ts
//  src/app/public/services/cita-publica.ts
// ============================================================

export interface PacienteResponse {
  idPaciente: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  codigoEstudiante: string;
}

export interface DoctorDisponible {
  idDoctor: number;
  nombre: string;
  especialidad: string;
  fotoUrl?: string;
  descripcion?: string;
  bibliografia?: string;
}

export interface AgendarRequest {
  idPaciente?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  especialidad: string;
  medico: string;
  fecha: string;
  hora: string;
  motivo?: string;
  tipo?: string;
  fechaNacimiento?: string;
  genero?: string;
}

export interface CitaResponse {
  idCita: number;
  paciente: string;
  doctor: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: string;
  tipo: string;
}

// Envuelve cualquier respuesta del backend: { message, data }
interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CitaPublicaService {
  private http = inject(HttpClient);

  private readonly base = 'http://localhost:8080/api/cita-publica';

  // ── 1. Buscar paciente ──
  buscarPaciente(email: string): Observable<PacienteResponse> {
    const params = new HttpParams()
      .set('email', email);

    return this.http
      .get<ApiResponse<PacienteResponse>>(`${this.base}/buscar-paciente`, { params })
      .pipe(map(r => r.data));
  }

  // ── 2. Listar todos los doctores (landing page) ──
  listarTodosDoctores(): Observable<DoctorDisponible[]> {
    return this.http
      .get<ApiResponse<DoctorDisponible[]>>(`${this.base}/doctores`)
      .pipe(map(r => r.data));
  }

  // ── 3. Listar doctores por especialidad ──
  listarDoctores(especialidad: string): Observable<DoctorDisponible[]> {
    return this.http
      .get<ApiResponse<DoctorDisponible[]>>(
        `${this.base}/doctores/${encodeURIComponent(especialidad)}`
      )
      .pipe(map(r => r.data));
  }

  // ── 3. Agendar cita ──
  agendar(req: AgendarRequest): Observable<CitaResponse> {
    return this.http
      .post<ApiResponse<CitaResponse>>(`${this.base}/agendar`, req)
      .pipe(map(r => r.data));
  }
}