import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { ConsultoriosService, ConsultorioDTO, AsignacionDTO } from '../../services/consultorios.service';

@Component({
  selector: 'app-consultorios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './consultorios-page.html',
  styleUrl: './consultorios-page.css'
})
export class ConsultoriosPageComponent implements OnInit {
  private svc = inject(ConsultoriosService);

  tab = signal<'crud'|'asignar'|'dispo'|'ocupacion'>('crud');

  // CRUD
  consultorios = signal<ConsultorioDTO[]>([]);
  cargando = signal(true);
  editando = signal<ConsultorioDTO | null>(null);
  mostrarForm = signal(false);
  form: ConsultorioDTO = { nombre: '', ubicacion: '' };

  // Asignaciones
  asignaciones = signal<AsignacionDTO[]>([]);
  mostrarAsignar = signal(false);
  formAsig: any = { idConsultorio: null, idDoctor: null, diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' };

  // Disponibilidad
  disponibles = signal<ConsultorioDTO[]>([]);
  dispoDia = signal('LUNES');
  dispoHora = signal('08:00');
  buscandoDispo = signal(false);

  dias = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
  horas = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

  ngOnInit() { this.cargar(); }

  cargar() { this.cargando.set(true); this.svc.listar().subscribe({ next: d => { this.consultorios.set(d); this.cargando.set(false); }, error: () => this.cargando.set(false) }); }

  // --- CRUD ---
  nuevo() { this.editando.set(null); this.form = { nombre: '', ubicacion: '' }; this.mostrarForm.set(true); }
  editar(c: ConsultorioDTO) { this.editando.set(c); this.form = { ...c }; this.mostrarForm.set(true); }
  guardar() {
    const call = this.editando() ? this.svc.actualizar(this.editando()!.idConsultorio!, this.form) : this.svc.crear(this.form);
    call.subscribe({ next: () => { this.mostrarForm.set(false); this.cargar(); }, error: e => alert(e.error?.message || 'Error') });
  }
  desactivar(c: ConsultorioDTO) {
    if (!confirm(`¿Desactivar ${c.nombre}?`)) return;
    this.svc.desactivar(c.idConsultorio!).subscribe({ next: () => this.cargar() });
  }
  activar(c: ConsultorioDTO) { this.svc.activar(c.idConsultorio!).subscribe({ next: () => this.cargar() }); }

  // --- Asignaciones ---
  cargarAsignaciones() { this.svc.listarAsignaciones().subscribe({ next: d => this.asignaciones.set(d) }); }
  asignar() {
    this.svc.asignar(this.formAsig).subscribe({ next: () => { this.mostrarAsignar.set(false); this.cargarAsignaciones(); }, error: e => alert(e.error?.message || 'Error') });
  }
  eliminarAsig(a: AsignacionDTO) {
    if (!confirm(`¿Eliminar asignación de ${a.doctor}?`)) return;
    this.svc.eliminarAsignacion(a.idAsignacion).subscribe({ next: () => this.cargarAsignaciones() });
  }

  // --- Disponibilidad ---
  buscarDisponibles() {
    this.buscandoDispo.set(true);
    this.svc.disponibilidad(this.dispoDia(), this.dispoHora()).subscribe({ next: d => { this.disponibles.set(d); this.buscandoDispo.set(false); }, error: () => this.buscandoDispo.set(false) });
  }

  // --- Ocupacion ---
  ocupacion = signal<any[]>([]);
  ocupFecha = signal(new Date().toISOString().split('T')[0]);
  cargandoOcup = signal(false);

  buscarOcupacion() {
    this.cargandoOcup.set(true);
    this.svc.ocupacion(this.ocupFecha()).subscribe({ next: d => { this.ocupacion.set(d); this.cargandoOcup.set(false); }, error: () => this.cargandoOcup.set(false) });
  }

  getConsultoriosUnicos(): any[] {
    const seen = new Set(); const result: any[] = [];
    for (const o of this.ocupacion()) {
      if (!seen.has(o.idConsultorio)) { seen.add(o.idConsultorio); result.push(o); }
    }
    return result;
  }

  getCitasPorConsultorio(idConsultorio: number): any[] {
    return this.ocupacion().filter((o: any) => o.idConsultorio === idConsultorio && o.hora);
  }

  getEstadoColor(estado: string): string {
    return estado === 'CONFIRMADA' ? '#198754' : estado === 'EN_ATENCION' ? '#0d6efd' : '#6c757d';
  }
}
