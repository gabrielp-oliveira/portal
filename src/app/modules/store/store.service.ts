import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { paper, world, StoreFilter } from '../../models/paperTrailTypes'; // ajuste caminho se necessário


export type FullPaper = paper & {
  world_name: string;
  author_id: string;
  genres: string[];     // torna obrigatório se o backend sempre retorna
  total_pages: number;
};

export type paperResponse = {
  "paper": FullPaper;
  "worldDescription": string;
  "worldName": string;
  "PaperCount": number;
  "price": number;
  "isPurchased": boolean;
}


  export type checkout= {
    paymentMethod: string,
    type: string,
    country: string,
    currencyCode: string,
    id: string,
  }

export interface SimplePaper {
  id: string;
  name: string;
  genre: string[];
  cover_url: string;
  status: string
}



@Injectable({
  providedIn: 'root'
})
export class StoreService {
  baseUrl = 'http://localhost:4040/api/store';
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  // Armazena o filtro central
  private paperSubject = new BehaviorSubject<FullPaper | null>(null)
  private filterSubject = new BehaviorSubject<StoreFilter>({
    searchType: 'books',
    query: '',
    sort: 'title',
    order: 'asc',
    quantity: 15,
    startIndex: 0,
    status: undefined
  });

  filter$ = this.filterSubject.asObservable();
  storePaper$ = this.paperSubject.asObservable();

  // Armazena papers (opcional, legado)
  private storePapersSubject = new BehaviorSubject<paper[] | null>(null);
  papersSubject$ = this.storePapersSubject.asObservable();

  constructor(private http: HttpClient) { }

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
  if (filter.status) params = params.set('status', filter.status); // ✅ novo filtro de status

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



getPaperById(id: string, currencyCode: string, country: string): Observable<paperResponse> {
  return this.http.get<paperResponse>(`${this.baseUrl}/books/${id}?currency=${currencyCode}&country=${country}`);
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
getUniverseById(id: string, currencyCode: string, country: string): Observable<world> {
  return this.http.get<world>(
    `${this.baseUrl}/universes/${id}?currency=${currencyCode}&country=${country}`
  );
}


  // 🔎 Filtros disponíveis
  getMetadata(): Observable<{ genres: string[], authors: string[] }> {
    return this.http.get<{ genres: string[], authors: string[] }>(`${this.baseUrl}/metadata`);
  }

  // 🔁 Métodos legados de papers
  setStorePapers(papers: paper[]): void {
    this.storePapersSubject.next(papers);
  }
  setStorePaper(pp: FullPaper): void {
    this.paperSubject.next(pp);
  }

  getBooksByAuthor(authorId:string): Observable<SimplePaper[]> {
    return this.http.get<SimplePaper[]>(`${this.baseUrl}/books/author/${authorId}`);
  }
  getStorePapers(): paper[] {
    return this.storePapersSubject.value ?? [];
  }

checkoutBook(body: checkout) {
  return this.http.post(`${this.baseUrl}/checkout/book/${body.id}`, body);
}

checkoutUniverse(body: checkout) {
  return this.http.post(`${this.baseUrl}/checkout/universe/${body.id}`, body);
}

  getBooksByGenreExcludingUniverse(body: {
  currentBookId: string;
  worldId: string;
  genres: string[];
}): Observable<SimplePaper[]> {
  return this.http.post<SimplePaper[]>(
    `${this.baseUrl}/books/recommendations/by-genre`,
    body
  );
}

}
