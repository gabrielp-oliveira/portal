import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from '../../store.service';
import { StoreFilter } from '../../../../models/paperTrailTypes';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { GeoService } from '../../../../core/geo.service';

@Component({
  standalone: false,
  selector: 'app-top-panel',
  templateUrl: './topPanel.component.html',
  styleUrls: ['./topPanel.component.scss']
})
export class TopPanelComponent implements OnInit, OnDestroy {
  query = '';
  searchType: 'books' | 'universes' = 'books';
  genre = '';
  author = '';
  universe = '';
  sort = 'name';
  order: 'asc' | 'desc' = 'asc';
  status: 'available' | 'not_available' | 'in_progress' | '' = '';
  language = '';
  maturity = '';
  year: number | null = null;
  price_min: number | null = null;
  price_max: number | null = null;
  country = 'US';
  currency = 'USD';

  genres: string[] = [];
  authors: string[] = [];
  languages: string[] = [];
  genreSearch = '';
  authorSearch = '';
  filtersOpen = false;

  readonly MATURITIES = [
    { value: 'EVERYONE', label: 'Everyone' },
    { value: 'TEEN',     label: 'Teen' },
    { value: 'MATURE',   label: 'Mature (18+)' },
  ];

  readonly SORT_OPTIONS_BOOKS = [
    { value: 'name',        label: 'Name' },
    { value: 'created_at',  label: 'Date added' },
    { value: 'purchases',   label: 'Popularity' },
    { value: 'author_name', label: 'Author' },
    { value: 'price',       label: 'Price' },
    { value: 'total_pages', label: 'Pages' },
  ];

  readonly SORT_OPTIONS_UNIVERSES = [
    { value: 'name',       label: 'Name' },
    { value: 'created_at', label: 'Date added' },
  ];

  get sortOptions() {
    return this.searchType === 'books' ? this.SORT_OPTIONS_BOOKS : this.SORT_OPTIONS_UNIVERSES;
  }

  private firstLoad = true;
  private searchSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private geoService: GeoService
  ) {}

  ngOnInit(): void {
    this.storeService.getStoreMeta().subscribe((data) => {
      this.genres    = data.genres    || [];
      this.authors   = (data.authors  || []).map(a => a.name);
      this.languages = data.languages || [];
    });

    this.geoService.geo.then(geo => {
      // Only apply geo defaults if not already overridden by URL params
      if (this.country === 'US') this.country = geo.country;
      if (this.currency === 'USD') this.currency = geo.currency;
    });

    this.searchSubject.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(() => this.emitFilters());

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (!this.firstLoad) return;

      this.searchType = params['searchType'] || 'books';
      this.query      = params['query']      || '';
      this.genre      = params['genre']      || '';
      this.author     = params['author']     || '';
      this.universe   = params['universe']   || '';
      this.sort       = params['sort']       || 'name';
      this.order      = params['order']      || 'asc';
      this.status     = params['status']     || '';
      this.language   = params['language']   || '';
      this.maturity   = params['maturity']   || '';
      this.year       = params['year']       ? parseInt(params['year'], 10)    : null;
      this.price_min  = params['price_min']  ? parseFloat(params['price_min']) : null;
      this.price_max  = params['price_max']  ? parseFloat(params['price_max']) : null;
      if (params['country'])  this.country  = params['country'];
      if (params['currency']) this.currency = params['currency'];
      this.firstLoad  = false;

      this.emitFilters(false);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredGenres() {
    return this.genres.filter(g => g.toLowerCase().includes(this.genreSearch.toLowerCase()));
  }

  get filteredAuthors() {
    return this.authors.filter(a => a.toLowerCase().includes(this.authorSearch.toLowerCase()));
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.genre || this.author || this.status || this.language || this.maturity ||
      this.year || this.price_min != null || this.price_max != null ||
      this.sort !== 'name' || this.order !== 'asc'
    );
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.genre)              count++;
    if (this.author)             count++;
    if (this.status)             count++;
    if (this.language)           count++;
    if (this.maturity)           count++;
    if (this.year)               count++;
    if (this.price_min != null)  count++;
    if (this.price_max != null)  count++;
    if (this.sort !== 'name')    count++;
    if (this.order !== 'asc')    count++;
    return count;
  }

  setSearchType(type: 'books' | 'universes'): void {
    if (this.searchType === type) return;
    this.searchType = type;
    this.author  = '';
    this.status  = '';
    this.maturity = '';
    // reset sort if current option not valid for new type
    if (type === 'universes' && !this.SORT_OPTIONS_UNIVERSES.find(o => o.value === this.sort)) {
      this.sort = 'name';
    }
    this.emitFilters();
  }

  onSearchInput(): void {
    this.searchSubject.next();
  }

  clearQuery(): void {
    this.query = '';
    this.emitFilters();
  }

  toggleFilters(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  resetFilters(): void {
    this.searchType = 'books';
    this.query      = '';
    this.genre      = '';
    this.author     = '';
    this.universe   = '';
    this.sort       = 'name';
    this.order      = 'asc';
    this.status     = '';
    this.language   = '';
    this.maturity   = '';
    this.year       = null;
    this.price_min  = null;
    this.price_max  = null;
    this.genreSearch  = '';
    this.authorSearch = '';
    this.filtersOpen  = false;

    // Emite o filtro limpo sem atualizar a URL (navegação abaixo já faz isso)
    this.storeService.setFilter({ searchType: 'books', page: 1, limit: 15, sort: 'name', order: 'asc' });

    // Substitui TODOS os query params — não faz merge, limpa a URL completamente
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1 },
      queryParamsHandling: '',
    });
  }

  emitFilters(updateUrl: boolean = true): void {
    const filter: StoreFilter = {
      searchType: this.searchType,
      query:     this.query    || undefined,
      genre:     this.genre    || undefined,
      author:    this.author   || undefined,
      universe:  this.universe || undefined,
      sort:      this.sort,
      order:     this.order,
      page:      1,
      limit:     15,
      status:    this.status   || undefined,
      language:  this.language || undefined,
      maturity:  this.maturity || undefined,
      year:      this.year     ?? undefined,
      price_min: this.price_min ?? undefined,
      price_max: this.price_max ?? undefined,
      country:   this.country  || undefined,
      currency:  this.currency || undefined,
    };

    this.storeService.setFilter(filter);

    if (updateUrl) {
      const q: any = { page: 1 };
      if (filter.searchType !== 'books') q.searchType = filter.searchType;
      q.query = filter.query ?? '';
      if (filter.genre)             q.genre     = filter.genre;
      if (filter.author)            q.author    = filter.author;
      if (filter.universe)          q.universe  = filter.universe;
      if (filter.sort !== 'name')   q.sort      = filter.sort;
      if (filter.order !== 'asc')   q.order     = filter.order;
      if (filter.status)            q.status    = filter.status;
      if (filter.language)          q.language  = filter.language;
      if (filter.maturity)          q.maturity  = filter.maturity;
      if (filter.year)              q.year      = filter.year;
      if (filter.price_min != null) q.price_min = filter.price_min;
      if (filter.price_max != null) q.price_max = filter.price_max;
      if (filter.country)           q.country   = filter.country;
      if (filter.currency)          q.currency  = filter.currency;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: q,
        queryParamsHandling: 'merge'
      });
    }
  }
}
