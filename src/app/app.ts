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

  isLoginRoute = signal<boolean>(false);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = e.urlAfterRedirects || e.url;
        this.isLoginRoute.set(url.includes('/login'));
      });
  }
}
