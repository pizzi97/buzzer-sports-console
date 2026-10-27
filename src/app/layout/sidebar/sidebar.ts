import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Ricava le info dell'utente corrente (dal servizio o dal payload del JWT)
  readonly currentUser = computed(() => {
    // Se authService espone già un signal/metodo currentUser usalo,
    // altrimenti decodifica direttamente il token salvato
    const token = this.authService.getToken();
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      return JSON.parse(payloadJson);
    } catch {
      return null;
    }
  });

  readonly userRole = computed(() => this.currentUser()?.role || 'GUEST');
  readonly userEmail = computed(() => this.currentUser()?.email || 'user@buzzer.dev');
  readonly avatarInitial = computed(() => (this.userEmail().charAt(0) || 'U').toUpperCase());

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}

export {SidebarComponent as Sidebar};
