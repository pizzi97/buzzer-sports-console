import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = 'https://backend-3ofw.onrender.com/api';
  private readonly TOKEN_KEY = 'buzzer_jwt_token';
  private readonly USER_KEY = 'buzzer_user';

  private tokenSignal = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  currentUser = signal<UserProfile | null>(
    localStorage.getItem(this.USER_KEY) ? JSON.parse(localStorage.getItem(this.USER_KEY)!) : null,
  );

  isAuthenticated = computed(() => !!this.tokenSignal());

  getToken(): string | null {
    return this.tokenSignal();
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.API_URL}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          // Estrazione corretta da res.data
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

  fetchCurrentUser(): Observable<UserProfile | null> {
    if (!this.tokenSignal()) {
      return of(null);
    }
    return this.http.get<any>(`${this.API_URL}/auth/me`).pipe(
      tap((res) => {
        const user = res?.data || res;
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.tokenSignal.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
