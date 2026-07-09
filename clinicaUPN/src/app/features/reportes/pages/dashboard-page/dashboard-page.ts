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
  styleUrl: './dashboard-page.css'
})
export class DashboardPageComponent implements OnInit {
  private http = inject(HttpClient);
  fecha = signal(new Date().toISOString().split('T')[0]);
  data = signal<any>(null);
  cargando = signal(false);
  errorMsg = signal('');

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.errorMsg.set('');
    this.http.get<{data: any}>(`http://localhost:8080/api/reportes/operativo-diario?fecha=${this.fecha()}`)
      .subscribe({ next: r => { this.data.set(r.data); this.cargando.set(false); }, error: () => { this.cargando.set(false); this.errorMsg.set('Error al cargar reporte'); } });
  }

  maxCant(list: any[]): number {
    if (!list?.length) return 1;
    return Math.max(...list.map((i: any) => i.cantidad || 0), 1);
  }

  barColor(i: number): string {
    const colors = ['#4f46e5','#16a34a','#dc2626','#d97706','#7c3aed','#0891b2','#db2777','#65a30d'];
    return colors[i % colors.length];
  }

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
