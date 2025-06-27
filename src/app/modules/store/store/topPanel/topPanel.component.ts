import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../store.service';
import { StoreFilter } from '../../../../models/paperTrailTypes';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-top-panel',
  templateUrl: './topPanel.component.html',
  styleUrls: ['./topPanel.component.scss']
})
export class TopPanelComponent implements OnInit {
  query = '';
  searchType: 'books' | 'universes' = 'books';
  genre = '';
  author = '';
  universe = '';
  sort = 'title';
  order: 'asc' | 'desc' = 'asc';
  status: 'available' | 'not_available' | 'in_progress' | '' = '';

  genres: string[] = [];
  authors: string[] = [];

  genreSearch = '';
  authorSearch = '';

  private firstLoad = true;

  constructor(
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Carrega metadados
    this.storeService.getMetadata().subscribe((data) => {
      this.genres = data.genres || [];
      this.authors = data.authors || [];
    });

    // Aplica filtros da URL somente na primeira vez
    this.route.queryParams.subscribe(params => {
      if (this.firstLoad) {
        this.searchType = params['searchType'] || 'books';
        this.query = params['query'] || '';
        this.genre = params['genre'] || '';
        this.author = params['author'] || '';
        this.universe = params['universe'] || '';
        this.sort = params['sort'] || 'title';
        this.order = params['order'] || 'asc';
        this.status = params['status'] || '';
        this.firstLoad = false;
      }

      this.emitFilters(false); // ⚠️ não atualiza a URL neste ponto
    });
  }

  get filteredGenres() {
    return this.genres.filter(g =>
      g.toLowerCase().includes(this.genreSearch.toLowerCase())
    );
  }

  get filteredAuthors() {
    return this.authors.filter(a =>
      a.toLowerCase().includes(this.authorSearch.toLowerCase())
    );
  }

  resetFilters(): void {
    this.searchType = 'books';
    this.query = '';
    this.genre = '';
    this.author = '';
    this.universe = '';
    this.sort = 'title';
    this.order = 'asc';
    this.genreSearch = '';
    this.authorSearch = '';
    this.status = '';

    this.emitFilters();
  }

  applyFilters(): void {
    this.emitFilters();
  }

  emitFilters(updateUrl: boolean = true, quantity: number = 15): void {
    const finalQuantity = quantity > 45 ? 45 : quantity;

    const filter: StoreFilter = {
      searchType: this.searchType,
      query: this.query,
      genre: this.genre,
      author: this.author,
      universe: this.universe,
      sort: this.sort,
      order: this.order,
      quantity: finalQuantity,
      startIndex: 0,
      status: this.status || undefined,
    };

    this.storeService.setFilter(filter);

    if (updateUrl) {
      const queryParams: any = {};

      if (filter.searchType !== 'books') queryParams.searchType = filter.searchType;
      if (filter.query !== '') queryParams.query = filter.query;
      if (filter.query === '') queryParams.query = '';
      if (filter.genre) queryParams.genre = filter.genre;
      if (filter.author) queryParams.author = filter.author;
      if (filter.universe) queryParams.universe = filter.universe;
      if (filter.sort !== 'title') queryParams.sort = filter.sort;
      if (filter.order !== 'asc') queryParams.order = filter.order;
      if (filter.quantity !== 15) queryParams.quantity = filter.quantity;
      if (filter.status) queryParams.status = filter.status;

      queryParams.page = 1;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge'
      });
    }
  }

  shareStore(): void {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Minha Loja de Livros',
        url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('📋 Link copiado!');
      });
    }
  }
}
