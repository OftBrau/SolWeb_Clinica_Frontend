import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ConsultorioDTO {
  idConsultorio?: number;
  nombre: string;
  ubicacion: string;
  estado?: string;
}

export interface AsignacionDTO {
  idAsignacion: number;
  idDoctor: number;
  idConsultorio: number;
  consultorio: string;
  doctor: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

interface ApiR<T> { message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class ConsultoriosService {
  private http = inject(HttpClient);
  private BASE = 'http://localhost:8080/api/operaciones/consultorios';

  listar(): Observable<ConsultorioDTO[]> {
    return this.http.get<ApiR<ConsultorioDTO[]>>(this.BASE).pipe(map(r => r.data));
  }

  crear(dto: ConsultorioDTO): Observable<ConsultorioDTO> {
    return this.http.post<ApiR<ConsultorioDTO>>(this.BASE, dto).pipe(map(r => r.data));
  }

  actualizar(id: number, dto: ConsultorioDTO): Observable<ConsultorioDTO> {
    return this.http.put<ApiR<ConsultorioDTO>>(`${this.BASE}/${id}`, dto).pipe(map(r => r.data));
  }

  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.BASE}/${id}/desactivar`, {}).pipe(map(() => undefined));
  }

  activar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.BASE}/${id}/activar`, {}).pipe(map(() => undefined));
  }

  disponibilidad(dia: string, hora: string): Observable<ConsultorioDTO[]> {
    return this.http.get<ApiR<ConsultorioDTO[]>>(`${this.BASE}/disponibles`, {
      params: { diaSemana: dia, hora }
    }).pipe(map(r => r.data));
  }

  ocupacion(fecha: string): Observable<any[]> {
    return this.http.get<ApiR<any[]>>(`${this.BASE}/ocupacion`, {
      params: { fecha }
    }).pipe(map(r => r.data));
  }

  listarAsignaciones(): Observable<AsignacionDTO[]> {
    return this.http.get<ApiR<AsignacionDTO[]>>(`${this.BASE}/asignaciones`).pipe(map(r => r.data));
  }

  asignar(body: any): Observable<void> {
    return this.http.post<ApiR<void>>(`${this.BASE}/asignar`, body).pipe(map(() => undefined));
  }

  eliminarAsignacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/asignaciones/${id}`).pipe(map(() => undefined));
  }
}
