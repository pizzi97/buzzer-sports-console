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
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: SportsComponent,
      },
      {
        path: ':sportId',
        loadComponent: () =>
          import('./pages/sports/sport-detail/sport-detail').then((m) => m.SportDetail),
      },
      {
        path: ':sportId/governing-bodies/:gbId',
        loadComponent: () =>
          import('./pages/sports/governing-body-detail/governing-body-detail').then(
            (m) => m.GoverningBodyDetail,
          ),
      },
      {
        path: ':sportId/governing-bodies/:gbId/organizations/:orgId',
        loadComponent: () =>
          import('./pages/sports/organization-detail/organization-detail').then(
            (m) => m.OrganizationDetail,
          ),
      },
      {
        path: ':sportId/governing-bodies/:gbId/organizations/:orgId/participants/:participantId',
        loadComponent: () =>
          import('./pages/sports/participant-detail/participant-detail').then(
            (m) => m.ParticipantDetail,
          ),
      },
    ],
  },
  { path: '', redirectTo: 'sports', pathMatch: 'full' },
  { path: '**', redirectTo: 'sports' },
];
