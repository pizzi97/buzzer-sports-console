import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface GoverningBody {
  id: string;
  name: string;
  description?: string;
  sportId: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  organizationsCount?: number;
}

export interface GoverningBodiesResponse {
  data: GoverningBody[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateGoverningBodyDto {
  name: string;
  sportId: string;
  description?: string;
  logoUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoverningBodiesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/+$/, '')}/organizations/governing-bodies`;

  getBySportId(
    sportId: string,
    page = 1,
    limit = 10,
    search = '',
  ): Observable<GoverningBodiesResponse> {
    let params = new HttpParams()
      .set('sportId', sportId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<GoverningBodiesResponse>(this.baseUrl, { params });
  }

  getById(id: string): Observable<GoverningBody> {
    return this.http
      .get<{ data: GoverningBody } | GoverningBody>(`${this.baseUrl}/${id}`)
      .pipe(map((res: any) => res.data || res));
  }

  create(dto: CreateGoverningBodyDto): Observable<GoverningBody> {
    return this.http
      .post<{ data: GoverningBody } | GoverningBody>(this.baseUrl, dto)
      .pipe(map((res: any) => res.data || res));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
