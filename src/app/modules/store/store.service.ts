import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { paper, world } from '../../models/paperTrailTypes'; // ajuste o caminho conforme necessário

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private baseUrl = 'http://localhost:4040/api/store';
  private storePapersSubject = new BehaviorSubject<paper[] | null>(null);
  papersSubject$ = this.storePapersSubject.asObservable();

  constructor(private http: HttpClient) { }

  // 📚 Lista de livros com filtros e ordenação
  getBooks(filters?: {
    query?: string;
    genre?: string;
    author?: string;
    universe?: string;
    sort?: string;
    order?: string;
  }): Observable<paper[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params = params.set(key, value);
      });
    }

    return this.http.get<paper[]>(`${this.baseUrl}/books`, { params });
  }


  // 📖 Detalhes de um único livro
  getBookById(id: string): Observable<paper> {
    return this.http.get<paper>(`${this.baseUrl}/books/${id}`);
  }

  // 🌌 Lista de universos, com ou sem livros
  getUniverses(withBooks: boolean = false, sort: string = 'name', order: string = 'asc'): Observable<world[]> {
    let params = new HttpParams()
      .set('withBooks', withBooks.toString())
      .set('sort', sort)
      .set('order', order);

    return this.http.get<world[]>(`${this.baseUrl}/universes`, { params });
  }

  // 🌍 Detalhes de um único universo
  getUniverseById(id: string): Observable<world> {
    return this.http.get<world>(`${this.baseUrl}/universes/${id}`);
  }

  getMetadata(): Observable<{ genres: string[], authors: string[] }> {
    return this.http.get<{ genres: string[], authors: string[] }>(`${this.baseUrl}/metadata`);
  }

  setStorePapers(papers: paper[]): void {
    this.storePapersSubject.next(papers);
  }
  getStorePapers(): paper[] {
    if(this.storePapersSubject.value){
      return this.storePapersSubject.value
    }else {
      return []
    }
  }


}
