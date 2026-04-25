import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // login SIN layout
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login-page/login-page')
      .then(m => m.LoginPageComponent)
  },

  // público CON navbar
  {
    path: '',
    loadComponent: () => import('./shared/layouts/public-layout/public-layout')
      .then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/pages/landing-page/landing-page')
          .then(m => m.LandingPageComponent)
      }
    ]
  },

  // privado CON sidebar
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layouts/private-layout/private-layout')
      .then(m => m.PrivateLayoutComponent),
    children: [
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
      { path: 'pacientes',        loadChildren: () => import('./features/pacientes/pacientes.routes').then(m => m.PACIENTES_ROUTES) },
      { path: 'citas',            loadChildren: () => import('./features/citas/citas.routes').then(m => m.CITAS_ROUTES) },
      { path: 'historia-clinica', loadChildren: () => import('./features/historia-clinica/historia-clinica.routes').then(m => m.HCE_ROUTES) },
      { path: 'teleconsulta',     loadChildren: () => import('./features/teleconsulta/teleconsulta.routes').then(m => m.TELECONSULTA_ROUTES) },
      { path: 'reportes',         loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES) },
      { path: 'practicantes',     loadChildren: () => import('./features/practicantes/practicantes.routes').then(m => m.PRACTICANTES_ROUTES) },
    ]
  },

  { path: '**', redirectTo: '' }
];