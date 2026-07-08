import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { FarmaciaService, MedicamentoDTO } from '../../services/farmacia.service';

@Component({
  selector: 'app-admin-productos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, PaginationComponent],
  templateUrl: './admin-productos-page.html',
  styleUrl: './admin-productos-page.css'
})
export class AdminProductosPageComponent implements OnInit {
  private service = inject(FarmaciaService);

  productos = signal<MedicamentoDTO[]>([]);
  cargando = signal(true);
  errorMsg = signal<string | null>(null);
  pagina = signal(0);
  totalPaginas = signal(0);
  totalElementos = signal(0);
  searchTerm = signal('');

  mostrarForm = signal(false);
  editando = signal<MedicamentoDTO | null>(null);
  guardando = signal(false);
  archivoFoto: File | null = null;
  form: MedicamentoDTO = this.vacio();

  categorias = ['MEDICAMENTO', 'VITAMINA', 'SUPLEMENTO', 'OTRO'];
  private pageSize = 10;
  private searchTimeout: any;

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.errorMsg.set(null);
    this.service.medicamentos.listar(this.pagina(), this.pageSize).subscribe({
      next: (r) => {
        this.productos.set(r.content);
        this.totalElementos.set(r.totalElements);
        this.totalPaginas.set(r.totalPages);
        this.cargando.set(false);
      },
      error: () => { this.errorMsg.set('Error al cargar productos'); this.cargando.set(false); }
    });
  }

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchTerm.set(val);
  }

  get productosFiltrados() {
    const q = this.searchTerm().toLowerCase();
    if (!q) return this.productos();
    return this.productos().filter(p =>
      p.nombreComercial.toLowerCase().includes(q) ||
      (p.nombreGenerico || '').toLowerCase().includes(q)
    );
  }

  vacio(): MedicamentoDTO {
    return { nombreComercial: '', nombreGenerico: '', presentacion: '', concentracion: '',
      laboratorio: '', stock: 0, precioUnitario: 0, requiereReceta: false,
      descripcion: '', fotoUrl: '', fechaVencimiento: '', categoria: 'MEDICAMENTO', activo: true };
  }

  nuevo() { this.editando.set(null); this.form = this.vacio(); this.archivoFoto = null; this.mostrarForm.set(true); }
  editar(p: MedicamentoDTO) { this.editando.set(p); this.form = { ...p }; this.archivoFoto = null; this.mostrarForm.set(true); }
  cancelar() { this.mostrarForm.set(false); }

  onFileSelected(event: any) { this.archivoFoto = event.target.files[0] || null; }

  guardar() {
    this.guardando.set(true);
    const call = this.editando()
      ? this.service.medicamentos.actualizar(this.editando()!.idMedicamento!, this.form)
      : this.service.medicamentos.crear(this.form);

    call.subscribe({
      next: (prod) => {
        if (this.archivoFoto) {
          const fd = new FormData(); fd.append('file', this.archivoFoto);
          this.service.httpPostFoto(prod.idMedicamento!, fd).subscribe({ next: () => this.finalizar() });
        } else { this.finalizar(); }
      },
      error: (e) => { this.guardando.set(false); alert(e.error?.message || 'Error'); }
    });
  }

  finalizar() { this.guardando.set(false); this.mostrarForm.set(false); this.cargar(); }

  desactivar(p: MedicamentoDTO) {
    if (!confirm(`¿Desactivar ${p.nombreComercial}?`)) return;
    this.service.medicamentos.desactivar(p.idMedicamento!).subscribe({ next: () => this.cargar() });
  }

  onPrevPage() { if (this.pagina() > 0) { this.pagina.update(v => v - 1); this.cargar(); } }
  onNextPage() { if (this.pagina() < this.totalPaginas() - 1) { this.pagina.update(v => v + 1); this.cargar(); } }
  onGoToPage(p: number) { this.pagina.set(p); this.cargar(); }

  getPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.pagina() - 2);
    const end = Math.min(this.totalPaginas() - 1, this.pagina() + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
