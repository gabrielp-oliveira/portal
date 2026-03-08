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
    this.loadSections();

    this.authService.isLogged$.pipe(takeUntil(this.destroy$)).subscribe(logged => {
      this.isLogged = logged;
    });

    this.storeService.filter$.pipe(takeUntil(this.destroy$)).subscribe(filter => {
      this.isSearchMode = this.hasActiveSearch(filter);
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

  private loadSections(): void {
    this.storeService.getHome().pipe(takeUntil(this.destroy$)).subscribe({
      next: (home) => {
        this.heroBook            = home.hero ?? null;
        this.heroIsInWishlist    = !!home.hero?.is_in_wishlist;
        this.trendingBooks       = home.trending;
        this.newReleases         = home.newReleases;
        this.recommendedBooks    = home.recommended;
        this.stats               = home.stats;
        this.loadingSections     = false;
        // Aguarda Angular renderizar o *ngIf antes de configurar o observer
        setTimeout(() => this.setupUniverseObserver());
      },
      error: () => { this.loadingSections = false; this.loadError = true; }
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
