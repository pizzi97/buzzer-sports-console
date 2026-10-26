import { Component, inject, signal, computed } from '@angular/core';
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

  // URL corrente tracciato come segnale reattivo
  currentUrl = signal<string>(typeof window !== 'undefined' ? window.location.pathname : '');

  // Mostra Sidebar ed Header SOLO se autenticato E fuori da /login
  showLayout = computed(() => {
    const isLogin = this.currentUrl().includes('/login');
    return this.authService.isAuthenticated() && !isLogin;
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        this.currentUrl.set(url);

        if (url.includes('/login')) {
          this.authService.clearSession();
        }
      });
  }
}

export { AppComponent as App };
