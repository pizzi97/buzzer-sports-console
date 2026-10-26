import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  rememberMe = true;
  showPassword = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  forgotNotice = signal<boolean>(false);

  ngOnInit(): void {
    // Se si torna a /login con la freccia "Indietro", azzera subito la sessione
    if (this.authService.isAuthenticated()) {
      this.authService.clearSession();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  onForgotClick(): void {
    this.forgotNotice.set(true);
    setTimeout(() => this.forgotNotice.set(false), 6000);
  }

  closeForgotNotice(): void {
    this.forgotNotice.set(false);
  }

  quickLogin(email: string, pass: string): void {
    this.email = email;
    this.password = pass;
    this.forgotNotice.set(false);
    this.onSubmit();
  }

  quickLoginOrg(): void {
    this.forgotNotice.set(false);
    this.loading.set(true);
    this.errorMessage.set(null);

    this.email = 'organisation@buzzer.dev';
    this.password = 'Organisation123!';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/sports']); // Navigazione normale, SENZA replaceUrl
      },
      error: () => {
        this.email = 'organization@buzzer.dev';
        this.password = 'Organization123!';

        this.authService.login(this.email, this.password).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/sports']);
          },
          error: () => {
            this.email = 'org@buzzer.dev';
            this.password = 'Org123!';

            this.authService.login(this.email, this.password).subscribe({
              next: () => {
                this.loading.set(false);
                this.router.navigate(['/sports']);
              },
              error: (finalErr) => {
                this.loading.set(false);
                this.errorMessage.set(
                  finalErr.error?.message || 'Impossibile accedere con account Organisation demo.',
                );
              },
            });
          },
        });
      },
    });
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage.set('Inserisci email e password.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/sports']); // Navigazione normale, SENZA replaceUrl
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Credenziali non valide o errore del server.');
      },
    });
  }
}
