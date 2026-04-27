import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaComponent } from '../../components/lista/lista';
import { DetalleComponent } from '../../components/detalle/detalle';
import { panelAbierto } from '../../signals/pacientes.signals';

@Component({
  selector: 'app-paciente-page',
  standalone: true,
  imports: [CommonModule, ListaComponent, DetalleComponent],
  templateUrl: './paciente-page.html',
  styleUrl: './paciente-page.css',
})
export class PacientePageComponent {
  readonly panelAbierto = panelAbierto;
}