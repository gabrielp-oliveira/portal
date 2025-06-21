import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../store.service';
import { paper, StoreFilter, world } from '../../../../models/paperTrailTypes';

@Component({
  selector: 'app-header-store',
  templateUrl: './header-store.component.html',
  styleUrls: ['./header-store.component.scss']
})
export class HeaderStoreComponent implements OnInit {
  // filtros
  query = '';
  searchType: 'books' | 'universes' = 'books';
  genre = '';
  author = '';
  universe = '';
  sort = 'title';
  order: 'asc' | 'desc' = 'asc';

  // metadados
  genres: string[] = [];
  authors: string[] = [];

  genreSearch = '';
  authorSearch = '';

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.storeService.getMetadata().subscribe((data) => {
      this.genres = data.genres;
      this.authors = data.authors;
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

    this.emitFilters();
  }

  applyFilters(): void {
    this.emitFilters();
  }

  emitFilters(): void {
    const filter: StoreFilter = {
      searchType: this.searchType,
      query: this.query,
      genre: this.genre,
      author: this.author,
      universe: this.universe,
      sort: this.sort,
      order: this.order,
      quantity: 15,
      startIndex: 0
    };

    this.storeService.setFilter(filter); // ✅ agora emite globalmente
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
