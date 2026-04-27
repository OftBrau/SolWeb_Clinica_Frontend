import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {

  constructor(private authService: AuthService) {}

  get nombreUsuario(): string {
    return this.authService.getUser()?.nombre ?? 'Usuario';
  }

  get rolUsuario(): string {
    return this.authService.getUser()?.rol ?? '';
  }

  cerrarSesion(): void {
    this.authService.logout(); // ya limpia localStorage y redirige al login
  }
}