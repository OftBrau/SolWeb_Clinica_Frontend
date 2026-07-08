import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-pago-cita-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center" style="background: var(--bg-body)">

    <div class="text-center p-5" style="max-width:500px">

      @if (estado() === 'success') {
        <div class="mb-3">
          <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
        </div>
        <h4 class="fw-bold mb-2">Pago exitoso!</h4>
        <p class="text-muted mb-4">
          Tu pago ha sido procesado. La cita esta pendiente de asignacion.
          Recibiras una confirmacion cuando el asistente asigne tu doctor.
        </p>
        <a routerLink="/" class="btn btn-primary px-4">Volver al inicio</a>
      }

      @if (estado() === 'failure') {
        <div class="mb-3">
          <i class="bi bi-x-circle-fill text-danger" style="font-size: 5rem;"></i>
        </div>
        <h4 class="fw-bold mb-2">Pago fallido</h4>
        <p class="text-muted mb-4">
          El pago no pudo ser procesado. Intenta nuevamente.
        </p>
        <a routerLink="/" class="btn btn-primary px-4">Volver al inicio</a>
      }

      @if (estado() === 'pending') {
        <div class="mb-3">
          <i class="bi bi-clock-fill text-warning" style="font-size: 5rem;"></i>
        </div>
        <h4 class="fw-bold mb-2">Pago pendiente</h4>
        <p class="text-muted mb-4">
          Tu pago esta siendo procesado. Te notificaremos cuando se confirme.
        </p>
        <a routerLink="/" class="btn btn-primary px-4">Volver al inicio</a>
      }

    </div>

    </div>
  `
})
export class PagoCitaPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  estado = signal<'success' | 'failure' | 'pending'>('success');

  ngOnInit(): void {
    const path = window.location.pathname;
    if (path.includes('fallido')) this.estado.set('failure');
    else if (path.includes('pendiente')) this.estado.set('pending');
    else this.estado.set('success');
  }
}
