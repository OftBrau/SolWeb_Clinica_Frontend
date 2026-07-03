import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../../core/services/auth';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styles: [`
    :host { display: flex; min-height: 100vh; }
    .login-container { display: flex; width: 100%; min-height: 100vh; }
    .login-left { flex: 1; background: linear-gradient(135deg, #0a66c2 0%, #185fa5 50%, #0d47a1 100%); display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--bs-body-bg); }
    .login-card { width: 100%; max-width: 420px; }
    .brand-info { color: #fff; text-align: center; max-width: 400px; }
    .brand-info h1 { font-size: 2.2rem; font-weight: 700; margin-bottom: .5rem; }
    .brand-info p { opacity: .85; font-size: 1rem; }
    .form-control { border-radius: 10px; padding: 10px 14px; }
    .btn-login { border-radius: 10px; padding: 12px; font-weight: 600; }
    .tab-btns { display: flex; gap: 0; margin-bottom: 1.5rem; border-radius: 10px; overflow: hidden; border: 1px solid var(--bs-border-color); }
    .tab-btn { flex: 1; padding: 10px; border: none; background: var(--bs-body-bg); font-weight: 600; cursor: pointer; transition: all .2s; }
    .tab-btn.active { background: var(--bs-primary); color: #fff; }
    .divider { display: flex; align-items: center; margin: 1rem 0; color: var(--bs-secondary-color); }
    .divider::before, .divider::after { content:''; flex:1; height:1px; background:var(--bs-border-color); }
    .divider span { padding: 0 8px; font-size: .8rem; }
    @media (max-width: 768px) { .login-left { display: none; } .login-right { flex: 1; } }
  `]
})
export class LoginPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  returnUrl = '';

  // Login
  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  // Tab
  tab = signal<'login'|'register'>('login');

  // Register
  regFirst = signal('');
  regLast = signal('');
  regEmail = signal('');
  regPass = signal('');
  regRole = signal('PRACTICANTE');
  regError = signal('');
  regLoading = signal(false);
  regOk = signal(false);

  constructor() {
    this.returnUrl = this.router.parseUrl(this.router.url).queryParams['return'] || '';
  }

  onLogin() {
    if (!this.email() || !this.password()) { this.error.set('Completa todos los campos'); return; }
    this.loading.set(true); this.error.set('');
    this.auth.login({ email: this.email(), password: this.password() }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.navegar(res.data.rol);
      },
      error: (err) => {
        this.error.set(err.status === 401 ? 'Credenciales incorrectas' : 'Error del servidor');
        this.loading.set(false);
      }
    });
  }

  navegar(rol: string): void {
    if (this.returnUrl) { this.router.navigateByUrl(this.returnUrl); return; }
    const r = (rol ?? '').toUpperCase();
    const rutas: Record<string, string> = {
      ADMINISTRADOR: '/app/pacientes', ADMINISTRATIVO: '/app/pacientes',
      DOCTOR: '/app/citas', MEDICO: '/app/citas', PRACTICANTE: '/app/mis-tareas',
      DIRECTOR: '/app/dashboard', PACIENTE: '/app/mis-citas', PATIENT: '/app/mis-citas',
    };
    this.router.navigate([rutas[r] || '/app']);
  }

  onRegister() {
    if (!this.regFirst() || !this.regLast() || !this.regEmail() || !this.regPass()) {
      this.regError.set('Completa todos los campos'); return;
    }
    if (this.regPass().length < 6) { this.regError.set('Contraseña mínimo 6 caracteres'); return; }

    this.regLoading.set(true); this.regError.set('');
    const req: RegisterRequest = {
      firstName: this.regFirst(),
      lastName: this.regLast(),
      email: this.regEmail(),
      password: this.regPass(),
      role: this.regRole(),
    };
    this.auth.register(req).subscribe({
      next: (res) => {
        this.regLoading.set(false);
        this.regOk.set(true);
        // Login automático
        this.email.set(this.regEmail());
        this.password.set(this.regPass());
        setTimeout(() => this.onLogin(), 1500);
      },
      error: (err) => {
        this.regError.set(err.error?.message || 'Error al registrarse');
        this.regLoading.set(false);
      }
    });
  }
}
