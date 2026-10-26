import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { SportsComponent } from './pages/sports/sports';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'sports',
    component: SportsComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'sports', pathMatch: 'full' },
  { path: '**', redirectTo: 'sports' },
];
