import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

// ============================================================
//  login-page.component.ts
//  Cambio clave: username → email (alineado con el backend)
// ============================================================
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  onLogin() {
    if (!this.email() || !this.password()) {
      this.error.set('Completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService
      .login({
        email: this.email(),
        password: this.password(),
      })
      .subscribe({
        next: (res) => {
          // Redirigir según rol
          const rol = res.data.rol;
          switch (rol) {
            case 'ADMINISTRADOR':
            case 'ADMINISTRATIVO':
              this.router.navigate(['/app/pacientes']);
              break;
            case 'DOCTOR':
            case 'PRACTICANTE':
              this.router.navigate(['/app/agenda']);
              break;
            case 'DIRECTOR':
              this.router.navigate(['/app/dashboard']);
              break;
            case 'PACIENTE':
              this.router.navigate(['/app/mis-citas']);
              break;
            default:
              this.router.navigate(['/app']);
          }
        },
        error: (err) => {
          this.error.set(
            err.status === 401
              ? 'Usuario o contraseña incorrectos'
              : 'Error del servidor, intenta más tarde',
          );
          this.loading.set(false);
        },
      });
  }
}
