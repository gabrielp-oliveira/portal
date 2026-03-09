import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreService, StoreStatsResponse } from '../store.service';
import { StoreFilter, paper, world } from '../../../models/paperTrailTypes';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  standalone: false,
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit, AfterViewInit, OnDestroy {
  isSearchMode = false;
  catalogTotal: number | null = null;
  searchType     = 'books';
  activeQuery    = '';
  activeAuthor   = '';
  activeGenre    = '';
  activeStatus   = '';
  activeMaturity = '';
  loadingSections = true;
  loadError = false;
  sidebarOpen = false;

  heroBook: paper | null = null;
  trendingBooks: paper[] = [];
  newReleases: paper[] = [];
  recommendedBooks: paper[] = [];
  topUniverses: world[] = [];
  universesLoading = false;
  universesLoaded = false;
  newReleasesLoading = false;

  // Hero wishlist
  isLogged = false;
  heroIsInWishlist = false;
  heroWishlistLoading = false;

  @ViewChild('universeAnchor') universeAnchor!: ElementRef;

  stats: StoreStatsResponse = {
    availableBooks: 0,
    comingSoonBooks: 0,
    totalUniverses: 0,
    freeBooks: 0,
    newAvailableThisMonth: 0,
  };
  private destroy$ = new Subject<void>();
  private universeObserver: IntersectionObserver | null = null;

  constructor(
    private storeService: StoreService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Store — Discover Books & Universes');
    this.metaService.updateTag({ name: 'description', content: 'Browse and purchase books and fictional universes. Discover trending stories, new releases and hand-picked recommendations.' });

    // ── Phase 0: meta cache (1h TTL) — hero + stats available instantly ──────
    // Even on first visit to /home, if user already visited store once,
    // meta is cached and we can show the featured book + head panel immediately.
    const cachedMeta = this.storeService.cachedMeta;
    if (cachedMeta?.hero) {
      this.heroBook         = cachedMeta.hero;
      this.heroIsInWishlist = !!cachedMeta.hero.is_in_wishlist;
      if (cachedMeta.stats) this.stats = cachedMeta.stats;
      this.loadingSections  = false;
    }

    // ── Phase 1: home cache (5min TTL) — full sections (trending, releases…) ─
    const cachedHome = this.storeService.cachedHome;
    if (cachedHome) {
      this.applyHome(cachedHome);
      this.loadingSections = false;
    }

    this.loadSections();
    // When cache was used, DOM is ready after first CD cycle — set up observer
    if (cachedMeta?.hero || cachedHome) setTimeout(() => this.setupUniverseObserver());

    this.authService.isLogged$.pipe(takeUntil(this.destroy$)).subscribe(logged => {
      this.isLogged = logged;
    });

    this.storeService.filter$.pipe(takeUntil(this.destroy$)).subscribe(filter => {
      this.isSearchMode   = this.hasActiveSearch(filter);
      this.searchType     = filter.searchType ?? 'books';
      this.activeQuery    = filter.query    ?? '';
      this.activeAuthor   = filter.author   ?? '';
      this.activeGenre    = filter.genre    ?? '';
      this.activeStatus   = filter.status   ?? '';
      this.activeMaturity = filter.maturity ?? '';
    });

    this.storeService.catalogTotal$.pipe(takeUntil(this.destroy$)).subscribe(total => {
      this.catalogTotal = total;
    });
  }

  ngAfterViewInit(): void {
    // O anchor está dentro de *ngIf="!loadingSections", por isso o observer
    // é configurado em setupUniverseObserver(), chamado após o conteúdo renderizar.
  }

  ngOnDestroy(): void {
    this.universeObserver?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private hasActiveSearch(filter: StoreFilter): boolean {
    return !!(
      filter.query ||
      filter.genre ||
      filter.author ||
      filter.status ||
      filter.language ||
      filter.maturity ||
      filter.year ||
      filter.price_min != null ||
      filter.price_max != null ||
      filter.purchased != null ||
      (filter.sort && filter.sort !== 'name') ||
      (filter.order && filter.order !== 'asc') ||
      filter.searchType === 'universes'
    );
  }

  private applyHome(home: import('../store.service').HomeSection): void {
    if ((home as any).hero) {
      this.heroBook         = (home as any).hero;
      this.heroIsInWishlist = !!(home as any).hero.is_in_wishlist;
    }
    this.trendingBooks    = (home.trending    ?? []).slice(0, 5);
    if (!this.newReleases.length) this.newReleases = home.newReleases ?? [];
    this.recommendedBooks = home.recommended ?? [];
    if ((home as any).stats) this.stats = (home as any).stats;
  }

  private loadSections(): void {
    this.storeService.getHome().pipe(takeUntil(this.destroy$)).subscribe({
      next: (home) => {
        this.applyHome(home);
        this.loadingSections = false;
        this.loadNewReleases();
        // Se sem cache, precisa aguardar *ngIf renderizar antes do observer
        if (!this.universesLoaded) setTimeout(() => this.setupUniverseObserver());
      },
      error: () => {
        this.loadingSections = false;
        if (!this.heroBook) this.loadError = true; // only show error if nothing cached to show
      }
    });
  }

  private setupUniverseObserver(): void {
    if (!this.universeAnchor?.nativeElement || this.universesLoaded) return;

    this.universeObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.universesLoaded) {
          this.loadUniverses();
          this.universeObserver?.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    this.universeObserver.observe(this.universeAnchor.nativeElement);
  }

  private loadNewReleases(): void {
    this.newReleasesLoading = true;
    this.storeService.getCatalog({ searchType: 'books', sort: 'created_at', order: 'desc', limit: 10, status: 'available' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.type === 'books') this.newReleases = res.papers;
          this.newReleasesLoading = false;
        },
        error: () => { this.newReleasesLoading = false; }
      });
  }

  private loadUniverses(): void {
    this.universesLoading = true;
    this.storeService.getCatalog({ searchType: 'universes', page: 1, limit: 4 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.type === 'universes') this.topUniverses = res.worlds;
          this.universesLoading = false;
          this.universesLoaded  = true;
        },
        error: () => { this.universesLoading = false; }
      });
  }

  toggleHeroWishlist(event: Event): void {
    event.stopPropagation();
    if (!this.isLogged || this.heroWishlistLoading || !this.heroBook) return;

    const prev = this.heroIsInWishlist;
    this.heroIsInWishlist    = !prev;
    this.heroWishlistLoading = true;

    this.storeService.toggleWishlist(this.heroBook.id).subscribe({
      next: (res) => {
        this.heroIsInWishlist    = res.is_in_wishlist;
        this.heroWishlistLoading = false;
      },
      error: () => {
        this.heroIsInWishlist    = prev;
        this.heroWishlistLoading = false;
      }
    });
  }

  formatPrice(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  }

  truncate(text: string, max: number): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  trackById(_: number, item: { id: string }): string { return item.id; }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void  { this.sidebarOpen = false; }

  clearFilters(): void {
    this.storeService.setFilter({ searchType: 'books', page: 1, limit: 15, sort: 'name', order: 'asc' });
  }

  retry(): void {
    this.loadError = false;
    this.loadingSections = true;
    this.loadSections();
  }

  goToBook(book: paper): void {
    this.router.navigate(['/store/book', book.id]);
  }

  seeAll(params: Record<string, any>): void {
    this.router.navigate(['/store'], { queryParams: params });
  }
}
