import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  pacientes, cargando, errorMsg, totalTexto,
  paginaActual, totalPaginas, totalElementos,
  abrirPanelNuevo, abrirPanelVer, abrirPanelEditar
} from '../../signals/pacientes.signals';
import { PacienteDTO, PacienteService } from '../../services/paciente';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista.html',
  styleUrl: './lista.css'
})
export class ListaComponent implements OnInit {

  // Signals expuestos al template
  readonly pacientes = pacientes;
  readonly cargando = cargando;
  readonly errorMsg = errorMsg;
  readonly totalTexto = totalTexto;
  readonly paginaActual = paginaActual;
  readonly totalPaginas = totalPaginas;

  readonly searchTerm = signal('');

  private pageSize = 10;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private pacienteService: PacienteService) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    cargando.set(true);
    errorMsg.set(null);
    this.pacienteService.listar(paginaActual(), this.pageSize).subscribe({
      next: (result) => {
        pacientes.set(result.content);
        totalElementos.set(result.totalElements);
        totalPaginas.set(result.totalPages);
        cargando.set(false);
      },
      error: (err) => {
        errorMsg.set('No se pudo cargar la lista de pacientes.');
        cargando.set(false);
        console.error(err);
      }
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      paginaActual.set(0);
      this.cargarPacientes();
    }, 350);
  }

  getInitials(p: PacienteDTO): string {
    return `${p.nombre?.charAt(0) ?? ''}${p.apellido?.charAt(0) ?? ''}`.toUpperCase();
  }

  onVerDetalle(p: PacienteDTO): void  { abrirPanelVer(p); }
  onEditar(p: PacienteDTO): void      { abrirPanelEditar(p); }
  onNuevoPaciente(): void             { abrirPanelNuevo(); }

  onDesactivar(p: PacienteDTO): void {
    if (!p.idPaciente) return;
    if (!confirm(`¿Desactivar a ${p.nombre} ${p.apellido}?`)) return;
    this.pacienteService.desactivar(p.idPaciente).subscribe({
      next: () => this.cargarPacientes(),
      error: (err) => {
        alert('Error al desactivar paciente.');
        console.error(err);
      }
    });
  }

  onPrevPage(): void {
    if (paginaActual() > 0) {
      paginaActual.update(v => v - 1);
      this.cargarPacientes();
    }
  }

  onNextPage(): void {
    if (paginaActual() < totalPaginas() - 1) {
      paginaActual.update(v => v + 1);
      this.cargarPacientes();
    }
  }

  onGoToPage(page: number): void {
    paginaActual.set(page);
    this.cargarPacientes();
  }

  getPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, paginaActual() - 2);
    const end   = Math.min(totalPaginas() - 1, paginaActual() + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}