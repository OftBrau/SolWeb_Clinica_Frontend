import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DoctorSummaryDTO, AvailableDateDTO, TimeSlotDTO,
  AppointmentDTO, BookAppointmentRequest
} from '../models/scheduling.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api';

  getDoctors(specialty?: string): Observable<DoctorSummaryDTO[]> {
    let params = new HttpParams();
    if (specialty) params = params.set('specialty', specialty);
    return this.http.get<DoctorSummaryDTO[]>(`${this.API}/doctors`, { params });
  }

  getAvailableDates(doctorId: number, month?: string): Observable<AvailableDateDTO[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    return this.http.get<AvailableDateDTO[]>(`${this.API}/doctors/${doctorId}/available-dates`, { params });
  }

  getAvailableSlots(doctorId: number, date: string): Observable<TimeSlotDTO[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<TimeSlotDTO[]>(`${this.API}/doctors/${doctorId}/available-slots`, { params });
  }

  bookAppointment(request: BookAppointmentRequest): Observable<AppointmentDTO> {
    return this.http.post<AppointmentDTO>(`${this.API}/appointments`, request);
  }
}
