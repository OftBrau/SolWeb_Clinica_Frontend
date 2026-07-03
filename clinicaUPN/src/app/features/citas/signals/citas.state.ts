import { signal, computed } from '@angular/core';
import { CitaDTO } from '../services/cita';

export const misCitas = signal<CitaDTO[]>([]);
export const cargando = signal(false);
export const errorMsg = signal<string | null>(null);

const hoy = () => new Date().toISOString().split('T')[0];

export const citasPendientes = computed(() =>
  misCitas().filter(c =>
    (c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA') && c.fecha >= hoy()
  )
);

export const citasPasadas = computed(() =>
  misCitas().filter(c =>
    c.fecha < hoy() || c.estado === 'COMPLETADA' || c.estado === 'CANCELADA' || c.estado === 'ATENDIDA'
  )
);

export function cargarCitas(citas: CitaDTO[]) {
  misCitas.set(citas);
}

export function eliminarCita(id: number) {
  misCitas.update(lista => lista.filter(c => c.idCita !== id));
}

export function actualizarCita(actualizada: CitaDTO) {
  misCitas.update(lista =>
    lista.map(c => c.idCita === actualizada.idCita ? actualizada : c)
  );
}

export function marcarCancelada(id: number) {
  misCitas.update(lista =>
    lista.map(c => c.idCita === id ? { ...c, estado: 'CANCELADA' } : c)
  );
}
