import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer';

type Lang = 'es' | 'en';

interface Translations {
  [key: string]: Record<Lang, string>;
}

const TRADUCCIONES: Translations = {
  inicio:          { es: 'Inicio',          en: 'Home' },
  servicios:       { es: 'Servicios',       en: 'Services' },
  nosotros:        { es: 'Nosotros',        en: 'About' },
  especialidades:  { es: 'Especialidades',  en: 'Specialties' },
  contacto:        { es: 'Contacto',        en: 'Contact' },
  irAlSistema:     { es: 'Ir al sistema',   en: 'Go to system' },
  ingresar:        { es: 'Ingresar',        en: 'Login' },
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, CartDrawerComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  protected themeService = inject(ThemeService);

  activeSection = 'inicio';

  get currentLang(): Lang {
    return this.languageService.currentLang as Lang || 'es';
  }

  switchLang(lang: Lang): void {
    this.languageService.setLang(lang);
  }

  langText(key: string): string {
    return TRADUCCIONES[key]?.[this.currentLang] || key;
  }

  get tieneToken(): boolean {
    return this.authService.isAuthenticated(); // usa la clave correcta 'clinica_token'
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  irAlSistema(): void {
    const rol = this.authService.getRol();
    const rutas: Record<string, string> = {
      ADMINISTRADOR:  '/app/pacientes',
      ADMINISTRATIVO: '/app/pacientes',
      DOCTOR:         '/app/citas',
      MEDICO:         '/app/citas',
      PRACTICANTE:    '/app/practicantes/agenda',
      DIRECTOR:       '/app/dashboard',
      PACIENTE:       '/app/mis-citas',
      PATIENT:        '/app/mis-citas',
    };
    this.router.navigate([rutas[rol ?? ''] || '/app']);
  }

  @HostListener('window:scroll')
  onScroll() {
    const sections = ['inicio', 'servicios', 'especialidades', 'nosotros', 'contacto'];
    for (const id of [...sections].reverse()) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 110) {
        this.activeSection = id;
        break;
      }
    }
  }
}