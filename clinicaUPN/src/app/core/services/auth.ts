import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    rol:   string;
    nombre: string;
    email:  string;
    passwordDefault: boolean;
  };
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  specialty?: string;
  licenseNumber?: string;
}

export interface UserData {
  token: string;
  rol: string;
  nombre: string;
  email: string;
  passwordDefault: boolean;
}

export interface UsuarioPerfil {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly API = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'clinica_token';
  private readonly USER_KEY  = 'clinica_user';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, credentials).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem(this.TOKEN_KEY, res.data.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<{success: boolean; message: string; data: any}> {
    return this.http.post<{success: boolean; message: string; data: any}>(`${this.API}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): UserData | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRol(): string | null {
    return this.getUser()?.rol ?? null;
  }

  isPasswordDefault(): boolean {
    return this.getUser()?.passwordDefault ?? false;
  }

  marcarPasswordCambiada(): void {
    const user = this.getUser();
    if (user) {
      user.passwordDefault = false;
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  obtenerPerfil(): Observable<{ success: boolean; data: UsuarioPerfil }> {
    return this.http.get<{ success: boolean; data: UsuarioPerfil }>(`${this.API}/perfil`);
  }

  actualizarPerfil(data: { nombre: string; apellido: string; telefono: string }): Observable<{ success: boolean; data: UsuarioPerfil }> {
    return this.http.put<{ success: boolean; data: UsuarioPerfil }>(`${this.API}/perfil`, data);
  }

  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.API}/cambiar-password`, { passwordActual, passwordNueva });
  }
}
