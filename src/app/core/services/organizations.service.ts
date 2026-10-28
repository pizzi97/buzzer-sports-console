import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Organization {
  id: string;
  name: string;
  governingBodyId: string;
  sportId?: string;
  description?: string;
  logoUrl?: string;
  participantsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationsResponse {
  data: Organization[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateOrganizationDto {
  name: string;
  governingBodyId: string;
  sportId?: string;
  description?: string;
  logoUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/+$/, '')}/organizations/organizations`;

  getByGoverningBodyId(
    governingBodyId: string,
    page = 1,
    limit = 10,
    search = '',
  ): Observable<OrganizationsResponse> {
    let params = new HttpParams()
      .set('governingBodyId', governingBodyId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<OrganizationsResponse>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Organization> {
    return this.http
      .get<{ data: Organization } | Organization>(`${this.baseUrl}/${id}`)
      .pipe(map((res: any) => res.data || res));
  }

  create(dto: CreateOrganizationDto): Observable<Organization> {
    return this.http
      .post<{ data: Organization } | Organization>(this.baseUrl, dto)
      .pipe(map((res: any) => res.data || res));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
