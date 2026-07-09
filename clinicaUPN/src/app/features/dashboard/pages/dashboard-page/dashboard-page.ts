import { Component, inject, OnInit, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { DashboardService, ReporteDiario } from '../../services/dashboard.service';
import { createIcons, ClipboardList, CheckCircle, Stethoscope, XCircle, CalendarX, Users, UserCheck, Calendar, Activity, ArrowUpRight, FileDown } from 'lucide';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPageComponent implements OnInit, AfterViewInit {
  private dashboardService = inject(DashboardService);
  private http = inject(HttpClient);

  reporte = signal<ReporteDiario | null>(null);
  loading = signal(true);
  error = signal('');
  fecha = signal(new Date().toISOString().split('T')[0]);

  ngOnInit(): void {
    this.cargarReporte();
  }

  ngAfterViewInit() {
    createIcons({
      icons: {
        'clipboard-list': ClipboardList,
        'check-circle': CheckCircle,
        'stethoscope': Stethoscope,
        'x-circle': XCircle,
        'calendar-x': CalendarX,
        'users': Users,
        'user-check': UserCheck,
        'calendar': Calendar,
        'activity': Activity,
        'arrow-up-right': ArrowUpRight,
        'file-down': FileDown,
      },
    });
  }

  cargarReporte(): void {
    this.loading.set(true);
    this.error.set('');
    this.dashboardService.obtenerReporteDiario(this.fecha()).subscribe({
      next: (data) => {
        this.reporte.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el dashboard');
        this.loading.set(false);
      },
    });
  }

  maxCantidad(items: { cantidad: number }[]): number {
    return Math.max(...items.map(i => i.cantidad), 1);
  }

  descargarPDF(): void {
    this.error.set('');
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
      error: () => this.error.set('Error al descargar PDF. Verifica que tengas permisos de administrador.')
    });
  }

  descargarExcel(): void {
    this.error.set('');
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
      error: () => this.error.set('Error al descargar Excel. Verifica que tengas permisos de administrador.')
    });
  }
}
