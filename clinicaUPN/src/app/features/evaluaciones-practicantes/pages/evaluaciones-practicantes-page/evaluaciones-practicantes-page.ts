import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-evaluaciones-practicantes-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, FormsModule],
  templateUrl: './evaluaciones-practicantes-page.html',
  styles: [`
    .page-wrapper { max-width: 1000px; margin: 0 auto; }
    .card-eval { transition: transform .15s; }
    .card-eval:hover { transform: translateY(-2px); }
  `]
})
export class EvaluacionesPracticantesPageComponent implements OnInit {
  private http = inject(HttpClient);
  practicantes = signal<any[]>([]);
  seleccionado = signal<number | null>(null);
  evaluaciones = signal<any[]>([]);
  cargando = signal(true);

  ngOnInit() { this.cargar(); }

  cargar() {
    this.http.get<{data: any[]}>('http://localhost:8080/api/doctores/mis-practicantes/evaluaciones').subscribe({
      next: r => {
        this.practicantes.set(r.data || []);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  verEvaluaciones(idPracticante: number) {
    this.seleccionado.set(idPracticante);
    this.http.get<{data: any[]}>('http://localhost:8080/api/practicante/rafa')
      .subscribe({ next: () => {}, error: () => {} });

    // Usamos el endpoint de actividades + evaluaciones
    this.http.get<{data: {evaluaciones: any[]}}>('http://localhost:8080/api/practicante/rafa').subscribe({
      next: r => {
        if (Array.isArray(r.data?.evaluaciones))
          this.evaluaciones.set(r.data.evaluaciones);
      }
    });
  }

  descargarPDF(idPracticante: number) {
    this.http.get(`http://localhost:8080/api/practicante/evaluaciones/${idPracticante}/pdf`, { responseType: 'blob' })
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      });
  }
}
