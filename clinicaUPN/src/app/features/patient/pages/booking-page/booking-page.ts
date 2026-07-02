import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../../core/services/booking.service';
import { DoctorSummaryDTO, AvailableDateDTO, TimeSlotDTO, AppointmentDTO } from '../../../../core/models/scheduling.models';
import { MiniCalendarComponent } from '../../../../shared/components/mini-calendar/mini-calendar';
import { TimeSlotChipsComponent } from '../../../../shared/components/time-slot-chips/time-slot-chips';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, MiniCalendarComponent, TimeSlotChipsComponent, ConfirmDialogComponent],
  template: `
    <div class="container py-4">
      <!-- Breadcrumb -->
      <nav class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/app/doctors">Doctores</a></li>
          <li class="breadcrumb-item active">{{ doctor()?.firstName }} {{ doctor()?.lastName }}</li>
        </ol>
      </nav>

      <!-- Stepper -->
      <div class="d-flex justify-content-center mb-4">
        <div class="stepper d-flex gap-3">
          <div class="step" [class.active]="step() === 1" [class.completed]="step() > 1">1. Doctor</div>
          <div class="step" [class.active]="step() === 2" [class.completed]="step() > 2">2. Fecha</div>
          <div class="step" [class.active]="step() === 3" [class.completed]="step() > 3">3. Hora</div>
        </div>
      </div>

      <!-- Step 2: Date Selection -->
      <div *ngIf="step() === 2" class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body text-center">
              <h5>Selecciona una fecha</h5>
              <p class="text-muted">Dr. {{ doctor()?.firstName }} {{ doctor()?.lastName }} - {{ doctor()?.specialty }}</p>
              <app-mini-calendar
                [availableDates]="availableDates()"
                (dateSelected)="selectDate($event)"
                (monthChanged)="loadDates($event)">
              </app-mini-calendar>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Time Slot Selection -->
      <div *ngIf="step() === 3" class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5>Selecciona un horario</h5>
              <p class="text-muted">
                Dr. {{ doctor()?.firstName }} {{ doctor()?.lastName }} -
                {{ selectedDate() | date:'dd/MM/yyyy' }}
              </p>
              <app-time-slot-chips
                [slots]="slots()"
                [selectedSlot]="selectedSlot()"
                (slotSelected)="selectSlot($event)">
              </app-time-slot-chips>
              <div class="d-grid mt-3">
                <button class="btn btn-primary" [disabled]="!selectedSlot()" (click)="showConfirm = true">
                  Confirmar cita
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmation Dialog -->
      <app-confirm-dialog *ngIf="showConfirm"
        title="Confirmar cita"
        [message]="'¿Confirmar cita con Dr. ' + doctor()?.firstName + ' ' + doctor()?.lastName + ' el ' + (selectedDate() | date:'dd/MM/yyyy') + ' a las ' + (selectedSlot()?.startTime || '') + '?'"
        (confirmed)="confirmBooking()"
        (cancelled)="showConfirm = false">
      </app-confirm-dialog>

      <!-- Success Screen -->
      <div *ngIf="confirmedAppt()" class="row justify-content-center">
        <div class="col-md-6">
          <div class="card text-center">
            <div class="card-body py-5">
              <h4 class="text-success mb-3">¡Cita confirmada!</h4>
              <p><strong>Doctor:</strong> {{ confirmedAppt()?.doctorName }}</p>
              <p><strong>Fecha:</strong> {{ confirmedAppt()?.date | date:'dd/MM/yyyy' }}</p>
              <p><strong>Hora:</strong> {{ confirmedAppt()?.startTime }}</p>
              <a routerLink="/app/mis-citas" class="btn btn-primary mt-3">Ver mis citas</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Toast -->
      <div *ngIf="error" class="position-fixed bottom-0 end-0 p-3" style="z-index: 9999;">
        <div class="toast show align-items-center text-bg-danger border-0">
          <div class="d-flex">
            <div class="toast-body">{{ error }}</div>
            <button class="btn-close btn-close-white me-2 m-auto" (click)="error = ''"></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stepper .step { padding: 8px 16px; border-radius: 20px; background: #e9ecef; color: #6c757d; font-size: 0.85rem; }
    .stepper .step.active { background: #1976d2; color: white; }
    .stepper .step.completed { background: #4caf50; color: white; }
  `]
})
export class BookingPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);

  step = signal(1);
  doctor = signal<DoctorSummaryDTO | null>(null);
  availableDates = signal<string[]>([]);
  selectedDate = signal<string>('');
  slots = signal<TimeSlotDTO[]>([]);
  selectedSlot = signal<TimeSlotDTO | null>(null);
  confirmedAppt = signal<AppointmentDTO | null>(null);
  showConfirm = false;
  error = '';
  currentMonth = '';

  ngOnInit() {
    const doctorId = this.route.snapshot.params['doctorId'];
    const state = window.history.state?.doctor;
    if (state) {
      this.doctor.set(state);
      this.step.set(2);
      const now = new Date();
      this.currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      this.loadDates(this.currentMonth);
    }
  }

  loadDates(month: string) {
    this.currentMonth = month;
    const doc = this.doctor();
    if (!doc) return;
    this.bookingService.getAvailableDates(doc.id, month).subscribe({
      next: data => this.availableDates.set(data.map(d => d.date)),
      error: () => {}
    });
  }

  selectDate(date: string) {
    this.selectedDate.set(date);
    const doc = this.doctor();
    if (!doc) return;
    this.bookingService.getAvailableSlots(doc.id, date).subscribe({
      next: data => {
        this.slots.set(data);
        this.step.set(3);
      },
      error: () => {}
    });
  }

  selectSlot(slot: TimeSlotDTO) {
    this.selectedSlot.set(slot);
  }

  confirmBooking() {
    const doc = this.doctor();
    const slot = this.selectedSlot();
    if (!doc || !slot) return;

    this.bookingService.bookAppointment({
      doctorId: doc.id,
      date: this.selectedDate(),
      startTime: slot.startTime
    }).subscribe({
      next: apt => {
        this.confirmedAppt.set(apt);
        this.showConfirm = false;
      },
      error: err => {
        this.showConfirm = false;
        this.error = err.error?.message || 'Error al reservar la cita';
        this.selectedSlot.set(null);
        // Refresh slots
        this.bookingService.getAvailableSlots(doc.id, this.selectedDate()).subscribe({
          next: data => this.slots.set(data)
        });
      }
    });
  }
}
