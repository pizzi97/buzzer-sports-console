import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { HeaderComponent } from './layout/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  // Segnale che indica se siamo sulla schermata di autenticazione
  isAuthPage = signal<boolean>(false);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const isLogin = event.urlAfterRedirects.includes('/login') || event.url.includes('/login');
        this.isAuthPage.set(isLogin);

        // Se l'utente torna indietro su /login, azzera la sessione in modo pulito
        if (isLogin && this.authService.isAuthenticated()) {
          this.authService.clearSession();
        }
      });
  }
}

export { AppComponent as App };
