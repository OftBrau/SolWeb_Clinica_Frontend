import { signal, computed } from '@angular/core';
import { PacienteDTO } from '../services/paciente';

// ============================================================
//  pacientes.signals.ts
//  Estado reactivo global del módulo pacientes
// ============================================================

/** Lista de pacientes cargada */
export const pacientes = signal<PacienteDTO[]>([]);

/** Paciente seleccionado (detalle / edición) */
export const pacienteSeleccionado = signal<PacienteDTO | null>(null);

/** Estado del panel lateral */
export const panelAbierto = signal<boolean>(false);
export const modoPanel = signal<'nuevo' | 'ver' | 'editar'>('nuevo');

/** Paginación */
export const paginaActual = signal<number>(0);
export const totalElementos = signal<number>(0);
export const totalPaginas = signal<number>(0);

/** Estado de carga y error */
export const cargando = signal<boolean>(false);
export const errorMsg = signal<string | null>(null);

/** Computed: texto del título del panel */
export const tituloPanelTexto = computed(() => {
  switch (modoPanel()) {
    case 'nuevo':   return 'Registrar paciente';
    case 'editar':  return 'Editar paciente';
    case 'ver':     return 'Detalle del paciente';
  }
});

/** Computed: total de pacientes como texto */
export const totalTexto = computed(() => `${totalElementos()} registrados`);

// --- Acciones ---

export function abrirPanelNuevo(): void {
  pacienteSeleccionado.set(null);
  modoPanel.set('nuevo');
  panelAbierto.set(true);
}

export function abrirPanelVer(p: PacienteDTO): void {
  pacienteSeleccionado.set(p);
  modoPanel.set('ver');
  panelAbierto.set(true);
}

export function abrirPanelEditar(p: PacienteDTO): void {
  pacienteSeleccionado.set(p);
  modoPanel.set('editar');
  panelAbierto.set(true);
}

export function cerrarPanel(): void {
  panelAbierto.set(false);
  pacienteSeleccionado.set(null);
}