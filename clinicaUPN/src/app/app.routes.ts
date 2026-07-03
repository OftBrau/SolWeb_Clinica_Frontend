import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { AuthService } from './core/services/auth';

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
      },
      {
        path: 'farmacia',
        loadComponent: () => import('./features/farmacia/pages/productos-page/productos-page')
          .then(m => m.ProductosPageComponent)
      },
      {
        path: 'farmacia/reclamaciones',
        loadComponent: () => import('./features/farmacia/pages/reclamaciones-page/reclamaciones-page')
          .then(m => m.ReclamacionesPageComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/farmacia/pages/checkout-page/checkout-page')
          .then(m => m.CheckoutPageComponent)
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
      {
        path: '',
        pathMatch: 'full',
        canActivate: [() => {
          const auth = inject(AuthService);
          const router = inject(Router);
          const rol = auth.getRol();
          const rutas: Record<string, string> = {
            ADMINISTRADOR:  'pacientes',
            ADMINISTRATIVO: 'pacientes',
            DOCTOR:         'mi-agenda',
            MEDICO:         'mi-agenda',
            PRACTICANTE:    'practicantes/agenda',
            DIRECTOR:       'dashboard',
            PACIENTE:       'doctors',
            PATIENT:        'doctors',
          };
          return router.parseUrl(rutas[rol ?? ''] || 'pacientes');
        }],
        children: []
      },
      { path: 'pacientes',        loadChildren: () => import('./features/pacientes/pacientes.routes').then(m => m.PACIENTES_ROUTES) },
      { path: 'citas',            loadChildren: () => import('./features/citas/citas.routes').then(m => m.CITAS_ROUTES) },
      { path: 'historia-clinica', loadChildren: () => import('./features/historia-clinica/historia-clinica.routes').then(m => m.HCE_ROUTES) },
      { path: 'teleconsulta',     loadChildren: () => import('./features/teleconsulta/teleconsulta.routes').then(m => m.TELECONSULTA_ROUTES) },
      { path: 'farmacia',         loadChildren: () => import('./features/farmacia/farmacia.routes').then(m => m.FARMACIA_ROUTES) },
      { path: 'perfil-profesional', loadChildren: () => import('./features/perfil-profesional/perfil-profesional.routes').then(m => m.PERFIL_ROUTES) },
      { path: 'invitaciones', loadComponent: () => import('./features/invitaciones/invitaciones-page').then(m => m.InvitacionesPageComponent) },
      { path: 'mis-tareas', loadComponent: () => import('./features/tareas/tareas-page').then(m => m.TareasPageComponent) },
      { path: 'reporte-rafa', loadComponent: () => import('./features/tareas/rafa-page').then(m => m.RafaPageComponent) },
      { path: 'reportes',         loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES) },
      { path: 'practicantes',     loadChildren: () => import('./features/practicantes/practicantes.routes').then(m => m.PRACTICANTES_ROUTES) },
      { path: 'mis-citas',        loadComponent: () => import('./features/patient/pages/my-appointments-page/my-appointments-page').then(m => m.MyAppointmentsPageComponent) },
      { path: 'mi-perfil',        loadComponent: () => import('./features/pacientes/pages/mi-perfil-page/mi-perfil-page').then(m => m.MiPerfilPageComponent) },
      { path: 'mi-historia',      loadComponent: () => import('./features/historia-clinica/pages/hce-paciente-page/hce-paciente-page').then(m => m.HcePacientePageComponent) },
      { path: 'dashboard',        canActivate: [roleGuard(['ADMINISTRADOR', 'DIRECTOR'])], loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
      { path: 'consultorios',     canActivate: [roleGuard(['ADMINISTRADOR', 'ADMINISTRATIVO'])], loadChildren: () => import('./features/consultorios/consultorios.routes').then(m => m.CONSULTORIOS_ROUTES) },
      { path: 'doctores',         canActivate: [roleGuard(['ADMINISTRADOR', 'DIRECTOR'])], loadChildren: () => import('./features/doctores/doctores.routes').then(m => m.DOCTORES_ROUTES) },
      { path: 'evaluaciones-practicantes', canActivate: [roleGuard(['ADMINISTRADOR', 'DOCTOR', 'DIRECTOR'])], loadChildren: () => import('./features/evaluaciones-practicantes/evaluaciones-practicantes.routes').then(m => m.EVALUACIONES_PRACTICANTES_ROUTES) },
      { path: 'usuarios',         canActivate: [roleGuard(['ADMINISTRADOR'])], loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES) },
      { path: 'mi-horario',       canActivate: [roleGuard(['DOCTOR', 'MEDICO'])], loadComponent: () => import('./features/doctor/pages/mi-horario-page/mi-horario-page').then(m => m.MiHorarioPageComponent) },
      { path: 'mi-agenda',        canActivate: [roleGuard(['DOCTOR', 'MEDICO'])], loadComponent: () => import('./features/doctor/pages/mi-agenda-page/mi-agenda-page').then(m => m.MiAgendaPageComponent) },
      { path: 'doctors',          canActivate: [roleGuard(['PACIENTE', 'PATIENT'])], loadComponent: () => import('./features/patient/pages/doctor-list-page/doctor-list-page').then(m => m.DoctorListPageComponent) },
      { path: 'booking/:doctorId', canActivate: [roleGuard(['PACIENTE', 'PATIENT'])], loadComponent: () => import('./features/patient/pages/booking-page/booking-page').then(m => m.BookingPageComponent) },
    ]
  },

  { path: '**', redirectTo: '' }
];