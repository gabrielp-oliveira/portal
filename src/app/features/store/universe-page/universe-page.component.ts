import { Component, OnInit, OnDestroy, Inject, HostListener, DestroyRef, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GeoService } from '../../../core/geo.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RecommendedBook, RatingResponse, StoreService, UniverseDetailResponse } from '../store.service';
import { world } from '../../../models/paperTrailTypes';

@Component({
  standalone: false,
  selector: 'app-universe-page',
  templateUrl: './universe-page.component.html',
  styleUrls: ['./universe-page.component.scss']
})
export class UniversePageComponent implements OnInit, OnDestroy {
  universeId: string | null = null;
  universe:   world | null  = null;
  loading     = true;

  readonly SKELETON_BOOKS  = [1, 2, 3, 4, 5, 6];
  readonly STARS           = [1, 2, 3, 4, 5];
  readonly DEFAULT_COVER   = 'https://res.cloudinary.com/dyibidxxv/image/upload/defaultCover_lublod';

  isPurchased    = false;
  isInWishlist   = false;
  isLogged       = false;
  showBackToTop  = false;

  ratingAvg:   number | null = null;
  ratingCount  = 0;
  userRating:  number | null = null;
  hoverRating  = 0;
  ratingLoading = false;
  wishlistLoading = false;

  totalPrice     = 0;
  remainingPrice = 0;
  currency       = 'USD';
  country        = 'US';

  booksAvailableToBuy = 0;
  allOwned = false;

  byAuthor:  RecommendedBook[] = [];
  byGenre:   RecommendedBook[] = [];
  byExplore: RecommendedBook[] = [];

  private jsonLdEl:  HTMLScriptElement | null = null;
  private storeSub:  import('rxjs').Subscription | null = null;
  private canonical: HTMLLinkElement | null = null;
  private destroyRef = inject(DestroyRef);

  constructor(
    private store:  StoreService,
    private route:  ActivatedRoute,
    public  router: Router,
    private geo:    GeoService,
    private auth:   AuthService,
    private title:  Title,
    private meta:   Meta,
    @Inject(DOCUMENT) private doc: Document,
  ) {}

  ngOnInit(): void {
    this.auth.isLogged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => this.isLogged = s);

    this.universeId = this.route.snapshot.paramMap.get('id');
    if (!this.universeId) return;
    const id = this.universeId;

