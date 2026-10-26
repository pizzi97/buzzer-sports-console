import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Sport {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  governingBodiesCount?: number;
  organisationsCount?: number;
  participantsCount?: number;
}

export interface SportStats {
  totalSports: number;
  totalGoverningBodies: number;
  totalOrganisations: number;
  totalParticipants: number;
}

@Injectable({
  providedIn: 'root',
})
export class SportsService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Dati server-owned (nessun seeding mock fisso locale)
  readonly sports = signal<Sport[]>([]);
  readonly stats = signal<SportStats>({
    totalSports: 0,
    totalGoverningBodies: 0,
    totalOrganisations: 0,
    totalParticipants: 0,
  });

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Recupera i meta.total dalle collection del server con ?limit=1
   */
  fetchLiveStats(): Observable<any> {
    const p = new HttpParams().set('limit', '1');

    return forkJoin({
      sportsRes: this.http
        .get<any>(`${this.API_URL}/organizations/sports`, { params: p })
        .pipe(catchError(() => of({ meta: { total: 0 } }))),
      govBodiesRes: this.http
        .get<any>(`${this.API_URL}/organizations/governing-bodies`, { params: p })
        .pipe(catchError(() => of({ meta: { total: 0 } }))),
    }).pipe(
      tap(({ sportsRes, govBodiesRes }: any) => {
        const totalSports =
          sportsRes?.meta?.total ??
          sportsRes?.total ??
          (Array.isArray(sportsRes?.data) ? sportsRes.data.length : 0);

        const totalGovBodies =
          govBodiesRes?.meta?.total ??
          govBodiesRes?.total ??
          (Array.isArray(govBodiesRes?.data) ? govBodiesRes.data.length : 0);

        // Calcola i totali relazionali partendo dai dati del catalogo
        const list = this.sports();
        const totalOrgs = list.reduce((acc, s) => acc + (s.organisationsCount ?? 0), 0);
        const totalParts = list.reduce((acc, s) => acc + (s.participantsCount ?? 0), 0);

        this.stats.set({
          totalSports: totalSports,
          totalGoverningBodies: totalGovBodies,
          totalOrganisations: totalOrgs,
          totalParticipants: totalParts,
        });
      }),
      catchError(() => of(null)),
    );
  }

  /**
   * Ricerca paginata server-side tramite parametro ?search=
   */
  getSports(search: string = '', page: number = 1, limit: number = 20): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', 'name')
      .set('sortOrder', 'asc');

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(`${this.API_URL}/organizations/sports`, { params }).pipe(
      tap({
        next: (res: any) => {
          this.loading.set(false);
          const list: Sport[] = Array.isArray(res) ? res : res?.data || [];
          this.sports.set(list);
          this.fetchLiveStats().subscribe();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err?.error?.message || 'Error loading sports catalogue.');
        },
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      }),
    );
  }

  createSport(payload: {
    name: string;
    description?: string;
    iconUrl?: string;
  }): Observable<Sport> {
    return this.http.post<Sport>(`${this.API_URL}/organizations/sports`, payload).pipe(
      tap(() => {
        this.getSports().subscribe();
      }),
    );
  }

  updateSport(
    id: string,
    payload: { name: string; description?: string; iconUrl?: string },
  ): Observable<Sport> {
    return this.http.patch<Sport>(`${this.API_URL}/organizations/sports/${id}`, payload).pipe(
      tap(() => {
        this.getSports().subscribe();
      }),
    );
  }

  deleteSport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/organizations/sports/${id}`).pipe(
      tap(() => {
        this.getSports().subscribe();
      }),
    );
  }
}
