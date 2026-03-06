import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chapter, paper, world } from '../../models/paperTrailTypes';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private baseUrl = 'http://localhost:4040/api/library'; // ✅ define baseURL com prefixo fixo da API

  constructor(private http: HttpClient) {}

  /**
   * Obtém os livros da biblioteca do usuário com paginação
   */
getLibraryBooks(
  page: number = 1,
  limit: number = 12
): Observable<{ papers: paper[]; total: number; chapters: Chapter[] }> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  return this.http.get<{ papers: paper[]; total: number; chapters: Chapter[] }>(
    `${this.baseUrl}/books`,
    { params }
  );
}


  /**
   * Obtém os mundos do usuário com os livros associados
   */
  getUserWorlds(): Observable<world[]> {
    return this.http.get<world[]>(`${this.baseUrl}/worlds`);
  }
}
