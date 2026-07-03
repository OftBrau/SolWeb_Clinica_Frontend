import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PerfilProfesionalService } from '../../services/perfil-profesional.service';

@Component({
  selector: 'app-practicantes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './practicantes-page.html',
  styles: [`.card-prac { transition: transform .15s; } .card-prac:hover { transform: translateY(-2px); } .skill-tag { display:inline-block;background:#e8f0fe;color:#1a73e8;border-radius:12px;padding:2px 10px;font-size:.7rem;margin:2px; }`]
})
export class PracticantesPageComponent implements OnInit {
  private svc = inject(PerfilProfesionalService);
  private http = inject(HttpClient);

  practicantes = signal<any[]>([]);
  cargando = signal(true);
  filtro = signal('');
  invId = signal<number | null>(null);
  invMsg = signal('');
  invEnviando = signal(false);
  invitados = signal<Set<number>>(new Set());
  asignados = signal<Set<number>>(new Set());
  verPerfil = signal<any | null>(null);
  bannerMuted = signal(true);

  ngOnInit() { this.cargar(); this.cargarInvitados(); this.cargarAsignados(); }

  cargarAsignados() {
    this.http.get<{data: any[]}>('http://localhost:8080/api/doctores/mis-practicantes/evaluaciones')
      .subscribe(r => {
        if (r.data) this.asignados.set(new Set(r.data.map((i: any) => i.idPracticante)));
      });
  }

  cargar() {
    this.cargando.set(true);
    this.svc.getPracticantes().subscribe({ next: d => { this.practicantes.set(d); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }

  cargarInvitados() {
    this.http.get<{data: any[]}>('http://localhost:8080/api/practicante/invitaciones/doctor')
      .subscribe(r => {
        if (r.data) {
          // Solo marcar como invitados los que tienen invitación PENDIENTE
          const pendientes = r.data.filter((i: any) => i.estado === 'PENDIENTE').map((i: any) => i.idPracticante);
          this.invitados.set(new Set(pendientes));
        }
      });
  }

  get practicantesFiltrados() {
    const q = this.filtro().toLowerCase();
    let list = this.practicantes();
    // Filtrar los que ya son mis practicantes
    list = list.filter(p => !this.asignados().has(p.perfil.idPracticante));
    if (!q) return list;
    return list.filter(p => {
      const skills = p.habilidades?.map((h: any) => h.nombre).join(' ') || '';
      return (p.perfil.nombreCompleto+' '+p.perfil.universidad+' '+p.perfil.tituloProfesional+' '+skills).toLowerCase().includes(q);
    });
  }

  invitar(p: any) {
    this.invId.set(p.perfil.idPracticante);
    this.invMsg.set('');
  }

  enviarInvitacion() {
    if (!this.invId()) return;
    this.invEnviando.set(true);
    this.http.post('http://localhost:8080/api/practicante/invitaciones', {
      idPracticante: this.invId(), mensaje: this.invMsg()
    }).subscribe({
      next: () => { this.invEnviando.set(false); this.invId.set(null); this.invitados.update(s => { s.add(this.invId()!); return new Set(s); }); },
      error: () => this.invEnviando.set(false)
    });
  }
}
