import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmaciaService, ReclamacionDTO, CrearReclamacionRequest } from '../../services/farmacia.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-reclamaciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reclamaciones-page.html',
  styleUrl: './reclamaciones-page.css'
})
export class ReclamacionesPageComponent {
  private service = inject(FarmaciaService);
  private auth = inject(AuthService);

  reclamaciones = signal<ReclamacionDTO[]>([]);
  cargando = signal(false);
  mostrarForm = signal(true);
  guardando = signal(false);
  exito = signal(false);

  get autenticado(): boolean { return this.auth.isAuthenticated(); }

  form = {
    nombreCompleto: '',
    email: '',
    telefono: '',
    tipo: 'RECLAMO',
    descripcion: '',
    productoServicio: ''
  };

  constructor() {
    if (this.autenticado) this.cargar();
  }

  cargar() {
    if (!this.autenticado) return;
    this.cargando.set(true);
    this.service.reclamaciones.misReclamaciones().subscribe({
      next: (d) => { this.reclamaciones.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  enviar() {
    this.guardando.set(true);
    const req: CrearReclamacionRequest = { ...this.form };
    const call = this.autenticado
      ? this.service.reclamaciones.crear(req)
      : this.service.reclamaciones.crearAnonimo(req);

    call.subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set(true);
        this.form = { nombreCompleto: '', email: '', telefono: '', tipo: 'RECLAMO', descripcion: '', productoServicio: '' };
        if (this.autenticado) { this.cargar(); this.mostrarForm.set(false); }
      },
      error: (e) => {
        this.guardando.set(false);
        alert(e.error?.message || 'Error al enviar');
      }
    });
  }

  otroReclamo() { this.exito.set(false); this.mostrarForm.set(true); }

  estadoBadge(estado: string): string {
    const m: Record<string, string> = { PENDIENTE: 'bg-warning', EN_PROCESO: 'bg-info', RESUELTO: 'bg-success', CERRADO: 'bg-secondary' };
    return m[estado] || 'bg-secondary';
  }
}
