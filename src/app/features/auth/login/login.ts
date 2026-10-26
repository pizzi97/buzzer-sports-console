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
    // Credenziali ufficiali dal PDF: org@buzzer.dev / Organisation 123!
    this.quickLogin('org@buzzer.dev', 'Organisation 123!');
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
        this.router.navigate(['/sports']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.error?.message ||
            'Credenziali errate o server in fase di riavvio (Render free tier).',
        );
      },
    });
  }
}
