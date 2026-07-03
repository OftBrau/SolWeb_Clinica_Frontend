import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MedicamentoDTO {
  idMedicamento?: number;
  nombreComercial: string;
  nombreGenerico?: string;
  presentacion?: string;
  concentracion?: string;
  laboratorio?: string;
  stock: number;
  precioUnitario: number;
  requiereReceta?: boolean;
  descripcion?: string;
  fotoUrl?: string;
  fechaVencimiento?: string;
  activo?: boolean;
  categoria?: string;
}

export interface CarritoItemDTO {
  idCarrito?: number;
  idMedicamento: number;
  nombreComercial: string;
  precioUnitario: number;
  categoria?: string;
  cantidad: number;
  subtotal: number;
}

export interface VentaResponseDTO {
  idVenta: number;
  idPaciente: number;
  fechaVenta: string;
  total: number;
  estado: string;
  metodoPago: string;
  idPreferenciaMp?: string;
  idPagoMp?: string;
  initPoint?: string;
  detalles: DetalleVentaDTO[];
}

export interface DetalleVentaDTO {
  idDetalle: number;
  idMedicamento: number;
  nombreComercial: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ReclamacionDTO {
  idReclamacion?: number;
  idPaciente?: number;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  tipo: string;
  descripcion: string;
  productoServicio?: string;
  estado: string;
  respuesta?: string;
  fechaCreacion?: string;
  fechaRespuesta?: string;
}

export interface CrearReclamacionRequest {
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  tipo: string;
  descripcion: string;
  productoServicio?: string;
}

export interface CrearVentaRequest {
  items: { idMedicamento: number; cantidad: number }[];
}

interface ApiResponse<T> { message: string; data: T; }
interface PageResult<T> { content: T[]; totalElements: number; page: number; totalPages: number; }

@Injectable({ providedIn: 'root' })
export class FarmaciaService {
  private http = inject(HttpClient);
  private readonly BASE = 'http://localhost:8080/api/farmacia';

  medicamentos = {
    listar: (page = 0, size = 12) => {
      const p = new HttpParams().set('page', page).set('size', size);
      return this.http.get<ApiResponse<PageResult<MedicamentoDTO>>>(`${this.BASE}/medicamentos`, { params: p })
        .pipe(map(r => r.data));
    },
    activos: () => this.http.get<ApiResponse<MedicamentoDTO[]>>(`${this.BASE}/medicamentos/activos`)
      .pipe(map(r => r.data)),
    buscar: (id: number) => this.http.get<ApiResponse<MedicamentoDTO>>(`${this.BASE}/medicamentos/${id}`)
      .pipe(map(r => r.data)),
    crear: (dto: MedicamentoDTO) => this.http.post<ApiResponse<MedicamentoDTO>>(`${this.BASE}/medicamentos`, dto)
      .pipe(map(r => r.data)),
    actualizar: (id: number, dto: MedicamentoDTO) =>
      this.http.put<ApiResponse<MedicamentoDTO>>(`${this.BASE}/medicamentos/${id}`, dto).pipe(map(r => r.data)),
    desactivar: (id: number) => this.http.delete<ApiResponse<any>>(`${this.BASE}/medicamentos/${id}`)
  };

  httpPostFoto(id: number, fd: FormData) {
    return this.http.post(`${this.BASE}/medicamentos/${id}/foto`, fd);
  }

  carrito = {
    listar: () => this.http.get<ApiResponse<CarritoItemDTO[]>>(`${this.BASE}/carrito`).pipe(map(r => r.data)),
    contar: () => this.http.get<ApiResponse<number>>(`${this.BASE}/carrito/count`).pipe(map(r => r.data)),
    agregar: (idMedicamento: number, cantidad: number) =>
      this.http.post<ApiResponse<CarritoItemDTO>>(`${this.BASE}/carrito`, { idMedicamento, cantidad }).pipe(map(r => r.data)),
    actualizar: (id: number, cantidad: number) =>
      this.http.put<ApiResponse<CarritoItemDTO>>(`${this.BASE}/carrito/${id}`, { cantidad }).pipe(map(r => r.data)),
    eliminar: (id: number) => this.http.delete<ApiResponse<any>>(`${this.BASE}/carrito/${id}`),
    vaciar: () => this.http.delete<ApiResponse<any>>(`${this.BASE}/carrito`)
  };

  ventas = {
    checkout: (request: CrearVentaRequest) =>
      this.http.post<ApiResponse<VentaResponseDTO>>(`${this.BASE}/ventas/checkout`, request).pipe(map(r => r.data)),
    misVentas: () => this.http.get<ApiResponse<VentaResponseDTO[]>>(`${this.BASE}/ventas`).pipe(map(r => r.data)),
    buscar: (id: number) => this.http.get<ApiResponse<VentaResponseDTO>>(`${this.BASE}/ventas/${id}`).pipe(map(r => r.data))
  };

  reclamaciones = {
    listar: (page = 0, size = 10) => {
      const p = new HttpParams().set('page', page).set('size', size);
      return this.http.get<ApiResponse<PageResult<ReclamacionDTO>>>(`${this.BASE}/reclamaciones`, { params: p })
        .pipe(map(r => r.data));
    },
    buscar: (id: number) => this.http.get<ApiResponse<ReclamacionDTO>>(`${this.BASE}/reclamaciones/${id}`).pipe(map(r => r.data)),
    misReclamaciones: () => this.http.get<ApiResponse<ReclamacionDTO[]>>(`${this.BASE}/reclamaciones/mis-reclamaciones`).pipe(map(r => r.data)),
    crear: (req: CrearReclamacionRequest) => this.http.post<ApiResponse<ReclamacionDTO>>(`${this.BASE}/reclamaciones`, req).pipe(map(r => r.data)),
    crearAnonimo: (req: CrearReclamacionRequest) => this.http.post<ApiResponse<ReclamacionDTO>>(`${this.BASE}/reclamaciones/publico`, req).pipe(map(r => r.data)),
    responder: (id: number, estado: string, respuesta: string) =>
      this.http.put<ApiResponse<ReclamacionDTO>>(`${this.BASE}/reclamaciones/${id}/responder`, { estado, respuesta }).pipe(map(r => r.data))
  };
}
