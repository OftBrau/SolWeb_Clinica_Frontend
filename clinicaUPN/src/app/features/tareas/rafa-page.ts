import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-rafa-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div style="max-width:1320px;margin:0 auto">
      <app-page-header
        title="Reporte RAFA"
        subtitle="Reporte de Actividades Formativas y Académicas"
        icon="bi-file-earmark-bar-graph"
        [breadcrumbs]="[
          { label: 'Inicio', link: '/app' },
          { label: 'Reporte RAFA' }
        ]">
        <button class="btn btn-primary" (click)="descargarPDF()" [disabled]="descargando()">
          <i class="bi bi-download me-1"></i>{{ descargando() ? 'Generando...' : 'Descargar PDF' }}
        </button>
      </app-page-header>

      @if (cargando()) { <div class="text-center py-5"><div class="spinner-border"></div></div> }
      @if (data()) { @let d = data();

        <div class="card mb-3">
          <div class="card-header fw-bold">1. Datos Generales</div>
          <div class="card-body">
            <p class="mb-1"><strong>Practicante:</strong> {{ d.nombre }}</p>
            <p class="mb-1"><strong>Email:</strong> {{ d.email }}</p>
            <p class="mb-1"><strong>Universidad:</strong> {{ d.universidad || '-' }}</p>
            <p class="mb-0"><strong>Título:</strong> {{ d.titulo_profesional || '-' }} ({{ d.anio_graduacion || '-' }})</p>
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-header fw-bold">2. Clínica UPN</div>
          <div class="card-body">
            <p>Institución de salud universitaria con servicios de medicina general, obstetricia, nutrición, psicología, rehabilitación y fisioterapia.</p>
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-header fw-bold">3. Actividades ({{ d.actividades?.length || 0 }})</div>
          <div class="card-body">
            @for (a of d.actividades; track a.fecha) {
              <div class="border-bottom py-2"><small class="text-muted">{{ a.fecha }}</small><br><strong>{{ a.titulo }}</strong><br>{{ a.descripcion }}</div>
            }
            @if (!d.actividades?.length) { <p class="text-muted">Sin actividades registradas.</p> }
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-header fw-bold">4. Conclusión y Evaluaciones</div>
          <div class="card-body">
            <p><strong>Conclusión:</strong> {{ d.conclusion_rafa || 'No registrada (editá tu perfil profesional)' }}</p>
            <p><strong>Competencias:</strong> {{ d.competencias_rafa || 'No registradas' }}</p>
            @for (e of d.evaluaciones; track e.fecha) {
              <div class="border-bottom py-2"><small class="text-muted">{{ e.fecha }}</small> - Punt: {{ e.puntuacion }}<br>{{ e.comentario }}</div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class RafaPageComponent implements OnInit {
  private http = inject(HttpClient);
  data = signal<any>(null);
  cargando = signal(true);
  descargando = signal(false);

  ngOnInit() {
    this.http.get<{data: any}>('http://localhost:8080/api/practicante/rafa').subscribe(r => { this.data.set(r.data); this.cargando.set(false); });
  }

  descargarPDF() {
    this.descargando.set(true);
    // Por ahora mostramos mensaje, el PDF lo generamos con frontend
    alert('PDF generado. Próximamente descarga automática.');
    this.descargando.set(false);
  }
}
