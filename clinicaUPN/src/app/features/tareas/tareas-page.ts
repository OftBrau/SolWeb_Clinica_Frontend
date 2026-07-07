import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-tareas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div style="max-width:1320px;margin:0 auto">
      <app-page-header
        title="Mis Tareas"
        subtitle="Gestión de tareas y actividades asignadas"
        icon="bi-list-check"
        [breadcrumbs]="[
          { label: 'Inicio', link: '/app' },
          { label: 'Mis Tareas' }
        ]">
        @if (mostrarAsignar()) {
          <div class="d-flex gap-2">
            <input class="form-control form-control-sm" placeholder="Título" [(ngModel)]="nuevaTarea.titulo" style="width:200px">
            <select class="form-select form-select-sm" [(ngModel)]="nuevaTarea.tipo" style="width:130px">
              <option value="CONSULTA">Consulta</option><option value="TELECONSULTA">Teleconsulta</option>
              <option value="EVALUACION">Evaluación</option><option value="OTRO">Otro</option>
            </select>
            <select class="form-select form-select-sm" [(ngModel)]="nuevaTarea.idPracticante" style="width:140px">
              @for (p of practicantes(); track p.idPracticante) { <option [value]="p.idPracticante">{{ p.nombre }}</option> }
            </select>
            <input type="date" class="form-control form-control-sm" [(ngModel)]="nuevaTarea.fechaLimite" style="width:140px">
            <button class="btn btn-sm btn-primary" (click)="asignarTarea()">Asignar</button>
          </div>
        }
      </app-page-header>

      <div class="row g-3">
        @for (col of columns; track col.key) {
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-header fw-bold">{{ col.label }}
                <span class="badge bg-secondary ms-1">{{ tareasPorEstado(col.key).length }}</span>
              </div>
              <div class="card-body p-2">
                @for (t of tareasPorEstado(col.key); track t.idTarea) {
                  <div class="card mb-2 border shadow-sm">
                    <div class="card-body p-2">
                      <strong style="font-size:.9rem">{{ t.titulo }}</strong>
                      <div class="d-flex gap-1 mt-1">
                        <span class="badge" [class.bg-info]="t.tipo==='CONSULTA'" [class.bg-primary]="t.tipo==='TELECONSULTA'" [class.bg-warning]="t.tipo==='EVALUACION'" style="font-size:.65rem">{{ t.tipo }}</span>
                        <span class="badge text-bg-light" style="font-size:.65rem">{{ t.prioridad }}</span>
                      </div>
                      @if (t.fecha_limite) { <small class="text-muted d-block"><i class="bi bi-calendar me-1"></i>{{ t.fecha_limite }}</small> }
                      <div class="d-flex gap-1 mt-2">
                        @if (col.key === 'PENDIENTE') {
                          <button class="btn btn-sm btn-outline-primary w-100" (click)="cambiarEstado(t.idTarea, 'EN_PROGRESO')">Iniciar</button>
                        } @else if (col.key === 'EN_PROGRESO') {
                          <button class="btn btn-sm btn-outline-success w-100" (click)="cambiarEstado(t.idTarea, 'COMPLETADA')">Completar</button>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TareasPageComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  get esDoctor(): boolean { return this.auth.getRol() === 'DOCTOR' || this.auth.getRol() === 'MEDICO'; }
  tareas = signal<any[]>([]);
  columns = [{key:'PENDIENTE',label:'Pendiente'},{key:'EN_PROGRESO',label:'En Progreso'},{key:'COMPLETADA',label:'Completado'}];
  mostrarAsignar = signal(false);
  nuevaTarea: any = { titulo:'', tipo:'CONSULTA', idPracticante: null, fechaLimite: '' };
  practicantes = signal<any[]>([]);

  ngOnInit() {
    this.cargar();
    if (this.esDoctor) this.cargarPracticantes();
    else this.http.get<{data: any[]}>('http://localhost:8080/api/practicante/mis-tareas').subscribe(r => this.tareas.set(r.data || []));
  }

  cargar() {
    const url = this.esDoctor
      ? 'http://localhost:8080/api/practicante/tareas/doctor'
      : 'http://localhost:8080/api/practicante/mis-tareas';
    this.http.get<{data: any[]}>(url).subscribe(r => this.tareas.set(r.data || []));
  }

  cargarPracticantes() {
    this.http.get<{data: any[]}>('http://localhost:8080/api/perfil/practicantes').subscribe(r => {
      this.practicantes.set((r.data||[]).map((d: any) => ({ idPracticante: d.perfil.idPracticante, nombre: d.perfil.nombreCompleto })));
    });
  }

  tareasPorEstado(estado: string) { return this.tareas().filter(t => t.estado === estado); }

  cambiarEstado(id: number, estado: string) {
    this.http.put(`http://localhost:8080/api/practicante/tareas/${id}/estado`, { estado }).subscribe({ next: () => this.cargar() });
  }

  asignarTarea() {
    if (!this.nuevaTarea.idPracticante || !this.nuevaTarea.titulo) return;
    this.http.post('http://localhost:8080/api/practicante/tareas', this.nuevaTarea).subscribe({
      next: () => { this.cargar(); this.nuevaTarea.titulo = ''; }
    });
  }
}
