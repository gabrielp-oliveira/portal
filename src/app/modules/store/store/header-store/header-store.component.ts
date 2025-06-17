import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { StoreFilter } from '../../types';
import { StoreService } from '../../store.service';
import { paper, world } from '../../../../models/paperTrailTypes';

@Component({
  selector: 'app-header-store',
  templateUrl: './header-store.component.html',
  styleUrls: ['./header-store.component.scss']
})
export class HeaderStoreComponent implements OnInit {

  @Output() filterChanged = new EventEmitter<StoreFilter>();

  // filtros
  query = '';
  searchType: 'books' | 'universes' = 'books';
  genre = '';
  author = '';
  universe = '';
  sort = 'name';
  order: 'asc' | 'desc' = 'asc';

  // metadados
  genres: string[] = [];
  authors: string[] = [];
  @Output() results = new EventEmitter<paper[] | world[]>();


  papers: paper[]
  genreSearch = '';
  authorSearch = '';

  get filteredGenres() {
    return this.genres.filter(g => g.toLowerCase().includes(this.genreSearch.toLowerCase()));
  }

  get filteredAuthors() {
    return this.authors.filter(a => a.toLowerCase().includes(this.authorSearch.toLowerCase()));
  }

  shareStore() {
    throw new Error('Method not implemented.');
  }

  resetFilters() {
    this.searchType = 'books';
    this.query = '';
    this.genre = '';
    this.author = '';
    this.universe = '';
    this.sort = 'name';
    this.order = 'asc';
    this.genreSearch = '';
    this.authorSearch = '';
    this.emitFilters();
  }

  applyFilters() {
    this.emitFilters(); // garante que StoreComponent saiba do estado

    if (this.searchType === 'books') {
      this.storeService.getBooks({
        query: this.query,
        genre: this.genre,
        author: this.author,
        universe: this.universe,
        sort: this.sort,
        order: this.order
      }).subscribe(data => this.results.emit(data));
    } else {
      this.storeService.getUniverses(true, this.sort, this.order)
        .subscribe(data => this.results.emit(data));
    }
  }



  ngOnInit(): void {
    this.storeService.getMetadata().subscribe((data) => {
      console.log(data)
      this.genres = data.genres;
      this.authors = data.authors;
    });
    this.storeService.getBooks().subscribe((data) => {
      this.storeService.setStorePapers(data)
    });

  }
  constructor(private storeService: StoreService) { }

  emitFilters(): void {
    this.filterChanged.emit({
      searchType: this.searchType,
      query: this.query,
      genre: this.genre,
      author: this.author,
      universe: this.universe,
      sort: this.sort,
      order: this.order
    });
  }
}
