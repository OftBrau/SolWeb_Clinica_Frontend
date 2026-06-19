import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';

export interface DocumentoHCE {
  idConsulta: number | null;
  idPaciente: number;
  nombrePaciente: string;
  codigoEstudiante: string;
  fecha: string;
  diagnosticoCie10: string;
  descripcionDiag: string;
  tratamiento: string;
  prescripcion: string;
  nombreDoctor: string;
  especialidad: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class HceService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly API = 'http://localhost:8080/api/hce';
  private readonly ADMIN_API = 'http://localhost:8080/api/admin/hce';

  listarDocumentos(): Observable<DocumentoHCE[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.API}/documentos`)
      .pipe(map((res) => res.data.map(item => ({
        ...item,
        idConsulta: item.idConsulta ?? item.id_consulta ?? null
      }))));
  }

  listarTodas(): Observable<DocumentoHCE[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.ADMIN_API}/documentos`)
      .pipe(map((res) => res.data.map(item => ({
        ...item,
        idConsulta: item.idConsulta ?? item.id_consulta ?? null
      }))));
  }

  descargar(id: number): Observable<Blob> {
    return this.http.get(`${this.API}/documentos/${id}/descargar`, {
      responseType: 'blob'
    });
  }

  descargarPdfAdmin(id: number): Observable<Blob> {
    return this.http.get(`${this.ADMIN_API}/documentos/${id}/descargar-pdf`, {
      responseType: 'blob'
    });
  }

  enviarPorEmail(id: number): Observable<void> {
    return this.http.post<void>(`${this.API}/documentos/${id}/enviar`, {});
  }
}
