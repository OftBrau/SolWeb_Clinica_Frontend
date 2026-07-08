export type RolUsuario =
  | 'ADMINISTRADOR'
  | 'ADMINISTRATIVO'
  | 'DOCTOR'
  | 'MEDICO'
  | 'DIRECTOR'
  | 'PRACTICANTE'
  | 'PACIENTE'
  | 'PATIENT'
  | 'ASISTENTE'
  | 'ENFERMERO';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
}
