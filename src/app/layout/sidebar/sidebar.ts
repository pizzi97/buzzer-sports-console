import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isCollapsed = signal<boolean>(false);

  // Computed reattivi: se currentUser cambia, il template si aggiorna istantaneamente
  readonly currentUser = this.authService.currentUser;

  readonly userEmail = computed(() => {
    return this.currentUser()?.email || 'admin@buzzer.dev';
  });

  readonly userRole = computed(() => {
    return this.currentUser()?.role || 'ADMIN';
  });

  readonly userInitial = computed(() => {
    const email = this.userEmail();
    return email ? email.charAt(0).toUpperCase() : 'U';
  });

  toggleCollapse(): void {
    this.isCollapsed.update((state) => !state);
  }

  logout(): void {
    this.authService.logout();
  }
}

export { SidebarComponent as Sidebar };
