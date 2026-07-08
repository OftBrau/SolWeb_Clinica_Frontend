import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListaComponent } from '../../components/lista/lista';
import { DetalleComponent } from '../../components/detalle/detalle';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { panelAbierto, crearCitaAbierto, cerrarCrearCita, pacientes } from '../../signals/pacientes.signals';
import { CitaPublicaService, DoctorDisponible, AgendarRequest } from '../../../public/services/cita-publica';

@Component({
  selector: 'app-paciente-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ListaComponent, DetalleComponent, PageHeaderComponent],
  templateUrl: './paciente-page.html',
  styleUrl: './paciente-page.css',
})
export class PacientePageComponent {
  private citaService = inject(CitaPublicaService);

  readonly panelAbierto = panelAbierto;
  readonly crearCitaAbierto = crearCitaAbierto;
  readonly pacientes = pacientes;

  pacienteId = signal<number | null>(null);
  especialidad = signal('');
  medico = signal('');
  fecha = signal('');
  hora = signal('');
  motivo = signal('Consulta general');
  doctores = signal<DoctorDisponible[]>([]);
  loadingDoctores = signal(false);
  saving = signal(false);
  error = signal('');

  readonly slots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  ];

  readonly today = new Date().toISOString().split('T')[0];
  readonly especialidades = [
    'Medicina General',
    'Pediatría',
    'Cardiología',
    'Dermatología',
    'Neurología',
    'Traumatología',
    'Oftalmología',
    'Psicología',
  ];

  onEspecialidadChange(): void {
    this.medico.set('');
    this.doctores.set([]);
    if (!this.especialidad()) return;
    this.loadingDoctores.set(true);
    this.citaService.listarDoctores(this.especialidad()).subscribe({
      next: (docs) => {
        this.doctores.set(docs);
        this.loadingDoctores.set(false);
      },
      error: () => {
        this.loadingDoctores.set(false);
      },
    });
  }

  onSubmit(): void {
    if (!this.pacienteId() || !this.especialidad() || !this.medico() || !this.fecha() || !this.hora()) {
      this.error.set('Completa todos los campos obligatorios.');
      return;
    }
    this.error.set('');
    this.saving.set(true);

    const req: AgendarRequest = {
      idPaciente: this.pacienteId()!,
      especialidad: this.especialidad(),
      medico: this.medico(),
      fecha: this.fecha(),
      hora: this.hora(),
      motivo: this.motivo(),
      tipo: 'PRESENCIAL',
    };

    this.citaService.agendar(req).subscribe({
      next: () => {
        this.saving.set(false);
        this.cerrar();
      },
      error: () => {
        this.error.set('Error al crear la cita. Intenta de nuevo.');
        this.saving.set(false);
      },
    });
  }

  cerrar(): void {
    cerrarCrearCita();
    this.pacienteId.set(null);
    this.especialidad.set('');
    this.medico.set('');
    this.fecha.set('');
    this.hora.set('');
    this.motivo.set('Consulta general');
    this.error.set('');
  }
}
