import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LibraryService } from '../library.service';
import { StoreService, SimplePaper } from '../../store/store.service';
import { paper } from '../../../models/paperTrailTypes';

export interface LibraryBook {
  paper:            paper;
  totalChapters:    number;
  completedCount:   number;
  favoritesCount:   number;
  annotationsCount: number;
  lastReadOrder:    number | null;
  nextChapterOrder: number | null;
}

export interface LibraryUniverse {
  id:      string;
  name:    string;
  covers:  string[];
  count:   number;
  genres:  string[];
  authors: string[];
}

export type SortKey = 'default' | 'title' | 'progress' | 'favorites';

@Component({
  standalone: false,
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, AfterViewInit, OnDestroy {
  private allBooks: LibraryBook[] = [];
  books: LibraryBook[] = [];
  totalBooks = 0;
  page = 1;
  limit = 12;

  universes: LibraryUniverse[] = [];

  loading = true;
  sortKey: SortKey = 'default';
  isScrolled    = false;
  showBackToTop = false;

  @HostListener('window:scroll')
  onScroll(): void {
    const y = window.scrollY;
    this.isScrolled    = y > 8;
    this.showBackToTop = y > 400;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  totalChaptersRead = 0;
  totalFavorites    = 0;
  totalAnnotations  = 0;
  resumeBook: LibraryBook | null = null;

  recommendations: paper[] = [];
  recommendationsLoading = false;
  private recsLoaded = false;
  private recsObserver: IntersectionObserver | null = null;
  @ViewChild('recsAnchor') recsAnchorRef!: ElementRef<HTMLElement>;

  wishlist: SimplePaper[] = [];
  wishlistLoading = false;

  readonly DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/defaultCover_lublod';

  constructor(
    private libraryService: LibraryService,
    private storeService: StoreService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadWishlist();
  }

  ngAfterViewInit(): void {
    this.recsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.recsLoaded) {
          this.recsLoaded = true;
          this.loadRecommendations();
          this.recsObserver?.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    this.recsObserver.observe(this.recsAnchorRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.recsObserver?.disconnect();
  }

  private load(): void {
    this.loading = true;
    this.libraryService.getLibraryBooks(this.page, this.limit).subscribe({
      next: (res) => {
        this.allBooks = res.papers.map(p => ({
          paper:            p,
          totalChapters:    p.progress?.totalChapters    ?? 0,
          completedCount:   p.progress?.completedCount   ?? 0,
          favoritesCount:   p.progress?.favoritesCount   ?? 0,
          annotationsCount: p.progress?.annotationsCount ?? 0,
          lastReadOrder:    p.progress?.lastReadOrder    ?? null,
          nextChapterOrder: p.progress?.nextChapterOrder ?? null,
        }));
        this.totalBooks = res.total;
        this.deriveUniverses();
        this.computeStats();
        this.applySort();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private loadWishlist(): void {
    this.wishlistLoading = true;
    this.storeService.getWishlistDetails().subscribe({
      next: (res) => { this.wishlist = res.papers; this.wishlistLoading = false; },
      error: ()    => { this.wishlistLoading = false; }
    });
  }

  removeFromWishlist(item: SimplePaper): void {
    this.wishlist = this.wishlist.filter(w => w.id !== item.id);
    this.storeService.toggleWishlist(item.id).subscribe({
      error: () => { this.wishlist = [item, ...this.wishlist]; }
    });
  }

  private loadRecommendations(): void {
    this.recommendationsLoading = true;
    this.libraryService.getRecommendations(6).subscribe({
      next: (res) => { this.recommendations = res.papers; this.recommendationsLoading = false; },
      error: ()    => { this.recommendationsLoading = false; }
    });
  }

  private deriveUniverses(): void {
    const map = new Map<string, LibraryUniverse>();

    for (const b of this.allBooks) {
      const { world_id, world_name, cover_url, genre, author_name } = b.paper;
      if (!world_id || !world_name) continue;

      if (!map.has(world_id)) {
        map.set(world_id, { id: world_id, name: world_name, covers: [], count: 0, genres: [], authors: [] });
      }
      const u = map.get(world_id)!;
      u.count++;
      if (cover_url && !u.covers.includes(cover_url)) u.covers.push(cover_url);
      genre?.forEach(g => { if (!u.genres.includes(g)) u.genres.push(g); });
      if (author_name && !u.authors.includes(author_name)) u.authors.push(author_name);
    }

    this.universes = Array.from(map.values());
  }

  private computeStats(): void {
    this.totalChaptersRead = this.allBooks.reduce((n, b) => n + b.completedCount,   0);
    this.totalFavorites    = this.allBooks.reduce((n, b) => n + b.favoritesCount,   0);
    this.totalAnnotations  = this.allBooks.reduce((n, b) => n + b.annotationsCount, 0);

    this.resumeBook =
      this.allBooks.find(b => b.completedCount > 0 && b.completedCount < b.totalChapters) ??
      this.allBooks.find(b => b.completedCount === 0 && b.totalChapters > 0) ??
      null;
  }

  setSort(key: SortKey): void {
    this.sortKey = key;
    this.applySort();
  }

  private applySort(): void {
    const arr = [...this.allBooks];
    switch (this.sortKey) {
      case 'title':     arr.sort((a, b) => a.paper.name.localeCompare(b.paper.name)); break;
      case 'progress':  arr.sort((a, b) => this.progressPct(b) - this.progressPct(a)); break;
      case 'favorites': arr.sort((a, b) => b.favoritesCount - a.favoritesCount); break;
    }
    this.books = arr;
  }

  onPageChange(page: number): void {
    this.page = page;
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  continueReading(book: LibraryBook): void {
    if (!book.nextChapterOrder) return;
    this.router.navigate(['/read/book', book.paper.id, 'chapter', book.nextChapterOrder]);
  }

  progressPct(book: LibraryBook): number {
    if (!book.totalChapters) return 0;
    return Math.round((book.completedCount / book.totalChapters) * 100);
  }

  get pages(): number[] {
    const count = Math.ceil(this.totalBooks / this.limit);
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
  trackByPaper(_: number, item: LibraryBook): string { return item.paper.id; }
  trackByRec(_: number, item: paper): string { return item.id; }
  trackByWishlist(_: number, item: SimplePaper): string { return item.id; }
}
