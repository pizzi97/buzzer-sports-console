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

  readonly sports = signal<Sport[]>([]);
  readonly stats = signal<SportStats>({
    totalSports: 0,
    totalGoverningBodies: 0,
    totalOrganisations: 0,
    totalParticipants: 0,
  });

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  fetchLiveStats(): Observable<any> {
    const p = new HttpParams().set('limit', '1');

    // Interroga solo la collection degli Sports confermata sul backend
    return this.http.get<any>(`${this.API_URL}/organizations/sports`, { params: p }).pipe(
      tap((res: any) => {
        const totalSports =
          res?.meta?.total ?? res?.total ?? (Array.isArray(res?.data) ? res.data.length : 0);

        this.stats.update((prev) => ({
          ...prev,
          totalSports: totalSports,
          // I restanti totali rimangono a 0 o al valore aggregato finché non colleghiamo i path di Task 4
        }));
      }),
      catchError(() => of(null)),
    );
  }

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
          this.error.set(err?.error?.message || 'Errore nel caricamento del catalogo sport.');
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
        this.fetchLiveStats().subscribe();
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
        this.fetchLiveStats().subscribe();
      }),
    );
  }

  deleteSport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/organizations/sports/${id}`).pipe(
      tap(() => {
        this.getSports().subscribe();
        this.fetchLiveStats().subscribe();
      }),
    );
  }
}
