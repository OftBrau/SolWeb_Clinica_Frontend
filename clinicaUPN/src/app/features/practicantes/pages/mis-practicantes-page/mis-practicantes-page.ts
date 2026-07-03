import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import {
  DoctorPracticanteService,
  PracticanteAsignado,
  ActividadDTO,
  EvaluacionDTO,
} from '../../services/doctor-practicante.service';

@Component({
  selector: 'app-mis-practicantes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './mis-practicantes-page.html',
  styleUrl: './mis-practicantes-page.css',
})
export class MisPracticantesPageComponent implements OnInit {
  private service = inject(DoctorPracticanteService);
  private http = inject(HttpClient);

  practicantes = signal<PracticanteAsignado[]>([]);
  actividades = signal<ActividadDTO[]>([]);
  evaluaciones = signal<EvaluacionDTO[]>([]);
  loading = signal(true);
  error = signal('');
  successMsg = signal('');
  activeTab = signal<'practicantes' | 'actividades' | 'evaluaciones'>('practicantes');

  // Modal actividad
  modalActividadVisible = signal(false);
  formActividad = signal<{ idPracticante: number; titulo: string; descripcion: string; tipo: string; fecha: string; hora: string; idPaciente?: number; idCita?: number; idTeleconsulta?: number }>({
    idPracticante: 0, titulo: '', descripcion: '', tipo: 'CONSULTA', fecha: '', hora: '' });
  citasDelDia = signal<any[]>([]);

  // Modal evaluación
  modalEvalVisible = signal(false);
  formEval = signal<{ idPracticante: number; puntuacion: number; comentario: string }>({
    idPracticante: 0,
    puntuacion: 5,
    comentario: '',
  });

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.loading.set(true);
    this.service.listarMisPracticantes().subscribe({
      next: (p) => {
        this.practicantes.set(p);
        this.service.listarActividades().subscribe({
          next: (a) => this.actividades.set(a),
        });
        this.service.listarEvaluaciones().subscribe({
          next: (e) => this.evaluaciones.set(e),
          complete: () => this.loading.set(false),
        });
      },
      error: () => {
        this.error.set('Error al cargar datos');
        this.loading.set(false);
      },
    });
  }

  abrirActividad(p: PracticanteAsignado): void {
    this.formActividad.set({
      idPracticante: p.idPracticante, titulo: '', descripcion: '', tipo: 'CONSULTA',
      fecha: new Date().toISOString().split('T')[0], hora: ''
    });
    this.modalActividadVisible.set(true);
    // Cargar citas del día
    this.http.get<{data: any[]}>(`http://localhost:8080/api/consultas/agenda?fecha=${this.formActividad().fecha}`)
      .subscribe(r => this.citasDelDia.set(r.data || []));
  }

  cargarCitas() {
    const f = this.formActividad().fecha;
    if (!f) return;
    this.http.get<{data: any[]}>(`http://localhost:8080/api/consultas/agenda?fecha=${f}`)
      .subscribe(r => this.citasDelDia.set(r.data || []));
  }

  cerrarModalActividad(): void {
    this.modalActividadVisible.set(false);
  }

  guardarActividad(): void {
    const f = this.formActividad();
    if (!f.titulo || !f.tipo) return;
    this.service.crearActividad({
      idPracticante: f.idPracticante,
      titulo: f.titulo, descripcion: f.descripcion, tipo: f.tipo,
      fecha: f.fecha || undefined, hora: f.hora || undefined,
      idPaciente: f.idPaciente || undefined,
      idCita: f.idCita || undefined,
      idTeleconsulta: f.idTeleconsulta || undefined,
    }).subscribe({
      next: () => {
        this.successMsg.set('Actividad creada');
        this.cerrarModalActividad();
        this.service.listarActividades().subscribe(a => this.actividades.set(a));
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => this.error.set(err.error?.message || 'Error al crear actividad'),
    });
  }

  abrirEvaluacion(p: PracticanteAsignado): void {
    this.formEval.set({
      idPracticante: p.idPracticante,
      puntuacion: 5,
      comentario: '',
    });
    this.modalEvalVisible.set(true);
  }

  cerrarModalEval(): void {
    this.modalEvalVisible.set(false);
  }

  guardarEvaluacion(): void {
    const f = this.formEval();
    this.service.evaluarPracticante({
      idPracticante: f.idPracticante,
      puntuacion: f.puntuacion,
      comentario: f.comentario,
    }).subscribe({
      next: () => {
        this.successMsg.set('Evaluación registrada');
        this.cerrarModalEval();
        this.service.listarEvaluaciones().subscribe(e => this.evaluaciones.set(e));
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => this.error.set(err.error?.message || 'Error al evaluar'),
    });
  }
}
