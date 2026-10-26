import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Sport {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
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

const DEFAULT_SPORTS: Sport[] = [
  {
    id: '1',
    name: 'Football',
    iconUrl: '⚽',
    governingBodiesCount: 5,
    organisationsCount: 32,
    participantsCount: 1420,
  },
  {
    id: '2',
    name: 'Basketball',
    iconUrl: '🏀',
    governingBodiesCount: 3,
    organisationsCount: 18,
    participantsCount: 890,
  },
  {
    id: '3',
    name: 'Baseball',
    iconUrl: '⚾',
    governingBodiesCount: 2,
    organisationsCount: 12,
    participantsCount: 640,
  },
  {
    id: '4',
    name: 'Hockey',
    iconUrl: '🏒',
    governingBodiesCount: 2,
    organisationsCount: 14,
    participantsCount: 510,
  },
  {
    id: '5',
    name: 'Tennis',
    iconUrl: '🎾',
    governingBodiesCount: 4,
    organisationsCount: 24,
    participantsCount: 780,
  },
  {
    id: '6',
    name: 'Rugby',
    iconUrl: '🏉',
    governingBodiesCount: 2,
    organisationsCount: 16,
    participantsCount: 620,
  },
  {
    id: '7',
    name: 'Volleyball',
    iconUrl: '🏐',
    governingBodiesCount: 3,
    organisationsCount: 20,
    participantsCount: 710,
  },
  {
    id: '8',
    name: 'MMA',
    iconUrl: '🥊',
    governingBodiesCount: 2,
    organisationsCount: 8,
    participantsCount: 340,
  },
  {
    id: '9',
    name: 'Snowboarding',
    iconUrl: '🏂',
    governingBodiesCount: 1,
    organisationsCount: 6,
    participantsCount: 190,
  },
  {
    id: '10',
    name: 'Boxing',
    iconUrl: '🥊',
    governingBodiesCount: 3,
    organisationsCount: 15,
    participantsCount: 420,
  },
  {
    id: '11',
    name: 'Golf',
    iconUrl: '⛳',
    governingBodiesCount: 2,
    organisationsCount: 22,
    participantsCount: 530,
  },
  {
    id: '12',
    name: 'Gymnastics',
    iconUrl: '🤸',
    governingBodiesCount: 2,
    organisationsCount: 10,
    participantsCount: 380,
  },
];

@Injectable({
  providedIn: 'root',
})
export class SportsService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  readonly sports = signal<Sport[]>(DEFAULT_SPORTS);
  readonly stats = signal<SportStats>({
    totalSports: 12,
    totalGoverningBodies: 28,
    totalOrganisations: 197,
    totalParticipants: 7440,
  });

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  fetchLiveStats(): Observable<any> {
    const p = new HttpParams().set('limit', '1');

    return forkJoin({
      sportsRes: this.http
        .get<any>(`${this.API_URL}/organizations/sports`, { params: p })
        .pipe(catchError(() => of({ meta: { total: this.sports().length } }))),
      govBodiesRes: this.http
        .get<any>(`${this.API_URL}/organizations/governing-bodies`, { params: p })
        .pipe(catchError(() => of({ meta: { total: 28 } }))),
    }).pipe(
      tap(({ sportsRes, govBodiesRes }: any) => {
        const totalSports = sportsRes?.meta?.total ?? sportsRes?.total ?? this.sports().length;
        const totalGovBodies = govBodiesRes?.meta?.total ?? govBodiesRes?.total ?? 28;

        const currentList = this.sports();
        const totalOrgs = currentList.reduce((acc, s) => acc + (s.organisationsCount ?? 0), 0);
        const totalParts = currentList.reduce((acc, s) => acc + (s.participantsCount ?? 0), 0);

        this.stats.set({
          totalSports: totalSports,
          totalGoverningBodies: totalGovBodies,
          totalOrganisations: totalOrgs > 0 ? totalOrgs : 197,
          totalParticipants: totalParts > 0 ? totalParts : 7440,
        });
      }),
    );
  }

  getSports(search: string = '', page: number = 1, limit: number = 20): Observable<any> {
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
          const list: Sport[] = Array.isArray(res) ? res : res?.data || [];
          if (list.length > 0) {
            this.sports.set(list);
          }
          this.fetchLiveStats().subscribe();
        },
      }),
      catchError(() => {
        if (search.trim()) {
          const filtered = DEFAULT_SPORTS.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase()),
          );
          this.sports.set(filtered);
        } else {
          this.sports.set(DEFAULT_SPORTS);
        }
        return of(this.sports());
      }),
    );
  }

  createSport(payload: { name: string; description?: string; iconUrl?: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/organizations/sports`, payload).pipe(
      tap((newSport) => {
        this.sports.update((list) => [newSport, ...list]);
      }),
      catchError(() => {
        const localSport: Sport = {
          id: Date.now().toString(),
          name: payload.name,
          description: payload.description,
          iconUrl: payload.iconUrl || '🏅',
          governingBodiesCount: 0,
          organisationsCount: 0,
          participantsCount: 0,
        };
        this.sports.update((list) => [localSport, ...list]);
        return of(localSport);
      }),
    );
  }

  updateSport(
    id: string,
    payload: { name: string; description?: string; iconUrl?: string },
  ): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/organizations/sports/${id}`, payload).pipe(
      tap(() => this.getSports().subscribe()),
      catchError(() => {
        this.sports.update((list) => list.map((s) => (s.id === id ? { ...s, ...payload } : s)));
        return of(null);
      }),
    );
  }

  deleteSport(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/organizations/sports/${id}`).pipe(
      tap(() => this.getSports().subscribe()),
      catchError(() => {
        this.sports.update((list) => list.filter((s) => s.id !== id));
        return of(null);
      }),
    );
  }
}
