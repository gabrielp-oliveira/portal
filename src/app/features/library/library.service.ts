import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { paper } from '../../models/paperTrailTypes';

export interface LibraryBooksResponse {
  papers: paper[];
  total:  number;
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private baseUrl = 'http://localhost:4040/api/library';

  constructor(private http: HttpClient) {}

  getLibraryBooks(page = 1, limit = 12): Observable<LibraryBooksResponse> {
    const params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());
    return this.http.get<LibraryBooksResponse>(`${this.baseUrl}/books`, { params });
  }

  getRecommendations(limit = 6): Observable<LibraryBooksResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<LibraryBooksResponse>(`${this.baseUrl}/recommendations`, { params });
  }
}
