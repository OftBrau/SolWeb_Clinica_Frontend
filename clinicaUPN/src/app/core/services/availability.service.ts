import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AvailabilityTemplateDTO, AvailabilityOverrideDTO, CreateOverrideRequest } from '../models/scheduling.models';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/doctors/me/availability';

  getTemplate(): Observable<AvailabilityTemplateDTO[]> {
    return this.http.get<AvailabilityTemplateDTO[]>(`${this.API}/template`);
  }

  updateTemplate(templates: AvailabilityTemplateDTO[]): Observable<AvailabilityTemplateDTO[]> {
    return this.http.put<AvailabilityTemplateDTO[]>(`${this.API}/template`, templates);
  }

  getOverrides(month?: string): Observable<AvailabilityOverrideDTO[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    return this.http.get<AvailabilityOverrideDTO[]>(`${this.API}/overrides`, { params });
  }

  createOverride(request: CreateOverrideRequest): Observable<AvailabilityOverrideDTO> {
    return this.http.post<AvailabilityOverrideDTO>(`${this.API}/overrides`, request);
  }

  deleteOverride(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/overrides/${id}`);
  }
}
