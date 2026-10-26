import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'Operator' | 'VIEWER' | 'organisation' | string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Usa tassativamente l'endpoint configurato nell'environment
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'buzzer_token';
  private readonly USER_KEY = 'buzzer_user';

  readonly tokenSignal = signal<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem(this.TOKEN_KEY) : null,
  );

  readonly currentUser = signal<User | null>(
    typeof window !== 'undefined' && localStorage.getItem(this.USER_KEY)
      ? JSON.parse(localStorage.getItem(this.USER_KEY)!)
      : null,
  );

  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  getToken(): string | null {
    return (
      this.tokenSignal() ||
      (typeof window !== 'undefined' ? localStorage.getItem(this.TOKEN_KEY) : null)
    );
  }

  fetchCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/auth/me`).pipe(
      tap((res) => {
        const user = res?.data?.user || res?.data || res?.user || res;
        if (user) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          }
          this.currentUser.set(user);
        }
      }),
      catchError(() => of(this.currentUser())),
    );
  }

  login(email: string, pass: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, { email, password: pass }).pipe(
      tap((res) => {
        const token = res?.accessToken || res?.token || res?.data?.accessToken || res?.data?.token;
        const user = res?.user || res?.data?.user;

        if (token) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(this.TOKEN_KEY, token);
          }
          this.tokenSignal.set(token);
        }

        if (user) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          }
          this.currentUser.set(user);
        }
      }),
    );
  }

  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.tokenSignal.set(null);
    this.currentUser.set(null);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }
}
