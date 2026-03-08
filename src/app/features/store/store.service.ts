import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { paper, world, StoreFilter } from '../../models/paperTrailTypes';

export type FullPaper = paper & {
  world_name: string;
  author_id: string;
  genres: string[];
  total_pages: number;
};

export type paperResponse = {
  paper: FullPaper;
  worldDescription: string;
  worldName: string;
  PaperCount: number;
  price: number;
  isPurchased: boolean;
  isInWishlist: boolean;
};

export type checkout = {
  paymentMethod: string;
  type: string;
  country: string;
  currencyCode: string;
  id: string;
};

export interface SimplePaper {
  id: string;
  name: string;
  genre: string[];
  cover_url: string;
  status: string;
}

export interface WishlistAvailablePaper {
  id: string;
  name: string;
  cover_url: string;
  author_name: string;
  genre: string[];
  price: number;
  priceCurrency: string;
  available_since: string;
}

export interface WishlistDetailsResponse {
  papers: SimplePaper[];
  total: number;
}

export interface WishlistAvailableResponse {
  papers: WishlistAvailablePaper[];
  count: number;
}

/** @deprecated Use getCatalog() */
export interface BooksResponse {
  papers: paper[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** @deprecated Use getCatalog() */
export interface UniversesResponse {
  worlds: world[];
  total: number;
}

export interface StoreStatsResponse {
  availableBooks: number;
  comingSoonBooks: number;
  totalUniverses: number;
  freeBooks: number;
  newAvailableThisMonth: number;
}

/** Resposta de GET /api/store/home */
export interface HomeSection {
  hero: paper;
  trending: paper[];
  newReleases: paper[];
  recommended: paper[];
  universes: world[];
  stats: StoreStatsResponse;
}

/** Resposta de GET /api/store/catalog?type=books */
export interface CatalogBooksResponse {
  type: 'books';
  papers: paper[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** Resposta de GET /api/store/catalog?type=universes */
export interface CatalogUniversesResponse {
  type: 'universes';
  worlds: world[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export type CatalogResponse = CatalogBooksResponse | CatalogUniversesResponse;

/** Resposta de GET /api/store/meta */
export interface StoreMetaResponse {
  genres: string[];
  languages: string[];
  authors: { id: string; name: string }[];
  stats: StoreStatsResponse;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  baseUrl = 'http://localhost:4040/api/';
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  private paperSubject = new BehaviorSubject<FullPaper | null>(null);
  private filterSubject = new BehaviorSubject<StoreFilter>({
    searchType: 'books',
    query: '',
    sort: 'name',
    order: 'asc',
    page: 1,
    limit: 15,
    status: undefined
  });

  filter$ = this.filterSubject.asObservable();
  storePaper$ = this.paperSubject.asObservable();

  private storePapersSubject = new BehaviorSubject<paper[] | null>(null);
  papersSubject$ = this.storePapersSubject.asObservable();

  constructor(private http: HttpClient) {}

  setFilter(filter: StoreFilter): void {
    this.filterSubject.next(filter);
  }

  /** @deprecated Use getCatalog() */
  getBooks(filter: StoreFilter = { searchType: 'books' }): Observable<BooksResponse> {
    let params = new HttpParams();

    if (filter.query)     params = params.set('query', filter.query);
    if (filter.genre)     params = params.set('genre', filter.genre);
    if (filter.author)    params = params.set('author', filter.author);
    if (filter.universe)  params = params.set('universe', filter.universe);
    if (filter.status)    params = params.set('status', filter.status);
    if (filter.language)  params = params.set('language', filter.language);
    if (filter.maturity)  params = params.set('maturity', filter.maturity);
    if (filter.year)      params = params.set('year', filter.year.toString());
    if (filter.price_min != null) params = params.set('price_min', filter.price_min.toString());
    if (filter.price_max != null) params = params.set('price_max', filter.price_max.toString());
    if (filter.country)   params = params.set('country', filter.country);
    if (filter.currency)  params = params.set('currency', filter.currency);
    if (filter.purchased != null) params = params.set('purchased', filter.purchased.toString());

    params = params.set('sort',  filter.sort  || 'name');
    params = params.set('order', filter.order || 'asc');
    params = params.set('page',  (filter.page  ?? 1).toString());
    params = params.set('limit', (filter.limit ?? 15).toString());

    return this.http.get<BooksResponse>(`${this.baseUrl}store/books`, { params });
  }

  getPaperById(id: string, currencyCode: string, country: string): Observable<paperResponse> {
    return this.http.get<paperResponse>(
      `${this.baseUrl}store/books/${id}?currency=${currencyCode}&country=${country}`
    );
  }

  /** @deprecated Use getCatalog() */
  getUniverses(filter: StoreFilter = { searchType: 'universes' }): Observable<UniversesResponse> {
    let params = new HttpParams();

    if (filter.query) params = params.set('query', filter.query);

    params = params.set('sort',  filter.sort  || 'name');
    params = params.set('order', filter.order || 'asc');
    params = params.set('page',  (filter.page  ?? 1).toString());
    params = params.set('limit', (filter.limit ?? 15).toString());

    return this.http.get<UniversesResponse>(`${this.baseUrl}store/universes`, { params });
  }

  getUniverseById(id: string, currencyCode: string, country: string): Observable<world> {
    return this.http.get<world>(
      `${this.baseUrl}store/universes/${id}?currency=${currencyCode}&country=${country}`
    );
  }

  /** GET /api/store/home — seções da home em um único request (Redis-cached no backend) */
  getHome(): Observable<HomeSection> {
    return this.http.get<HomeSection>(`${this.baseUrl}store/home`);
  }

  /**
   * GET /api/store/catalog — busca paginada unificada para books e universes.
   * Substitui getBooks() + getUniverses() no modo filtro.
   */
  getCatalog(filter: StoreFilter): Observable<CatalogResponse> {
    let params = new HttpParams().set('type', filter.searchType ?? 'books');

    if (filter.query)             params = params.set('query',     filter.query);
    if (filter.genre)             params = params.set('genre',     filter.genre);
    if (filter.author)            params = params.set('author',    filter.author);
    if (filter.universe)          params = params.set('universe',  filter.universe);
    if (filter.status)            params = params.set('status',    filter.status);
    if (filter.language)          params = params.set('language',  filter.language);
    if (filter.maturity)          params = params.set('maturity',  filter.maturity);
    if (filter.year)              params = params.set('year',      filter.year.toString());
    if (filter.price_min != null) params = params.set('price_min', filter.price_min.toString());
    if (filter.price_max != null) params = params.set('price_max', filter.price_max.toString());
    if (filter.country)           params = params.set('country',   filter.country);
    if (filter.currency)          params = params.set('currency',  filter.currency);
    if (filter.purchased != null) params = params.set('purchased', filter.purchased.toString());

    params = params
      .set('sort',  filter.sort  || 'name')
      .set('order', filter.order || 'asc')
      .set('page',  (filter.page  ?? 1).toString())
      .set('limit', (filter.limit ?? 15).toString());

    return this.http.get<CatalogResponse>(`${this.baseUrl}store/catalog`, { params });
  }

  /** GET /api/store/meta — genres, authors, languages + stats (Redis-cached no backend) */
  getStoreMeta(): Observable<StoreMetaResponse> {
    return this.http.get<StoreMetaResponse>(`${this.baseUrl}store/meta`);
  }

  /** @deprecated Use getStoreMeta() */
  getMetadata(): Observable<{ genres: string[]; authors: string[]; languages: string[] }> {
    return this.http.get<{ genres: string[]; authors: string[]; languages: string[] }>(`${this.baseUrl}store/metadata`);
  }

  setStorePapers(papers: paper[]): void {
    this.storePapersSubject.next(papers);
  }

  setStorePaper(pp: FullPaper): void {
    this.paperSubject.next(pp);
  }

  getBooksByAuthor(authorId: string): Observable<SimplePaper[]> {
    return this.http.get<SimplePaper[]>(`${this.baseUrl}store/books/author/${authorId}`);
  }

  getStorePapers(): paper[] {
    return this.storePapersSubject.value ?? [];
  }

  checkoutBook(body: checkout) {
    return this.http.post(`${this.baseUrl}store/checkout/book/${body.id}`, body);
  }

  checkoutUniverse(body: checkout) {
    return this.http.post(`${this.baseUrl}store/checkout/universe/${body.id}`, body);
  }

  getBooksByGenreExcludingUniverse(body: {
    currentBookId: string;
    worldId: string;
    genres: string[];
  }): Observable<SimplePaper[]> {
    return this.http.post<SimplePaper[]>(
      `${this.baseUrl}store/books/recommendations/by-genre`,
      body
    );
  }

  toggleWishlist(paperId: string): Observable<{ action: 'added' | 'removed'; is_in_wishlist: boolean }> {
    return this.http.post<{ action: 'added' | 'removed'; is_in_wishlist: boolean }>(
      `${this.baseUrl}wishlist/${paperId}/toggle`, {}
    );
  }

  /** @deprecated Use toggleWishlist() */
  addToWishlist(paperId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}wishlist/${paperId}`, {});
  }

  /** @deprecated Use toggleWishlist() */
  removeFromWishlist(paperId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}wishlist/${paperId}`);
  }

  getWishlist(): Observable<string[]> {
    return this.http.get<{ wishlist: string[] }>(`${this.baseUrl}wishlist`)
      .pipe(map(res => res.wishlist));
  }

  getWishlistDetails(): Observable<WishlistDetailsResponse> {
    return this.http.get<WishlistDetailsResponse>(`${this.baseUrl}wishlist/details`);
  }

  /** @deprecated Stats agora vêm embutidos em getHome() e getStoreMeta() */
  getStats(): Observable<StoreStatsResponse> {
    return this.http.get<StoreStatsResponse>(`${this.baseUrl}store/stats`);
  }

  getNewlyAvailableFromWishlist(days = 7, currency = 'USD', country = 'US'): Observable<WishlistAvailableResponse> {
    return this.http.get<WishlistAvailableResponse>(
      `${this.baseUrl}wishlist/available?days=${days}&currency=${currency}&country=${country}`
    );
  }
}
