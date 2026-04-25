import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
  {
    path: 'pacientes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/pacientes/pacientes.routes')
      .then(m => m.PACIENTES_ROUTES)
  },
  {
    path: 'citas',
    canActivate: [authGuard],
    loadChildren: () => import('./features/citas/citas.routes')
      .then(m => m.CITAS_ROUTES)
  },
  {
    path: 'historia-clinica',
    canActivate: [authGuard],
    loadChildren: () => import('./features/historia-clinica/historia-clinica.routes')
      .then(m => m.HCE_ROUTES)
  },
  {
    path: 'teleconsulta',
    canActivate: [authGuard],
    loadChildren: () => import('./features/teleconsulta/teleconsulta.routes')
      .then(m => m.TELECONSULTA_ROUTES)
  },
  {
    path: 'reportes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/reportes/reportes.routes')
      .then(m => m.REPORTES_ROUTES)
  },
  {
    path: 'practicantes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/practicantes/practicantes.routes')
      .then(m => m.PRACTICANTES_ROUTES)
  },
  { path: 'login', loadComponent: () => import('./features/auth/pages/login-page/login-page')
      .then(m => m.LoginPageComponent) },
  { path: '**', redirectTo: 'pacientes' }
];