    this.geo.geo.then(({ country, currency }) => {
      this.country  = country;
      this.currency = currency;

      this.storeSub = this.store.getUniverseById(id, currency, country).subscribe((res) => {
        // Backend may return the world object directly or nested under `universe`
        this.universe      = res.universe ?? (res as any);
        this.isPurchased   = res.isPurchased   ?? false;
        this.isInWishlist  = res.isInWishlist  ?? false;
        this.ratingAvg     = res.ratingAvg     ?? null;
        this.ratingCount   = res.ratingCount   ?? 0;
        this.userRating    = res.userRating    ?? null;
        this.totalPrice    = res.totalPrice    ?? 0;
        this.remainingPrice = res.remainingPrice ?? 0;
        this.currency      = res.currency      ?? currency;

        const papers = this.universe?.papers ?? [];
        this.booksAvailableToBuy = papers.filter(p => p.status === 'available' && !p.AlreadyPurchased).length;
        this.allOwned = papers.length > 0 && papers.every(p => p.AlreadyPurchased || p.status !== 'available');

        this.byAuthor  = res.recommendations?.byAuthor ?? [];
        this.byGenre   = res.recommendations?.byGenre  ?? [];
        this.byExplore = res.recommendations?.explore  ?? [];

        this.loading = false;

        // SEO
        const u           = this.universe!;
        const pageTitle   = (u.name ?? 'Universe') + ' | Portal';
        const description = (u.description ?? '').slice(0, 155).trim() || `Explore the ${u.name} universe on Portal.`;
        const coverUrl    = u.CoverURLs?.[0] ?? '';
        const pageUrl     = this.doc.location.href;

        this.title.setTitle(pageTitle);
        this.meta.updateTag({ name: 'description',             content: description });
        this.meta.updateTag({ name: 'robots',                  content: 'index, follow' });
        this.meta.updateTag({ property: 'og:title',            content: pageTitle });
        this.meta.updateTag({ property: 'og:description',      content: description });
        this.meta.updateTag({ property: 'og:type',             content: 'website' });
        this.meta.updateTag({ property: 'og:url',              content: pageUrl });
        this.meta.updateTag({ name:     'twitter:card',        content: 'summary_large_image' });
        this.meta.updateTag({ name:     'twitter:title',       content: pageTitle });
        this.meta.updateTag({ name:     'twitter:description', content: description });
        if (coverUrl) {
          this.meta.updateTag({ property: 'og:image',        content: coverUrl });
          this.meta.updateTag({ property: 'og:image:width',  content: '560' });
          this.meta.updateTag({ property: 'og:image:height', content: '840' });
          this.meta.updateTag({ name:     'twitter:image',   content: coverUrl });
        }

        if (!this.canonical) {
          this.canonical = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
          if (!this.canonical) {
            this.canonical = this.doc.createElement('link');
            this.canonical.rel = 'canonical';
            this.doc.head.appendChild(this.canonical);
          }
        }
        this.canonical.href = pageUrl;

        this.injectJsonLd({
          '@context':   'https://schema.org',
          '@type':      'BookSeries',
          name:         u.name,
          description:  description,
          image:        coverUrl || undefined,
          genre:        u.Genres?.length ? u.Genres : undefined,
          url:          pageUrl,
          numberOfItems: papers.length || undefined,
          hasPart: papers.map(p => ({
            '@type':  'Book',
            name:     p.name,
            author:   p.author_name ? { '@type': 'Person', name: p.author_name } : undefined,
          })),
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.jsonLdEl?.remove();
    this.canonical?.remove();
    this.storeSub?.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showBackToTop = window.scrollY > 400;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToLogin(): void {
    localStorage.setItem('auth-redirect', this.router.url);
    this.router.navigate(['/login']);
  }

  get wishlistLabel(): string {
    return this.isInWishlist ? 'Saved' : 'Save';
  }

  toggleWishlist(): void {
    if (!this.universeId || this.wishlistLoading) return;
    const prev = this.isInWishlist;
    this.isInWishlist    = !prev;
    this.wishlistLoading = true;
    this.store.toggleUniverseWishlist(this.universeId).subscribe({
      next:  (res) => { this.isInWishlist = res.isInWishlist; this.wishlistLoading = false; },
      error: ()    => { this.isInWishlist = prev;               this.wishlistLoading = false; }
    });
  }

  starIcon(pos: number): string {
    const val = this.hoverRating || this.userRating || this.ratingAvg || 0;
    if (pos <= Math.floor(val)) return 'star';
    if (pos === Math.ceil(val) && val % 1 >= 0.5) return 'star_half';
    return 'star_border';
  }

  rate(stars: number): void {
    if (!this.isLogged || this.ratingLoading || !this.universeId) return;
    if (stars === this.userRating) {
      this.ratingLoading = true;
      this.store.deleteUniverseRating(this.universeId).subscribe({
        next: (res) => { this.applyRating(res); },
        error: () => { this.ratingLoading = false; }
      });
      return;
    }
    this.ratingLoading = true;
    this.store.rateUniverse(this.universeId, stars).subscribe({
      next: (res) => { this.applyRating(res); },
      error: () => { this.ratingLoading = false; }
    });
  }

  private applyRating(res: RatingResponse): void {
    this.ratingAvg   = res.ratingAvg;
    this.ratingCount = res.ratingCount;
    this.userRating  = res.userRating;
    this.ratingLoading = false;
  }

  get backdropUrl(): string {
    return this.universe?.CoverURLs?.[0] ?? '';
  }

  private injectJsonLd(data: object): void {
    if (!this.jsonLdEl) {
      this.jsonLdEl = this.doc.createElement('script');
      this.jsonLdEl.type = 'application/ld+json';
      this.doc.head.appendChild(this.jsonLdEl);
    }
    this.jsonLdEl.textContent = JSON.stringify(data);
  }
}
