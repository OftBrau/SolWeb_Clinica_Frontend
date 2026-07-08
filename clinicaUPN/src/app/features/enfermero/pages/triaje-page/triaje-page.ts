import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

interface Triaje {
  idTriaje: number;
  idCita: number;
  presionArterial: string;
  temperatura: number;
  frecuenciaCardiaca: number;
  saturacion: number;
  peso: number;
  talla: number;
  motivoConsulta: string;
  notas: string;
}

@Component({
  selector: 'app-triaje-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="content-wrapper">

    <app-page-header title="Triaje" [subtitle]="'Cita #' + idCita()"
      [breadcrumbs]="[{label:'Inicio',link:'/app'},{label:'Agenda'},{label:'Triaje'}]">
    </app-page-header>

    <div *ngIf="loading()" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

    <div *ngIf="exito()" class="alert alert-success alert-dismissible fade show">
      {{ exito() }}
      <button class="btn-close" (click)="exito.set('')"></button>
    </div>

    <div *ngIf="!loading()" class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title mb-3"><i class="bi bi-clipboard2-pulse me-2"></i>Signos Vitales</h6>

            <div class="row g-3">
              <div class="col-sm-6">
                <label class="form-label small fw-semibold">Presion Arterial</label>
                <input class="form-control" placeholder="120/80" [(ngModel)]="formPresionArterial" />
              </div>
              <div class="col-sm-6">
                <label class="form-label small fw-semibold">Temperatura (°C)</label>
                <input class="form-control" type="number" step="0.1" placeholder="36.5" [(ngModel)]="formTemperatura" />
              </div>
              <div class="col-sm-6">
                <label class="form-label small fw-semibold">Frecuencia Cardiaca (lpm)</label>
                <input class="form-control" type="number" placeholder="72" [(ngModel)]="formFrecuenciaCardiaca" />
              </div>
              <div class="col-sm-6">
                <label class="form-label small fw-semibold">Saturacion O2 (%)</label>
                <input class="form-control" type="number" placeholder="98" [(ngModel)]="formSaturacion" />
              </div>
              <div class="col-sm-6">
                <label class="form-label small fw-semibold">Peso (kg)</label>
                <input class="form-control" type="number" step="0.1" placeholder="70" [(ngModel)]="formPeso" />
              </div>
              <div class="col-sm-6">
                <label class="form-label small fw-semibold">Talla (m)</label>
                <input class="form-control" type="number" step="0.01" placeholder="1.70" [(ngModel)]="formTalla" />
              </div>
              <div class="col-12" *ngIf="formPeso() && formTalla() && formTalla()! > 0">
                <div class="alert alert-info py-2 mb-0 small">
                  <strong>IMC:</strong> {{ (formPeso()! / (formTalla()! * formTalla()!)).toFixed(1) }} kg/m²
                  — <span [class.text-success]="imcClass()==='normal'" [class.text-warning]="imcClass()==='sobrepeso'" [class.text-danger]="imcClass()==='obesidad'">
                    {{ imcLabel() }}
                  </span>
                </div>
              </div>
              <div class="col-12">
                <label class="form-label small fw-semibold">Motivo de Consulta</label>
                <textarea class="form-control" rows="2" placeholder="Describe el motivo..." [(ngModel)]="formMotivoConsulta"></textarea>
              </div>
              <div class="col-12">
                <label class="form-label small fw-semibold">Notas Adicionales</label>
                <textarea class="form-control" rows="3" placeholder="Observaciones..." [(ngModel)]="formNotas"></textarea>
              </div>
              <div class="col-12">
                <button class="btn btn-primary" (click)="guardarTriaje()" [disabled]="guardando()">
                  <i class="bi bi-save me-1"></i>
                  {{ guardando() ? 'Guardando...' : 'Guardar Triaje' }}
                </button>
                <a routerLink="/app/enfermero/agenda" class="btn btn-outline-secondary ms-2">Volver a Agenda</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4" *ngIf="triajeExistente()">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title mb-3"><i class="bi bi-clock-history me-2"></i>Ultimo Triaje</h6>
            <dl class="row small mb-0">
              <dt class="col-6">Presion:</dt><dd class="col-6">{{ triajeExistente()?.presionArterial || '—' }}</dd>
              <dt class="col-6">Temp:</dt><dd class="col-6">{{ triajeExistente()?.temperatura || '—' }}°C</dd>
              <dt class="col-6">FC:</dt><dd class="col-6">{{ triajeExistente()?.frecuenciaCardiaca || '—' }} lpm</dd>
              <dt class="col-6">SpO2:</dt><dd class="col-6">{{ triajeExistente()?.saturacion || '—' }}%</dd>
              <dt class="col-6">Peso:</dt><dd class="col-6">{{ triajeExistente()?.peso || '—' }} kg</dd>
              <dt class="col-6">Talla:</dt><dd class="col-6">{{ triajeExistente()?.talla || '—' }} m</dd>
            </dl>
            <hr>
            <p class="small mb-1"><strong>Motivo:</strong> {{ triajeExistente()?.motivoConsulta || '—' }}</p>
            <p class="small mb-0"><strong>Notas:</strong> {{ triajeExistente()?.notas || '—' }}</p>
          </div>
        </div>
      </div>
    </div>

    </div>
  `
})
export class TriajePageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private api = 'http://localhost:8080/api';

  idCita = signal<number>(0);
  triajeExistente = signal<Triaje | null>(null);
  loading = signal(true);
  guardando = signal(false);
  error = signal('');
  exito = signal('');

  formPresionArterial = signal('');
  formTemperatura = signal<number | null>(null);
  formFrecuenciaCardiaca = signal<number | null>(null);
  formSaturacion = signal<number | null>(null);
  formPeso = signal<number | null>(null);
  formTalla = signal<number | null>(null);
  formMotivoConsulta = signal('');
  formNotas = signal('');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idCita.set(+params['idCita']);
      this.cargarTriaje();
    });
  }

  cargarTriaje(): void {
    this.loading.set(true);
    this.http.get<{ data: Triaje }>(`${this.api}/enfermero/triaje/${this.idCita()}`).subscribe({
      next: (r) => {
        if (r.data) {
          const t = r.data;
          this.triajeExistente.set(t);
          this.formPresionArterial.set(t.presionArterial || '');
          this.formTemperatura.set(t.temperatura);
          this.formFrecuenciaCardiaca.set(t.frecuenciaCardiaca);
          this.formSaturacion.set(t.saturacion);
          this.formPeso.set(t.peso);
          this.formTalla.set(t.talla);
          this.formMotivoConsulta.set(t.motivoConsulta || '');
          this.formNotas.set(t.notas || '');
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  imcClass(): string {
    const imc = this.calcularIMC();
    if (!imc) return '';
    if (imc < 18.5) return 'text-info';
    if (imc < 25) return 'normal';
    if (imc < 30) return 'sobrepeso';
    return 'obesidad';
  }

  imcLabel(): string {
    const imc = this.calcularIMC();
    if (!imc) return '';
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  private calcularIMC(): number | null {
    const p = this.formPeso();
    const t = this.formTalla();
    if (!p || !t || t <= 0) return null;
    return p / (t * t);
  }

  guardarTriaje(): void {
    this.guardando.set(true);
    this.error.set('');

    const body: any = {
      idCita: this.idCita(),
      presionArterial: this.formPresionArterial() || null,
      temperatura: this.formTemperatura() ?? null,
      frecuenciaCardiaca: this.formFrecuenciaCardiaca() ?? null,
      saturacion: this.formSaturacion() ?? null,
      peso: this.formPeso() ?? null,
      talla: this.formTalla() ?? null,
      motivoConsulta: this.formMotivoConsulta() || null,
      notas: this.formNotas() || null,
    };

    this.http.post(`${this.api}/enfermero/triaje`, body).subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set('Triaje guardado correctamente');
        setTimeout(() => this.exito.set(''), 4000);
        this.cargarTriaje();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.message || 'Error al guardar triaje');
      }
    });
  }
}
