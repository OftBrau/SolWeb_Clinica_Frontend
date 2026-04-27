import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  pacienteSeleccionado, modoPanel, tituloPanelTexto,
  cerrarPanel, pacientes, totalElementos
} from '../../signals/pacientes.signals';
import { PacienteDTO, PacienteService } from '../../services/paciente';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css'
})
export class DetalleComponent implements OnInit {

  // Signals del módulo expuestos al template
  readonly pacienteSeleccionado = pacienteSeleccionado;
  readonly modoPanel = modoPanel;
  readonly tituloPanelTexto = tituloPanelTexto;

  // Signals locales
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  form: Partial<PacienteDTO> = this.emptyForm();

  constructor(private pacienteService: PacienteService) {
    // Sincronizar el formulario cuando cambia el paciente seleccionado
    effect(() => {
      const p = pacienteSeleccionado();
      const modo = modoPanel();
      if ((modo === 'editar' || modo === 'ver') && p) {
        this.form = { ...p };
      } else if (modo === 'nuevo') {
        this.form = this.emptyForm();
      }
    });
  }

  ngOnInit(): void {}

  private emptyForm(): Partial<PacienteDTO> {
    return {
      nombre: '', apellido: '', email: '', password: '',
      telefono: '', genero: '', fechaNacimiento: '',
      codigoEstudiante: '', tipoSangre: '', alergias: ''
    };
  }

  activarEdicion(): void {
    modoPanel.set('editar');
    this.form = { ...pacienteSeleccionado()! };
  }

  getInitials(): string {
    const p = pacienteSeleccionado();
    if (!p) return '';
    return `${p.nombre?.charAt(0) ?? ''}${p.apellido?.charAt(0) ?? ''}`.toUpperCase();
  }

  onSubmit(): void {
    this.formError.set(null);

    if (!this.form.nombre || !this.form.apellido || !this.form.email ||
        !this.form.fechaNacimiento || !this.form.genero) {
      this.formError.set('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (modoPanel() === 'nuevo' && (!this.form.password || this.form.password.length < 6)) {
      this.formError.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.saving.set(true);

    if (modoPanel() === 'editar' && pacienteSeleccionado()?.idPaciente) {
      this.pacienteService
        .actualizar(pacienteSeleccionado()!.idPaciente!, this.form as PacienteDTO)
        .subscribe({
          next: (updated) => {
            // Actualizar el registro en la lista sin recargar
            pacientes.update(lista =>
              lista.map(p => p.idPaciente === updated.idPaciente ? updated : p)
            );
            this.saving.set(false);
            cerrarPanel();
          },
          error: (err) => {
            this.formError.set('Error al actualizar el paciente.');
            this.saving.set(false);
            console.error(err);
          }
        });
    } else {
      this.pacienteService.registrar(this.form as PacienteDTO).subscribe({
        next: (nuevo) => {
          pacientes.update(lista => [nuevo, ...lista]);
          totalElementos.update(v => v + 1);
          this.saving.set(false);
          cerrarPanel();
        },
        error: (err) => {
          this.formError.set('Error al registrar el paciente.');
          this.saving.set(false);
          console.error(err);
        }
      });
    }
  }

  onClose(): void {
    cerrarPanel();
  }
}