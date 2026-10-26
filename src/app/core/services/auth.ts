import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = 'https://api-sports.buzzer.dev/api';
  private readonly TOKEN_KEY = 'buzzer_token';
  private readonly USER_KEY = 'buzzer_user';

  readonly tokenSignal = signal<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem(this.TOKEN_KEY) : null,
  );

  readonly currentUser = signal<any | null>(
    typeof window !== 'undefined' && localStorage.getItem(this.USER_KEY)
      ? JSON.parse(localStorage.getItem(this.USER_KEY)!)
      : null,
  );

  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  login(email: string, pass: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, { email, password: pass }).pipe(
      tap((res) => {
        const token = res?.data?.accessToken || res?.accessToken || res?.token;
        const user = res?.data?.user || res?.user;

        if (token) {
          localStorage.setItem(this.TOKEN_KEY, token);
          this.tokenSignal.set(token);
        }

        if (user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.currentUser.set(user);
        }
      }),
    );
  }

  // Azzera storage e stato reattivo
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
