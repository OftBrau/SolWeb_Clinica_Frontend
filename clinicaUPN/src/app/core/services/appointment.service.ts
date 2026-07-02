import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentDTO, UpdateStatusRequest } from '../models/scheduling.models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api';

  getDoctorAppointments(from?: string, to?: string): Observable<AppointmentDTO[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<AppointmentDTO[]>(`${this.API}/doctors/me/appointments`, { params });
  }

  updateAppointmentStatus(id: number, status: string): Observable<AppointmentDTO> {
    return this.http.patch<AppointmentDTO>(`${this.API}/doctors/me/appointments/${id}/status`, { status } as UpdateStatusRequest);
  }

  getPatientAppointments(status?: string): Observable<AppointmentDTO[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<AppointmentDTO[]>(`${this.API}/patients/me/appointments`, { params });
  }

  cancelPatientAppointment(id: number): Observable<AppointmentDTO> {
    return this.http.patch<AppointmentDTO>(`${this.API}/patients/me/appointments/${id}/cancel`, {});
  }
}
