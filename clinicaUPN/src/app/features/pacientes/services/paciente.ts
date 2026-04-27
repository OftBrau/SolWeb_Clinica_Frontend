import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PacienteDTO {
  idPaciente?: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  telefono?: string;
  estado?: string;
  codigoEstudiante?: string;
  fechaNacimiento: string;
  genero: string;
  tipoSangre?: string;
  alergias?: string;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private readonly BASE_URL = 'http://localhost:8080/api/pacientes';

  constructor(private http: HttpClient) {}

  listar(page = 0, size = 10): Observable<PageResult<PacienteDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResult<PacienteDTO>>>(this.BASE_URL, { params })
      .pipe(map(res => res.data));
  }

  buscarPorId(id: number): Observable<PacienteDTO> {
    return this.http.get<ApiResponse<PacienteDTO>>(`${this.BASE_URL}/${id}`)
      .pipe(map(res => res.data));
  }

  registrar(dto: PacienteDTO): Observable<PacienteDTO> {
    return this.http.post<ApiResponse<PacienteDTO>>(this.BASE_URL, dto)
      .pipe(map(res => res.data));
  }

  actualizar(id: number, dto: PacienteDTO): Observable<PacienteDTO> {
    return this.http.put<ApiResponse<PacienteDTO>>(`${this.BASE_URL}/${id}`, dto)
      .pipe(map(res => res.data));
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/${id}`)
      .pipe(map(() => void 0));
  }
}