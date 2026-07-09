import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './dashboard-page.html',
  styles: [`
    .stat-card { background: var(--bs-body-bg); border: 1px solid var(--bs-border-color); border-radius: 12px; padding: 1.25rem; text-align: center; }
    .stat-value { font-size: 1.8rem; font-weight: 700; }
    .stat-label { font-size: .75rem; text-transform: uppercase; letter-spacing: .5px; color: var(--bs-secondary-color); }
    .bar-chart { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .bar-label { min-width: 130px; font-size: .85rem; text-align: right; }
    .bar-track { flex: 1; height: 22px; background: var(--bs-tertiary-bg); border-radius: 6px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 6px; min-width: 4px; display: flex; align-items: center; padding-left: 8px; color: #fff; font-size: .7rem; font-weight: 600; }
    .max-w { max-width: 1100px; margin: 0 auto; }
  `]
})
export class DashboardPageComponent implements OnInit {
  private http = inject(HttpClient);
  fecha = signal(new Date().toISOString().split('T')[0]);
  data = signal<any>(null);
  cargando = signal(false);

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.http.get<{data: any}>(`http://localhost:8080/api/reportes/operativo-diario?fecha=${this.fecha()}`)
      .subscribe({ next: r => { this.data.set(r.data); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }

  maxCant(list: any[]): number {
    if (!list?.length) return 1;
    return Math.max(...list.map((i: any) => i.cantidad || 0), 1);
  }

  barColor(i: number): string {
    const colors = ['#0d6efd','#198754','#dc3545','#fd7e14','#6f42c1','#0dcaf0','#d63384','#20c997'];
    return colors[i % colors.length];
  }

  errorMsg = signal('');

  descargarPDF(): void {
    this.errorMsg.set('');
    const url = `http://localhost:8080/api/reportes/operativo-diario/pdf?fecha=${this.fecha()}`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-diario-${this.fecha()}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      },
      error: () => this.errorMsg.set('Error al descargar PDF. Verifica que tengas permisos de administrador.')
    });
  }

  descargarExcel(): void {
    this.errorMsg.set('');
    const url = `http://localhost:8080/api/reportes/operativo-diario/excel?fecha=${this.fecha()}`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-diario-${this.fecha()}.xlsx`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      },
      error: () => this.errorMsg.set('Error al descargar Excel. Verifica que tengas permisos de administrador.')
    });
  }
}
