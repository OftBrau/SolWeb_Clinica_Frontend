import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FarmaciaService, VentaResponseDTO } from '../../services/farmacia.service';

@Component({
  selector: 'app-mis-compras-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-compras-page.html',
  styleUrl: './mis-compras-page.css'
})
export class MisComprasPageComponent {
  private service = inject(FarmaciaService);
  ventas = signal<VentaResponseDTO[]>([]);
  cargando = signal(true);

  constructor() {
    this.service.ventas.misVentas().subscribe({
      next: (data) => { this.ventas.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  estadoBadge(estado: string): string {
    const m: Record<string, string> = { PENDIENTE: 'bg-warning', PAGADO: 'bg-success', CANCELADO: 'bg-danger', VENCIDO: 'bg-secondary' };
    return m[estado] || 'bg-secondary';
  }
}
