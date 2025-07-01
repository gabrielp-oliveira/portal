import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../store.service';
import { world } from '../../../models/paperTrailTypes';

@Component({
  selector: 'app-universe-page',
  templateUrl: './universe-page.component.html',
  styleUrls: ['./universe-page.component.scss']
})
export class UniversePageComponent {
  universeId: string | null = null;
  universeData: world | null = null;
  universeDescription: string = '';
  universePrice: number = 0;
  alreadyPurchasedTotal: number = 0;
  booksAvailableToBuy: number = 0;
  fullUniversePrice: number = 0;


  booksAvailable: number = 0;
  recommendedBooks: any[] = [];
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';
  priceCurrencysePrice: string = 'USD';
  currencyCode = 'USD';
  country = 'US';

  constructor(
    private store: StoreService,
    private route: ActivatedRoute
  ) {
    this.universeId = this.route.snapshot.paramMap.get('id');

    // Primeiro detecta a localização
    fetch('https://ipapi.co/json')
      .then(res => res.json())
      .then(data => {
        this.country = data.country === 'BR' ? 'BR' : 'US';
        this.currencyCode = this.country === 'BR' ? 'BRL' : 'USD';
      })
      .catch(() => {
        this.country = 'US';
        this.currencyCode = 'USD';
      })
      .finally(() => {
        if (this.universeId) {
          this.store.getUniverseById(this.universeId, this.currencyCode, this.country).subscribe((res) => {
            this.universeData = res;
            this.universeDescription = res.description;
            this.priceCurrencysePrice = res.papers?.[0]?.priceCurrency || this.currencyCode;

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

          });
        }
      });
  }

  optimizeImage(url: string): string {
    if (!url) return this.DEFAULT_COVER;
    return url.includes('/upload/')
      ? url.replace('/upload/', '/upload/w_300,f_auto,q_auto/')
      : url;
  }

  buyUniverse() {
    // lógica de compra
  }
}
