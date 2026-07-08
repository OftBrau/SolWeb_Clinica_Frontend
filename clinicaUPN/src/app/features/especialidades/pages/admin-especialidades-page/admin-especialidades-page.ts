import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

interface Especialidad {
  idEspecialidad: number;
  nombre: string;
  descripcion: string;
  costoExtra: number;
  estado: string;
}

@Component({
  selector: 'app-admin-especialidades-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="content-wrapper">

    <app-page-header title="Especialidades" subtitle="Gestion de especialidades y costos"
      [breadcrumbs]="[{label:'Inicio',link:'/app'},{label:'Especialidades'}]">
      <button class="btn btn-primary btn-sm" (click)="abrirCrear()">+ Nueva Especialidad</button>
    </app-page-header>

    <div *ngIf="loading()" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-2">Cargando...</p>
    </div>

    <div *ngIf="exitoMsg()" class="alert alert-success alert-dismissible fade show">
      {{ exitoMsg() }}
      <button class="btn-close" (click)="exitoMsg.set('')"></button>
    </div>

    <div *ngIf="errorMsg()" class="alert alert-danger">
      {{ errorMsg() }}
      <button class="btn-close" (click)="errorMsg.set('')"></button>
    </div>

    <div class="table-responsive" *ngIf="!loading()">
      <table class="table" *ngIf="especialidades().length > 0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripcion</th>
            <th>Costo Extra (S/)</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of especialidades()">
            <td><strong>{{ e.nombre }}</strong></td>
            <td>{{ e.descripcion || '—' }}</td>
            <td>S/ {{ e.costoExtra || '0.00' }}</td>
            <td>
              <span [class]="e.estado === 'ACTIVO' ? 'badge bg-success' : 'badge bg-secondary'">
                {{ e.estado }}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-1" (click)="abrirEditar(e)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm"
                      [class.btn-outline-danger]="e.estado === 'ACTIVO'"
                      [class.btn-outline-success]="e.estado !== 'ACTIVO'"
                      (click)="toggleEstado(e)">
                {{ e.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="especialidades().length === 0" class="text-center py-5 text-muted">
        No hay especialidades registradas.
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div class="modal d-block" *ngIf="modalVisible()" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editandoId() ? 'Editar' : 'Nueva' }} Especialidad</h5>
            <button class="btn-close" (click)="cerrarModal()"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="modalError()" class="alert alert-danger py-2 small">{{ modalError() }}</div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Nombre *</label>
              <input class="form-control" [(ngModel)]="formNombre" placeholder="Ej: Cardiologia" />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Descripcion</label>
              <textarea class="form-control" rows="2" [(ngModel)]="formDescripcion" placeholder="Descripcion de la especialidad..."></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Costo Extra (S/)</label>
              <input type="number" class="form-control" [(ngModel)]="formCostoExtra" step="1" min="0" placeholder="0.00" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="guardar()" [disabled]="guardando() || !formNombre()">
              {{ guardando() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    </div>
  `
})
export class AdminEspecialidadesPageComponent implements OnInit {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  especialidades = signal<Especialidad[]>([]);
  loading = signal(true);
  exitoMsg = signal('');
  errorMsg = signal('');

  modalVisible = signal(false);
  modalError = signal('');
  guardando = signal(false);
  editandoId = signal<number | null>(null);
  formNombre = signal('');
  formDescripcion = signal('');
  formCostoExtra = signal<number>(0);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.http.get<{ data: Especialidad[] }>(`${this.api}/admin/especialidades`).subscribe({
      next: (r) => { this.especialidades.set(r.data || []); this.loading.set(false); },
      error: () => { this.errorMsg.set('Error al cargar especialidades'); this.loading.set(false); }
    });
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.formNombre.set('');
    this.formDescripcion.set('');
    this.formCostoExtra.set(0);
    this.modalError.set('');
    this.modalVisible.set(true);
  }

  abrirEditar(e: Especialidad): void {
    this.editandoId.set(e.idEspecialidad);
    this.formNombre.set(e.nombre);
    this.formDescripcion.set(e.descripcion || '');
    this.formCostoExtra.set(e.costoExtra || 0);
    this.modalError.set('');
    this.modalVisible.set(true);
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
    this.editandoId.set(null);
  }

  guardar(): void {
    if (!this.formNombre()) return;
    this.guardando.set(true);
    this.modalError.set('');

    const body = {
      nombre: this.formNombre(),
      descripcion: this.formDescripcion(),
      costoExtra: this.formCostoExtra(),
      estado: 'ACTIVO'
    };

    const id = this.editandoId();
    const req = id
      ? this.http.put(`${this.api}/admin/especialidades/${id}`, body)
      : this.http.post(`${this.api}/admin/especialidades`, body);

    req.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.exitoMsg.set(id ? 'Especialidad actualizada' : 'Especialidad creada');
        setTimeout(() => this.exitoMsg.set(''), 4000);
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.modalError.set(err.error?.message || 'Error al guardar');
      }
    });
  }

  toggleEstado(e: Especialidad): void {
    const nuevoEstado = e.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.http.patch(`${this.api}/admin/especialidades/${e.idEspecialidad}/desactivar`, {}).subscribe({
      next: () => {
        this.exitoMsg.set(`Especialidad ${nuevoEstado === 'ACTIVO' ? 'activada' : 'desactivada'}`);
        setTimeout(() => this.exitoMsg.set(''), 4000);
        this.cargar();
      },
      error: (err) => this.errorMsg.set(err.error?.message || 'Error')
    });
  }
}
