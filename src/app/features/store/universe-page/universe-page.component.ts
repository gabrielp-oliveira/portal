import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { GeoService } from '../../../core/geo.service';
import { world } from '../../../models/paperTrailTypes';
import { StoreService } from '../store.service';

@Component({
  standalone: false,
  selector: 'app-universe-page',
  templateUrl: './universe-page.component.html',
  styleUrls: ['./universe-page.component.scss']
})
export class UniversePageComponent implements OnInit {
  universeId: string | null = null;
  universeData: world | null = null;
  loading = true;
  universeDescription    = '';
  universePrice          = 0;
  alreadyPurchasedTotal  = 0;
  booksAvailableToBuy    = 0;
  fullUniversePrice      = 0;
  booksAvailable         = 0;
  recommendedBooks: any[] = [];
  readonly DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/defaultCover_lublod';
  priceCurrencysePrice   = 'USD';
  currencyCode           = 'USD';
  country                = 'US';

  constructor(
    private store: StoreService,
    private route: ActivatedRoute,
    private geo:   GeoService,
    private title: Title,
    private meta:  Meta,
  ) {}

  ngOnInit(): void {
    this.universeId = this.route.snapshot.paramMap.get('id');
    if (!this.universeId) return;

    const id = this.universeId;

    // GeoService já iniciou o fetch no boot do app — sem serialização ipapi→API.
    this.geo.geo.then(({ country, currency }) => {
      this.country      = country;
      this.currencyCode = currency;

      this.store.getUniverseById(id, currency, country).subscribe((res) => {
        this.loading           = false;
        this.universeData      = res;
        this.universeDescription = res.description;
        this.priceCurrencysePrice = res.papers?.[0]?.priceCurrency || currency;

        this.booksAvailableToBuy = res.papers
          .filter(p => p.status === 'available' && !p.AlreadyPurchased).length;

        this.fullUniversePrice = res.papers
          .filter(p => p.status === 'available')
          .reduce((sum, p) => sum + (p.price || 0), 0);

        this.universePrice = res.papers
          .filter(p => p.status === 'available' && !p.AlreadyPurchased)
          .reduce((sum, p) => sum + (p.price || 0), 0);

        this.alreadyPurchasedTotal = res.papers
          .filter(p => p.status === 'available' && p.AlreadyPurchased)
          .reduce((sum, p) => sum + (p.price || 0), 0);

        // SEO
        const pageTitle   = (res.name ?? 'Universo') + ' | Portal';
        const description = (res.description ?? '').slice(0, 155).trim()
          || `Explore o universo ${res.name} no Portal.`;
        const coverUrl = res.CoverURLs?.[0] ?? '';

        this.title.setTitle(pageTitle);
        this.meta.updateTag({ name: 'description',        content: description });
        this.meta.updateTag({ name: 'robots',             content: 'index, follow' });
        this.meta.updateTag({ property: 'og:title',       content: pageTitle });
        this.meta.updateTag({ property: 'og:description', content: description });
        this.meta.updateTag({ property: 'og:type',        content: 'website' });
        if (coverUrl) {
          this.meta.updateTag({ property: 'og:image',     content: coverUrl });
        }
      });
    });
  }

  buyUniverse(): void { /* lógica de compra */ }
}
