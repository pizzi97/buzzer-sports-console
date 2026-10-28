import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role?: string;
  jerseyNumber?: number;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParticipantsResponse {
  data: Participant[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateParticipantDto {
  firstName: string;
  lastName: string;
  organizationId: string;
  role?: string;
  jerseyNumber?: number;
  photoUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ParticipantsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/+$/, '')}/organizations/players`;

  getByOrganizationId(
    organizationId: string,
    page = 1,
    limit = 10,
    search = '',
  ): Observable<ParticipantsResponse> {
    let params = new HttpParams()
      .set('organizationId', organizationId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<ParticipantsResponse>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Participant> {
    return this.http
      .get<{ data: Participant } | Participant>(`${this.baseUrl}/${id}`)
      .pipe(map((res: any) => res.data || res));
  }

  create(dto: CreateParticipantDto): Observable<Participant> {
    return this.http
      .post<{ data: Participant } | Participant>(this.baseUrl, dto)
      .pipe(map((res: any) => res.data || res));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
