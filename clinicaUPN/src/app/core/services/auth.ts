import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// ============================================================
//  auth.service.ts
//  core/services/auth.service.ts
// ============================================================

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
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly API = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'clinica_token';
  private readonly USER_KEY  = 'clinica_user';

  // --- Login ---
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

  // --- Logout ---
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  // --- Obtener token ---
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // --- Obtener usuario actual ---
  getUser(): LoginResponse['data'] | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // --- Verificar si está autenticado ---
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // --- Obtener rol ---
  getRol(): string | null {
    return this.getUser()?.rol ?? null;
  }
}