import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvailabilityService } from '../../../../core/services/availability.service';
import { AvailabilityTemplateDTO, AvailabilityOverrideDTO, CreateOverrideRequest } from '../../../../core/models/scheduling.models';
import { MiniCalendarComponent } from '../../../../shared/components/mini-calendar/mini-calendar';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-mi-horario-page',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, DatePipe, MiniCalendarComponent, ConfirmDialogComponent],
  template: `
    <div class="container-fluid py-4">
      <h2 class="mb-4">Mi Horario</h2>
      <div class="row">
        <!-- Weekly Template Editor -->
        <div class="col-md-7 mb-4">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Plantilla Semanal</span>
              <button class="btn btn-primary btn-sm" (click)="saveTemplate()" [disabled]="saving()">
                {{ saving() ? 'Guardando...' : 'Guardar horario' }}
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-bordered table-sm text-center">
                  <thead>
                    <tr>
                      <th style="width: 80px;">Hora</th>
                      <th *ngFor="let day of dayNames">{{ day }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let time of timeSlots">
                      <td class="text-muted small">{{ time }}</td>
                      <td *ngFor="let day of dayNames; let di = index"
                          class="grid-cell"
                          [class.available]="isCellSelected(di, time)"
                          (mousedown)="startDrag(di, time)"
                          (mouseenter)="onDragEnter(di, time)"
                          (mouseup)="endDrag()">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <small class="text-muted">Haz clic o arrastra para seleccionar horarios disponibles</small>
            </div>
          </div>
        </div>

        <!-- Override Manager -->
        <div class="col-md-5 mb-4">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Excepciones</span>
              <button class="btn btn-outline-primary btn-sm" (click)="showAddOverride = true">
                + Agregar excepción
              </button>
            </div>
            <div class="card-body">
              <app-mini-calendar
                [availableDates]="[]"
                (monthChanged)="loadOverrides($event)">
              </app-mini-calendar>
              <hr>
              <div *ngIf="overrides().length === 0" class="text-muted text-center py-3">
                No hay excepciones para este mes
              </div>
              <div *ngFor="let ov of overrides()" class="override-item d-flex justify-content-between align-items-center p-2 mb-2 border rounded"
                   [class.border-danger]="ov.overrideType === 'BLOCK'"
                   [class.border-success]="ov.overrideType === 'ADD'">
                <div>
                  <small class="text-muted">{{ ov.date | date:'dd/MM/yyyy' }}</small>
                  <div>{{ ov.startTime }} - {{ ov.endTime }}</div>
                  <span class="badge" [class.bg-danger]="ov.overrideType === 'BLOCK'" [class.bg-success]="ov.overrideType === 'ADD'">
                    {{ ov.overrideType === 'BLOCK' ? 'Bloqueado' : 'Disponible' }}
                  </span>
                  <small *ngIf="ov.reason" class="text-muted ms-2">{{ ov.reason }}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger" (click)="confirmDeleteOverride(ov)">&times;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Override Modal -->
    <div *ngIf="showAddOverride" class="modal d-block" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5>Agregar excepción</h5></div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Fecha</label>
              <input type="date" class="form-control" [(ngModel)]="newOverride.date">
            </div>
            <div class="mb-3">
              <label class="form-label">Tipo</label>
              <select class="form-select" [(ngModel)]="newOverride.overrideType">
                <option value="BLOCK">Bloquear horario</option>
                <option value="ADD">Agregar disponibilidad extra</option>
              </select>
            </div>
            <div class="row mb-3">
              <div class="col">
                <label class="form-label">Inicio</label>
                <select class="form-select" [(ngModel)]="newOverride.startTime">
                  <option *ngFor="let t of timeSlots" [value]="t">{{ t }}</option>
                </select>
              </div>
              <div class="col">
                <label class="form-label">Fin</label>
                <select class="form-select" [(ngModel)]="newOverride.endTime">
                  <option *ngFor="let t of timeSlots" [value]="t">{{ t }}</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Motivo (opcional)</label>
              <input type="text" class="form-control" [(ngModel)]="newOverride.reason">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showAddOverride = false">Cancelar</button>
            <button class="btn btn-primary" (click)="addOverride()">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <app-confirm-dialog *ngIf="overrideToDelete"
      title="Eliminar excepción"
      [message]="'¿Eliminar esta excepción del ' + (overrideToDelete.date | date:'dd/MM/yyyy') + '?'"
      (confirmed)="deleteOverride()"
      (cancelled)="overrideToDelete = null">
    </app-confirm-dialog>

    <!-- Toast -->
    <div *ngIf="toast" class="position-fixed bottom-0 end-0 p-3" style="z-index: 9999;">
      <div class="toast show align-items-center text-bg-{{ toastType }} border-0">
        <div class="d-flex">
          <div class="toast-body">{{ toast }}</div>
          <button class="btn-close btn-close-white me-2 m-auto" (click)="toast = ''"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grid-cell { width: 40px; height: 24px; cursor: pointer; padding: 0; }
    .grid-cell.available { background: #4caf50; }
    .grid-cell:not(.available) { background: #f5f5f5; }
    .grid-cell:hover { opacity: 0.8; }
  `]
})
export class MiHorarioPageComponent implements OnInit {
  private availabilityService = inject(AvailabilityService);

  dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  timeSlots: string[] = [];
  selected = signal<Set<string>>(new Set());
  overrides = signal<AvailabilityOverrideDTO[]>([]);
  saving = signal(false);
  toast = '';
  toastType: 'success' | 'danger' = 'success';
  showAddOverride = false;
  overrideToDelete: AvailabilityOverrideDTO | null = null;

  newOverride: CreateOverrideRequest = {
    date: '', startTime: '08:00', endTime: '08:30', overrideType: 'BLOCK'
  };

  private dragging = false;
  private dragDay = -1;

  ngOnInit() {
    for (let h = 8; h < 17; h++) {
      this.timeSlots.push(`${String(h).padStart(2, '0')}:00`);
      this.timeSlots.push(`${String(h).padStart(2, '0')}:30`);
    }
    this.loadTemplate();
    this.loadOverrides('');
  }

  loadTemplate() {
    this.availabilityService.getTemplate().subscribe({
      next: templates => {
        const set = new Set<string>();
        for (const t of templates) {
          const dayIndex = this.dayNames.indexOf(this.mapDay(t.dayOfWeek));
          if (dayIndex === -1) continue;
          let start = this.toMinutes(t.startTime);
          const end = this.toMinutes(t.endTime);
          while (start < end) {
            const time = this.minutesToTime(start);
            set.add(`${dayIndex}:${time}`);
            start += 30;
          }
        }
        this.selected.set(set);
      },
      error: () => this.showToast('Error al cargar horario', 'danger')
    });
  }

  saveTemplate() {
    this.saving.set(true);
    const templates: AvailabilityTemplateDTO[] = [];
    for (let di = 0; di < this.dayNames.length; di++) {
      const times: string[] = [];
      for (const key of this.selected()) {
        const [d, t] = key.split(':');
        if (Number(d) === di) times.push(t);
      }
      if (times.length === 0) continue;
      times.sort();
      let start = times[0];
      let prev = this.toMinutes(start);
      for (let i = 1; i < times.length; i++) {
        const cur = this.toMinutes(times[i]);
        if (cur !== prev + 30) {
          templates.push({ dayOfWeek: this.reverseMapDay(this.dayNames[di]), startTime: start, endTime: this.minutesToTime(prev + 30) });
          start = times[i];
        }
        prev = cur;
      }
      templates.push({ dayOfWeek: this.reverseMapDay(this.dayNames[di]), startTime: start, endTime: this.minutesToTime(prev + 30) });
    }

    this.availabilityService.updateTemplate(templates).subscribe({
      next: () => {
        this.showToast('Horario guardado correctamente', 'success');
        this.saving.set(false);
      },
      error: () => { this.showToast('Error al guardar horario', 'danger'); this.saving.set(false); }
    });
  }

  loadOverrides(month: string) {
    this.availabilityService.getOverrides(month || undefined).subscribe({
      next: data => this.overrides.set(data),
      error: () => {}
    });
  }

  isCellSelected(dayIndex: number, time: string): boolean {
    return this.selected().has(`${dayIndex}:${time}`);
  }

  startDrag(dayIndex: number, time: string) {
    this.dragging = true;
    this.dragDay = dayIndex;
    this.toggleCell(dayIndex, time);
  }

  onDragEnter(dayIndex: number, time: string) {
    if (this.dragging && dayIndex === this.dragDay) {
      this.toggleCell(dayIndex, time);
    }
  }

  endDrag() {
    this.dragging = false;
    this.dragDay = -1;
  }

  private toggleCell(dayIndex: number, time: string) {
    const key = `${dayIndex}:${time}`;
    const set = new Set(this.selected());
    if (set.has(key)) set.delete(key);
    else set.add(key);
    this.selected.set(set);
  }

  addOverride() {
    this.availabilityService.createOverride(this.newOverride).subscribe({
      next: () => {
        this.showAddOverride = false;
        this.showToast('Excepción creada correctamente', 'success');
        this.loadOverrides('');
        this.newOverride = { date: '', startTime: '08:00', endTime: '08:30', overrideType: 'BLOCK' };
      },
      error: () => this.showToast('Error al crear excepción', 'danger')
    });
  }

  confirmDeleteOverride(ov: AvailabilityOverrideDTO) {
    this.overrideToDelete = ov;
  }

  deleteOverride() {
    if (!this.overrideToDelete?.id) return;
    this.availabilityService.deleteOverride(this.overrideToDelete.id).subscribe({
      next: () => {
        this.overrideToDelete = null;
        this.showToast('Excepción eliminada', 'success');
        this.loadOverrides('');
      },
      error: () => this.showToast('Error al eliminar excepción', 'danger')
    });
  }

  private showToast(msg: string, type: 'success' | 'danger') {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => this.toast = '', 3000);
  }

  private toMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(m: number): string {
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }

  private mapDay(day: string): string {
    const map: Record<string, string> = { 'LUNES': 'Lun', 'MARTES': 'Mar', 'MIERCOLES': 'Mié', 'JUEVES': 'Jue', 'VIERNES': 'Vie', 'SABADO': 'Sáb', 'DOMINGO': 'Dom' };
    return map[day] || day;
  }

  private reverseMapDay(day: string): string {
    const map: Record<string, string> = { 'Lun': 'LUNES', 'Mar': 'MARTES', 'Mié': 'MIERCOLES', 'Jue': 'JUEVES', 'Vie': 'VIERNES', 'Sáb': 'SABADO', 'Dom': 'DOMINGO' };
    return map[day] || day;
  }
}
