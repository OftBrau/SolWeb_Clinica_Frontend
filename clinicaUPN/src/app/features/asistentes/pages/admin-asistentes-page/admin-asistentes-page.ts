import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

interface Asistente {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  estado: string;
}

@Component({
  selector: 'app-admin-asistentes-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="content-wrapper">

    <app-page-header title="Asistentes" subtitle="Gestion de asistentes clinicos"
      [breadcrumbs]="[{label:'Inicio',link:'/app'},{label:'Asistentes'}]">
    </app-page-header>

    <div class="row mt-3">
      <div class="col-12">
        <div class="card">
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Telefono</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of asistentes()">
                  <td>{{ a.nombre }} {{ a.apellido }}</td>
                  <td>{{ a.email }}</td>
                  <td>{{ a.telefono || '-' }}</td>
                  <td>
                    <span [class.bg-success]="a.estado === 'ACTIVO'" [class.bg-secondary]="a.estado !== 'ACTIVO'" class="badge">
                      {{ a.estado }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="asistentes().length === 0">
                  <td colspan="4" class="text-center text-muted py-3">
                    No hay asistentes registrados. Cree usuarios con rol ASISTENTE desde la pagina de <a routerLink="/app/usuarios">Usuarios</a>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    </div>
  `,
})
export class AdminAsistentesPageComponent implements OnInit {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  asistentes = signal<Asistente[]>([]);

  ngOnInit(): void {
    this.cargarAsistentes();
  }

  cargarAsistentes(): void {
    this.http.get<any>(`${this.api}/admin/asistentes`).subscribe({
      next: (r) => this.asistentes.set(r.data || []),
      error: () => {}
    });
  }
}
