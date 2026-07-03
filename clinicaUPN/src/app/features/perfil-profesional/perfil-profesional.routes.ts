import { Routes } from '@angular/router';

export const PERFIL_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/mi-perfil-page/mi-perfil-page').then(m => m.MiPerfilPageComponent) },
  { path: 'practicantes', loadComponent: () => import('./pages/practicantes-page/practicantes-page').then(m => m.PracticantesPageComponent) },
];
