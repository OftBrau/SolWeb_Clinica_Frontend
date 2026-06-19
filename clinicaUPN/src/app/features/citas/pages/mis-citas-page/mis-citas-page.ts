import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { CitaService, CitaDTO } from '../../services/cita';
import * as citasState from '../../signals/citas.state';

@Component({
  selector: 'app-mis-citas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './mis-citas-page.html',
  styleUrl: './mis-citas-page.css',
})
export class MisCitasPageComponent implements OnInit {
  private citaService = inject(CitaService);
  private router = inject(Router);

  readonly misCitas = citasState.misCitas;
  readonly cargando = citasState.cargando;
  readonly errorMsg = citasState.errorMsg;
  readonly citasPendientes = citasState.citasPendientes;
  readonly citasCompletadas = citasState.citasCompletadas;

  readonly reprogId = signal<number | null>(null);
  readonly reprogFecha = signal('');
  readonly reprogHora = signal('');
  readonly reprogLoading = signal(false);
  readonly reprogError = signal('');
  readonly cancelandoId = signal<number | null>(null);

  slotsDisponibles = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  ngOnInit() {
    this.cargarCitas();
  }

  irACrearCita() {
    this.router.navigate(['/']);
  }

  cargarCitas() {
    citasState.cargando.set(true);
    citasState.errorMsg.set(null);
    this.citaService.listarMisCitas().subscribe({
      next: (data) => {
        citasState.cargarCitas(data);
        citasState.cargando.set(false);
      },
      error: () => {
        citasState.errorMsg.set('No se pudieron cargar tus citas.');
        citasState.cargando.set(false);
      }
    });
  }

  abrirReprogramar(cita: CitaDTO) {
    this.reprogId.set(cita.idCita!);
    this.reprogFecha.set(cita.fecha);
    this.reprogHora.set(cita.hora);
    this.reprogError.set('');
  }

  cerrarReprogramar() {
    this.reprogId.set(null);
    this.reprogFecha.set('');
    this.reprogHora.set('');
    this.reprogError.set('');
  }

  confirmarReprogramar() {
    if (!this.reprogFecha() || !this.reprogHora()) {
      this.reprogError.set('Selecciona fecha y hora');
      return;
    }
    this.reprogLoading.set(true);
    this.reprogError.set('');
    this.citaService.reprogramar(this.reprogId()!, this.reprogFecha(), this.reprogHora()).subscribe({
      next: (actualizada) => {
        citasState.actualizarCita(actualizada);
        this.cerrarReprogramar();
        this.reprogLoading.set(false);
      },
      error: () => {
        this.reprogError.set('Error al reprogramar. Intenta de nuevo.');
        this.reprogLoading.set(false);
      }
    });
  }

  cancelarCita(id: number) {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    this.cancelandoId.set(id);
    this.citaService.cancelar(id).subscribe({
      next: () => {
        citasState.eliminarCita(id);
        this.cancelandoId.set(null);
      },
      error: () => {
        alert('Error al cancelar la cita.');
        this.cancelandoId.set(null);
      }
    });
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'badge-warning',
      'CONFIRMADA': 'badge-primary',
      'COMPLETADA': 'badge-success',
      'CANCELADA': 'badge-danger',
    };
    return map[estado] || 'badge-secondary';
  }
}
