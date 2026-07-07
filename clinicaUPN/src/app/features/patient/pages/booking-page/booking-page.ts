import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../../../core/services/booking.service';
import { DoctorSummaryDTO, TimeSlotDTO, AppointmentDTO } from '../../../../core/models/scheduling.models';
import { MiniCalendarComponent } from '../../../../shared/components/mini-calendar/mini-calendar';
import { TimeSlotChipsComponent } from '../../../../shared/components/time-slot-chips/time-slot-chips';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, MiniCalendarComponent, TimeSlotChipsComponent],
  template: `
    <div class="container py-4">
      <nav class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/app/doctors">Doctores</a></li>
          <li class="breadcrumb-item active">{{ doctor()?.firstName }} {{ doctor()?.lastName }}</li>
        </ol>
      </nav>

      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-body">
              <h5 class="text-center mb-3">Reservar cita</h5>
              <p class="text-center text-muted mb-4">
                Dr. {{ doctor()?.firstName }} {{ doctor()?.lastName }} - {{ doctor()?.specialty }}
              </p>

              <app-mini-calendar
                [availableDates]="availableDates()"
                (dateSelected)="selectDate($event)"
                (monthChanged)="loadDates($event)">
              </app-mini-calendar>

              <div *ngIf="selectedDate()" class="mt-4">
                <hr>
                <h6 class="text-center mb-3">
                  Horarios disponibles — {{ selectedDate() | date:'dd/MM/yyyy' }}
                </h6>
                <app-time-slot-chips
                  [slots]="slots()"
                  [selectedSlot]="selectedSlot()"
                  (slotSelected)="selectSlot($event)">
                </app-time-slot-chips>
              </div>

              <div class="d-grid mt-4">
                <button class="btn btn-primary btn-lg" [disabled]="!selectedSlot()" (click)="confirmBooking()">
                  Reservar cita
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Screen -->
      <div *ngIf="confirmedAppt()" class="row justify-content-center mt-4">
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
  styles: []
})
export class BookingPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  doctor = signal<DoctorSummaryDTO | null>(null);
  availableDates = signal<string[]>([]);
  selectedDate = signal<string>('');
  slots = signal<TimeSlotDTO[]>([]);
  selectedSlot = signal<TimeSlotDTO | null>(null);
  confirmedAppt = signal<AppointmentDTO | null>(null);
  error = '';
  currentMonth = '';

  ngOnInit() {
    const doctorId = Number(this.route.snapshot.params['doctorId']);
    const state = window.history.state?.doctor as DoctorSummaryDTO | undefined;
    if (state) {
      this.doctor.set(state);
      this.initCalendar();
    } else {
      this.bookingService.getDoctors().subscribe({
        next: doctors => {
          const doc = doctors.find(d => d.id === doctorId);
          if (doc) {
            this.doctor.set(doc);
            this.initCalendar();
          }
        }
      });
    }
  }

  private initCalendar() {
    const now = new Date();
    this.currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.loadDates(this.currentMonth);
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
    this.selectedSlot.set(null);
    const doc = this.doctor();
    if (!doc) return;
    this.bookingService.getAvailableSlots(doc.id, date).subscribe({
      next: data => this.slots.set(data.length ? data : this.defaultSlots()),
      error: () => this.slots.set(this.defaultSlots())
    });
  }

  private defaultSlots(): TimeSlotDTO[] {
    const slots: TimeSlotDTO[] = [];
    for (let h = 9; h <= 12; h++) slots.push({ startTime: `${String(h).padStart(2,'0')}:00`, endTime: `${String(h).padStart(2,'0')}:30` });
    for (let h = 14; h <= 17; h++) slots.push({ startTime: `${String(h).padStart(2,'0')}:00`, endTime: `${String(h).padStart(2,'0')}:30` });
    return slots;
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
      },
      error: err => {
        this.error = err.error?.message || 'Error al reservar la cita';
        this.selectedSlot.set(null);
        this.bookingService.getAvailableSlots(doc.id, this.selectedDate()).subscribe({
          next: data => this.slots.set(data)
        });
      }
    });
  }
}
