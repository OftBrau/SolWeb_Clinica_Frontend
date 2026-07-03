import { Routes } from '@angular/router';

export const FARMACIA_ROUTES: Routes = [
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos-page/productos-page')
      .then(m => m.ProductosPageComponent)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito-page/carrito-page')
      .then(m => m.CarritoPageComponent)
  },
  {
    path: 'mis-compras',
    loadComponent: () => import('./pages/mis-compras-page/mis-compras-page')
      .then(m => m.MisComprasPageComponent)
  },
  {
    path: 'reclamaciones',
    loadComponent: () => import('./pages/reclamaciones-page/reclamaciones-page')
      .then(m => m.ReclamacionesPageComponent)
  },
  {
    path: 'reclamaciones-admin',
    loadComponent: () => import('./pages/reclamaciones-admin-page/reclamaciones-admin-page')
      .then(m => m.ReclamacionesAdminPageComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-productos-page/admin-productos-page')
      .then(m => m.AdminProductosPageComponent)
  },
  { path: '', redirectTo: 'productos', pathMatch: 'full' }
];
