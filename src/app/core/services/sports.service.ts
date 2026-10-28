import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Sport {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  governingBodiesCount?: number;
  organisationsCount?: number;
  participantsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SportsResponse {
  success: boolean;
  data: Sport[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SportsStats {
  totalSports: number;
  totalGoverningBodies: number;
  totalOrganisations: number;
  totalParticipants: number;
}

@Injectable({
  providedIn: 'root',
})
export class SportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/+$/, '')}/organizations`;

  readonly sports = signal<Sport[]>([]);
  readonly loading = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalPages = signal<number>(1);
  readonly totalItems = signal<number>(0);

  readonly stats = signal<SportsStats>({
    totalSports: 0,
    totalGoverningBodies: 0,
    totalOrganisations: 0,
    totalParticipants: 0,
  });

  getSports(search: string = '', page: number = 1, limit: number = 10): Observable<SportsResponse> {
    this.loading.set(true);
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<SportsResponse>(`${this.baseUrl}/sports`, { params }).pipe(
      tap((res) => {
        this.sports.set(res.data || []);
        if (res.meta) {
          this.currentPage.set(res.meta.page);
          this.pageSize.set(res.meta.limit);
          this.totalPages.set(res.meta.totalPages || 1);
          this.totalItems.set(res.meta.total || 0);
          this.stats.update((s) => ({ ...s, totalSports: res.meta.total }));
        }
        this.loading.set(false);
      }),
    );
  }

  loadSummaryStats(): void {
    const sports$ = this.http.get<any>(`${this.baseUrl}/sports?limit=1`);
    const gov$ = this.http.get<any>(`${this.baseUrl}/governing-bodies?limit=1`);
    const orgs$ = this.http.get<any>(`${this.baseUrl}/organizations?limit=1`);
    const players$ = this.http.get<any>(`${this.baseUrl}/players?limit=1`);

    forkJoin({
      sports: sports$,
      gov: gov$,
      orgs: orgs$,
      players: players$,
    }).subscribe({
      next: (res) => {
        this.stats.set({
          totalSports: res.sports?.meta?.total ?? 0,
          totalGoverningBodies: res.gov?.meta?.total ?? 0,
          totalOrganisations: res.orgs?.meta?.total ?? 0,
          totalParticipants: res.players?.meta?.total ?? 0,
        });
      },
      error: (err) => console.error('Errore caricamento statistiche globali:', err),
    });
  }

  createSport(payload: { name: string; description?: string; iconUrl?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sports`, payload).pipe(
      tap(() => {
        this.getSports('', this.currentPage(), this.pageSize()).subscribe();
        this.loadSummaryStats();
      }),
    );
  }

  updateSport(
    id: string,
    payload: { name: string; description?: string; iconUrl?: string },
  ): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/sports/${id}`, payload).pipe(
      tap(() => {
        this.getSports('', this.currentPage(), this.pageSize()).subscribe();
      }),
    );
  }

  getById(id: string): Observable<Sport> {
    return this.http
      .get<{ data: Sport } | Sport>(`${this.baseUrl}/sports/${id}`)
      .pipe(map((res: any) => res.data || res));
  }

  deleteSport(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/sports/${id}`).pipe(
      tap(() => {
        this.getSports('', this.currentPage(), this.pageSize()).subscribe();
        this.loadSummaryStats();
      }),
    );
  }
}
