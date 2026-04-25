import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  title: string;
  desc: string;
  bg: string;
  iconColor: string;
  iconPath: string;
}

interface Stat {
  value: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.css']
})
export class NosotrosComponent {

  features: Feature[] = [
    {
      title: 'Historia clínica electrónica',
      desc: 'Acceso digital a tu historial médico completo',
      bg: '#E6F1FB',
      iconColor: '#185FA5',
      iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8'
    },
    {
      title: 'Gestión digital de citas',
      desc: 'Agenda y administra tus citas en línea',
      bg: '#EAF3DE',
      iconColor: '#3B6D11',
      iconPath: 'M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18'
    },
    {
      title: 'Teleconsulta disponible',
      desc: 'Atención médica desde cualquier lugar',
      bg: '#EEEDFE',
      iconColor: '#534AB7',
      iconPath: 'M23 7l-7 5 7 5V7z M1 5h15v14H1z'
    },
    {
      title: 'Seguimiento a practicantes',
      desc: 'Supervisión y acompañamiento continuo',
      bg: '#FAEEDA',
      iconColor: '#854F0B',
      iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75'
    }
  ];

  stats: Stat[] = [
    { value: '+15k', label: 'Pacientes atendidos', color: '#185FA5' },
    { value: '+50',  label: 'Profesionales',       color: '#3B6D11' },
    { value: '8',    label: 'Especialidades',      color: '#534AB7' },
    { value: '10+',  label: 'Años de servicio',    color: '#854F0B' },
  ];
}