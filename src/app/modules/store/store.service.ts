import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { paper, world, StoreFilter } from '../../models/paperTrailTypes'; // ajuste caminho se necessário

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  baseUrl = 'http://localhost:4040/api/store';

  // Armazena o filtro central
  private filterSubject = new BehaviorSubject<StoreFilter>({
    searchType: 'books',
    query: '',
    sort: 'title',
    order: 'asc',
    quantity: 15,
    startIndex: 0
  });

  filter$ = this.filterSubject.asObservable();

  // Armazena papers (opcional, legado)
  private storePapersSubject = new BehaviorSubject<paper[] | null>(null);
  papersSubject$ = this.storePapersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Atualiza o filtro central
  setFilter(filter: StoreFilter): void {
    this.filterSubject.next(filter);
  }

  // Chamada à API para buscar livros
  getBooks(filter: StoreFilter = {
    searchType: 'books',
    quantity: 0
  }): Observable<{ papers: paper[]; total: number }> {
    let params = new HttpParams();

    // filtros principais
    if (filter.query) params = params.set('query', filter.query);
    if (filter.genre) params = params.set('genre', filter.genre);
    if (filter.author) params = params.set('author', filter.author);
    if (filter.universe) params = params.set('universe', filter.universe);

    // ordenação e paginação
    params = params.set('sort', filter.sort || 'name');
    params = params.set('order', filter.order || 'asc');
    params = params.set('quantity', (filter.quantity ?? 15).toString());
    params = params.set('startIndex', (filter.startIndex ?? 0).toString());

    return this.http.get<{ papers: paper[]; total: number }>(
      `${this.baseUrl}/books`,
      { params }
    );
  }

  // 📖 Detalhes de um único livro
  getBookById(id: string): Observable<paper> {
    return this.http.get<paper>(`${this.baseUrl}/books/${id}`);
  }

  // 🌌 Lista de universos
// 🌌 Lista de universos
getUniverses(filter: StoreFilter = {
  searchType: 'universes',
  quantity: 0
}): Observable<{ worlds: world[]; total: number }> {
  let params = new HttpParams();

  // filtros principais
  if (filter.query) params = params.set('query', filter.query);

  // ordenação e paginação
  params = params.set('sort', filter.sort || 'name');
  params = params.set('order', filter.order || 'asc');
  params = params.set('quantity', (filter.quantity ?? 15).toString());
  params = params.set('startIndex', (filter.startIndex ?? 0).toString());

  return this.http.get<{ worlds: world[]; total: number }>(
    `${this.baseUrl}/universes`,
    { params }
  );
}


  // 🌍 Detalhes de um universo
  getUniverseById(id: string): Observable<world> {
    return this.http.get<world>(`${this.baseUrl}/universes/${id}`);
  }

  // 🔎 Filtros disponíveis
  getMetadata(): Observable<{ genres: string[], authors: string[] }> {
    return this.http.get<{ genres: string[], authors: string[] }>(`${this.baseUrl}/metadata`);
  }

  // 🔁 Métodos legados de papers
  setStorePapers(papers: paper[]): void {
    this.storePapersSubject.next(papers);
  }

  getStorePapers(): paper[] {
    return this.storePapersSubject.value ?? [];
  }
}
