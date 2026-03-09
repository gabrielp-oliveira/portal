import { Component, OnInit, OnDestroy, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { GeoService } from '../../../core/geo.service';
import { RecommendedBook, StoreService, UniverseBook } from '../store.service';

@Component({
  standalone: false,
  selector: 'app-paper-page',
  templateUrl: './paper-page.component.html',
  styleUrls: ['./paper-page.component.scss'],
})
export class PaperPageComponent implements OnInit, OnDestroy {
  paper$ = this.store.storePaper$;
  loading = true;
  showBackToTop = false;

  // Readonly arrays — avoid re-creation on every change-detection cycle
  readonly SKELETON_ROWS  = [1, 2, 3, 4];
  readonly SKELETON_STARS = [1, 2, 3, 4, 5];

  PaperCount!: number;
  worldDescription!: string;
  isPurchased      = false;
  isInWishlist     = false;
  synopsisExpanded = false;

  universeBooks: UniverseBook[] = [];
  readonly DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/defaultCover_lublod';

  ratingAvg:   number | null = null;
  ratingCount  = 0;
  userRating:  number | null = null;

  byAuthor:  RecommendedBook[] = [];
  byGenre:   RecommendedBook[] = [];
  byExplore: RecommendedBook[] = [];

  country      = 'US';
  currencyCode = 'USD';

  private jsonLdEl:   HTMLScriptElement | null = null;
  private storeSub:   import('rxjs').Subscription | null = null;

  constructor(
    private store: StoreService,
    private route: ActivatedRoute,
    public  router: Router,
    private geo:   GeoService,
    private title: Title,
    private meta:  Meta,
    @Inject(DOCUMENT) private doc: Document,
  ) {}

  ngOnInit(): void {
    const paperId = this.route.snapshot.paramMap.get('paperId');
    if (!paperId) return;

    this.geo.geo.then(({ country, currency }) => {
      this.country      = country;
      this.currencyCode = currency;

      this.storeSub = this.store.getPaperById(paperId, currency, country).subscribe((res) => {
        this.store.setStorePaper(res.paper);
        this.PaperCount       = res.PaperCount;
        this.worldDescription = res.worldDescription;
        this.isPurchased      = res.isPurchased;
        this.isInWishlist     = res.isInWishlist;

        this.universeBooks = res.universeBooks             ?? [];
        this.ratingAvg     = res.ratingAvg                 ?? null;
        this.ratingCount   = res.ratingCount               ?? 0;
        this.userRating    = res.userRating                 ?? null;
        this.byAuthor      = res.recommendations?.byAuthor  ?? [];
        this.byGenre       = res.recommendations?.byGenre   ?? [];
        this.byExplore     = res.recommendations?.explore   ?? [];

        this.loading = false;

        const p           = res.paper;
        const pageTitle   = p.name + (p.author_name ? ' — ' + p.author_name : '') + ' | Portal';
        const description = (p.description ?? '').slice(0, 155).trim() || `Read ${p.name} on Portal.`;
        const coverUrl    = p.cover_url ?? '';

        const pageUrl = this.doc.location.href;

        this.title.setTitle(pageTitle);
        this.meta.updateTag({ name: 'description',             content: description });
        this.meta.updateTag({ name: 'robots',                  content: 'index, follow' });
        this.meta.updateTag({ property: 'og:title',            content: pageTitle });
        this.meta.updateTag({ property: 'og:description',      content: description });
        this.meta.updateTag({ property: 'og:type',             content: 'book' });
        this.meta.updateTag({ property: 'og:url',              content: pageUrl });
        this.meta.updateTag({ name:     'twitter:card',        content: 'summary_large_image' });
        this.meta.updateTag({ name:     'twitter:title',       content: pageTitle });
        this.meta.updateTag({ name:     'twitter:description', content: description });
        if (coverUrl) {
          this.meta.updateTag({ property: 'og:image',          content: coverUrl });
          this.meta.updateTag({ property: 'og:image:width',    content: '520' });
          this.meta.updateTag({ property: 'og:image:height',   content: '780' });
          this.meta.updateTag({ name:     'twitter:image',     content: coverUrl });
        }

        // Canonical link
        let canonical = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) {
          canonical = this.doc.createElement('link');
          canonical.rel = 'canonical';
          this.doc.head.appendChild(canonical);
        }
        canonical.href = pageUrl;

        // JSON-LD structured data (Book schema)
        this.injectJsonLd({
          '@context':    'https://schema.org',
          '@type':       'Book',
          name:          p.name,
          author:        { '@type': 'Person', name: p.author_name },
          description:   description,
          image:         coverUrl || undefined,
          inLanguage:    p.language || undefined,
          genre:         p.genre?.length ? p.genre : undefined,
          datePublished: p.year ? String(p.year) : undefined,
          isbn:          p.isbn_13 || p.isbn_10 || undefined,
          url:           pageUrl,
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.jsonLdEl?.remove();
    this.storeSub?.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const past = window.scrollY > 400;
    if (past !== this.showBackToTop) { this.showBackToTop = past; }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onRatingChange(res: { ratingAvg: number | null; ratingCount: number; userRating: number | null }): void {
    this.ratingAvg   = res.ratingAvg;
    this.ratingCount = res.ratingCount;
    this.userRating  = res.userRating;
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
