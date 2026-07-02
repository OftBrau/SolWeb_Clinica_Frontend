import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../../../core/services/booking.service';
import { DoctorSummaryDTO } from '../../../../core/models/scheduling.models';

@Component({
  selector: 'app-doctor-list-page',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">Selecciona un doctor</h2>

      <div class="mb-3">
        <select class="form-select w-auto" (change)="filterBySpecialty($event)">
          <option value="">Todas las especialidades</option>
          <option *ngFor="let spec of specialties()" [value]="spec">{{ spec }}</option>
        </select>
      </div>

      <div class="row">
        <div *ngFor="let doctor of doctors()" class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ doctor.firstName }} {{ doctor.lastName }}</h5>
              <p class="card-text text-muted">{{ doctor.specialty }}</p>
              <button class="btn btn-primary" (click)="selectDoctor(doctor)">
                Ver disponibilidad
              </button>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="doctors().length === 0" class="text-center text-muted py-5">
        No hay doctores disponibles
      </div>
    </div>
  `
})
export class DoctorListPageComponent implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  doctors = signal<DoctorSummaryDTO[]>([]);
  specialties = signal<string[]>([]);
  allDoctors: DoctorSummaryDTO[] = [];

  ngOnInit() {
    this.bookingService.getDoctors().subscribe({
      next: data => {
        this.allDoctors = data;
        this.doctors.set(data);
        this.specialties.set([...new Set(data.map(d => d.specialty))]);
      }
    });
  }

  filterBySpecialty(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (!value) this.doctors.set(this.allDoctors);
    else this.doctors.set(this.allDoctors.filter(d => d.specialty === value));
  }

  selectDoctor(doctor: DoctorSummaryDTO) {
    this.router.navigate(['/app/booking', doctor.id], { state: { doctor } });
  }
}
