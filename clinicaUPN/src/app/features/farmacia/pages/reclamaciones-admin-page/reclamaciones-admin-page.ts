import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { FarmaciaService, ReclamacionDTO } from '../../services/farmacia.service';

@Component({
  selector: 'app-reclamaciones-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './reclamaciones-admin-page.html',
  styleUrl: './reclamaciones-admin-page.css'
})
export class ReclamacionesAdminPageComponent {
  private service = inject(FarmaciaService);

  reclamaciones = signal<ReclamacionDTO[]>([]);
  total = signal(0);
  pagina = signal(0);
  totalPaginas = signal(0);
  cargando = signal(true);
  guardando = signal(false);

  selected = signal<ReclamacionDTO | null>(null);
  respuestaForm = { estado: 'RESUELTO', respuesta: '' };

  constructor() { this.cargar(); }

  cargar(page = 0) {
    this.cargando.set(true);
    this.service.reclamaciones.listar(page, 10).subscribe({
      next: (r) => {
        this.reclamaciones.set(r.content);
        this.total.set(r.totalElements);
        this.pagina.set(r.page);
        this.totalPaginas.set(r.totalPages);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  irPagina(p: number): void { this.cargar(p); }

  verDetalle(r: ReclamacionDTO) {
    this.selected.set(r);
    this.respuestaForm = { estado: r.estado, respuesta: r.respuesta || '' };
  }

  cerrarDetalle() { this.selected.set(null); }

  responder() {
    if (!this.selected()) return;
    this.guardando.set(true);
    this.service.reclamaciones.responder(this.selected()!.idReclamacion!, this.respuestaForm.estado, this.respuestaForm.respuesta)
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.selected.set(null);
          this.cargar(this.pagina());
        },
        error: (e) => {
          this.guardando.set(false);
          alert(e.error?.message || 'Error al responder');
        }
      });
  }

  estadoBadge(estado: string): string {
    const m: Record<string, string> = { PENDIENTE: 'bg-warning', EN_PROCESO: 'bg-info', RESUELTO: 'bg-success', CERRADO: 'bg-secondary' };
    return m[estado] || 'bg-secondary';
  }
}
