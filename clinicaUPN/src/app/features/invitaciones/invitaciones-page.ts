import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-invitaciones-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div style="max-width:1320px;margin:0 auto">
      <app-page-header [title]="esPracticante ? 'Mis Invitaciones' : 'Invitaciones Enviadas'"
        subtitle="Gestión de invitaciones a prácticas"
        icon="bi-envelope-paper"
        [breadcrumbs]="[
          { label: 'Inicio', link: '/app' },
          { label: 'Invitaciones' }
        ]">
        <button class="btn btn-sm btn-outline-primary" (click)="cargar()"><i class="bi bi-arrow-clockwise"></i></button>
      </app-page-header>
      @if (cargando()) { <div class="text-center py-5"><div class="spinner-border"></div></div> }
      @for (inv of invitaciones(); track inv.idInvitacion) {
        <div class="card mb-2 border shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ esPracticante ? inv.doctor : inv.practicante }}</strong>
              @if (inv.especialidad) { <small class="text-muted ms-2">{{ inv.especialidad }}</small> }
              @if (inv.mensaje) { <p class="mb-0 small text-muted mt-1">{{ inv.mensaje }}</p> }
              <small class="text-muted">{{ inv.fechaCreacion | date:'dd/MM HH:mm' }}</small>
            </div>
            <div class="text-end">
              @if (inv.estado === 'PENDIENTE' && esPracticante) {
                <button class="btn btn-sm btn-success me-1" (click)="responder(inv.idInvitacion, 'ACEPTADA')">Aceptar</button>
                <button class="btn btn-sm btn-outline-danger" (click)="responder(inv.idInvitacion, 'RECHAZADA')">Rechazar</button>
              } @else {
                <span class="badge" [class.bg-success]="inv.estado==='ACEPTADA'" [class.bg-danger]="inv.estado==='RECHAZADA'" [class.bg-warning]="inv.estado==='PENDIENTE'">{{ inv.estado }}</span>
              }
            </div>
          </div>
        </div>
      }
      @if (invitaciones().length===0 && !cargando()) { <p class="text-muted text-center py-4">Sin invitaciones.</p> }
    </div>
  `
})
export class InvitacionesPageComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  invitaciones = signal<any[]>([]);
  cargando = signal(true);
  private timer: any;

  get esPracticante(): boolean { return this.auth.getRol() === 'PRACTICANTE'; }

  ngOnInit() {
    this.cargar();
    // Poll cada 30s como fallback si WebSocket no funciona
    this.timer = setInterval(() => this.cargar(), 30000);
  }

  ngOnDestroy() { clearInterval(this.timer); }

  cargar() {
    const url = this.esPracticante
      ? 'http://localhost:8080/api/practicante/mis-invitaciones'
      : 'http://localhost:8080/api/practicante/invitaciones/doctor';
    this.http.get<{data: any[]}>(url).subscribe({ next: r => { this.invitaciones.set(r.data); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }

  responder(id: number, estado: string) {
    const accion = estado === 'ACEPTADA' ? 'aceptar' : 'rechazar';
    this.http.put(`http://localhost:8080/api/practicante/invitaciones/${id}/${accion}`, {}).subscribe({
      next: () => this.invitaciones.update(list => list.map(i => i.idInvitacion === id ? { ...i, estado } : i))
    });
  }
}
