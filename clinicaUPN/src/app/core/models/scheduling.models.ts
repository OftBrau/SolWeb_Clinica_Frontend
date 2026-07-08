export interface AuthResponse {
  token: string;
  user: UserDTO;
}

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'DOCTOR' | 'PACIENTE';
}

export interface DoctorSummaryDTO {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
}

export interface AvailabilityTemplateDTO {
  id?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityOverrideDTO {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
  overrideType: 'BLOCK' | 'ADD';
  reason?: string;
}

export interface CreateOverrideRequest {
  date: string;
  startTime: string;
  endTime: string;
  overrideType: 'BLOCK' | 'ADD';
  reason?: string;
}

export interface AvailableDateDTO {
  date: string;
  slotCount: number;
}

export interface TimeSlotDTO {
  startTime: string;
  endTime: string;
}

export interface AppointmentDTO {
  id: number;
  doctorId: number;
  doctorName: string;
  patientId: number;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt: string;
  tipoReserva?: string;
  montoExtra?: number;
  tipo?: string;
  motivo?: string;
  idEspecialidad?: number;
}

export interface BookAppointmentRequest {
  doctorId: number;
  date: string;
  startTime: string;
}

export interface UpdateStatusRequest {
  status: string;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
}
