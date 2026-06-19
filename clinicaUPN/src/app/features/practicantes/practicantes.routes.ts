import { Routes } from '@angular/router';
import { AgendaPageComponent } from './pages/agenda-page/agenda-page';
import { RegistrarConsultaPageComponent } from './pages/registrar-consulta-page/registrar-consulta-page';
import { EvaluacionesPageComponent } from './pages/evaluaciones-page/evaluaciones-page';
import { AsignarPageComponent } from './pages/asignar-page/asignar-page';
import { MisPracticantesPageComponent } from './pages/mis-practicantes-page/mis-practicantes-page';

export const PRACTICANTES_ROUTES: Routes = [
  { path: '', redirectTo: 'agenda', pathMatch: 'full' },
  { path: 'agenda', component: AgendaPageComponent },
  { path: 'registrar-consulta', component: RegistrarConsultaPageComponent },
  { path: 'evaluaciones', component: EvaluacionesPageComponent },
  { path: 'asignar', component: AsignarPageComponent },
  { path: 'mis-practicantes', component: MisPracticantesPageComponent },
];
