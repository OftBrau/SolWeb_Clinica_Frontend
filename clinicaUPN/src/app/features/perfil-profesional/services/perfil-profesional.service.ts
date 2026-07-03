import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PerfilData {
  perfil: {
    idPerfil: number; idPracticante: number; tituloProfesional?: string;
    universidad?: string; anioGraduacion?: number; biografia?: string;
    linkedinUrl?: string; nombreCompleto: string; email: string;
    fotoUrl?: string; bannerUrl?: string; cvUrl?: string;
  };
  certificaciones: Certificacion[];
  experiencias: Experiencia[];
  educaciones: Educacion[];
  habilidades: Habilidad[];
}

export interface Certificacion { id: number; nombre: string; institucion?: string; fechaEmision?: string; fechaVencimiento?: string; archivoUrl?: string; }
export interface Experiencia { id: number; empresa: string; cargo: string; fechaInicio?: string; fechaFin?: string; actualmente?: boolean; descripcion?: string; }
export interface Educacion { id: number; institucion: string; titulo: string; fechaInicio?: string; fechaFin?: string; }
export interface Habilidad { id: number; nombre: string; }

interface ApiR<T> { message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class PerfilProfesionalService {
  private http = inject(HttpClient);
  private BASE = 'http://localhost:8080/api/perfil';

  uploadFoto(file: File): Observable<{url: string}> {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<ApiR<{url: string}>>(`${this.BASE}/foto`, fd).pipe(map(r => r.data));
  }

  getPerfil(): Observable<PerfilData> {
    return this.http.get<ApiR<PerfilData>>(`${this.BASE}/profesional`).pipe(map(r => r.data));
  }

  updatePerfil(data: any): Observable<PerfilData> {
    return this.http.put<ApiR<PerfilData>>(`${this.BASE}/profesional`, data).pipe(map(r => r.data));
  }

  addCert(nombre: string, institucion?: string, fechaEmision?: string, fechaVencimiento?: string, archivoUrl?: string) {
    return this.http.post<ApiR<any>>(`${this.BASE}/profesional/certificaciones`, { nombre, institucion, fechaEmision, fechaVencimiento, archivoUrl }).pipe(map(r => r.data));
  }
  addExp(empresa: string, cargo: string, fechaInicio?: string, fechaFin?: string, actualmente?: boolean, descripcion?: string) {
    return this.http.post<ApiR<any>>(`${this.BASE}/profesional/experiencia`, { empresa, cargo, fechaInicio, fechaFin, actualmente, descripcion }).pipe(map(r => r.data));
  }
  addEdu(institucion: string, titulo: string, fechaInicio?: string, fechaFin?: string) {
    return this.http.post<ApiR<any>>(`${this.BASE}/profesional/educacion`, { institucion, titulo, fechaInicio, fechaFin }).pipe(map(r => r.data));
  }
  addHab(nombre: string) {
    return this.http.post<ApiR<any>>(`${this.BASE}/profesional/habilidades`, { nombre }).pipe(map(r => r.data));
  }
  deleteCert(id: number) { return this.http.delete(`${this.BASE}/profesional/certificaciones/${id}`); }
  deleteExp(id: number) { return this.http.delete(`${this.BASE}/profesional/experiencia/${id}`); }
  deleteEdu(id: number) { return this.http.delete(`${this.BASE}/profesional/educacion/${id}`); }
  deleteHab(id: number) { return this.http.delete(`${this.BASE}/profesional/habilidades/${id}`); }

  getPracticantes(): Observable<any[]> {
    return this.http.get<ApiR<any[]>>(`${this.BASE}/practicantes`).pipe(map(r => r.data));
  }
}
