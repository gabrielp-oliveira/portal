import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../store.service';
import { world } from '../../../models/paperTrailTypes';

@Component({
  selector: 'app-universe-page',
  templateUrl: './universe-page.component.html',
  styleUrl: './universe-page.component.scss'
})
export class UniversePageComponent {
  universeId: string | null = null;
  universeData: world | null = null;
  universeDescription: string = '';
  universePrice: number = 0;
  booksAvailable: number = 0;
  recommendedBooks: any[] = [];
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';
  priceCurrencysePrice: string = 'USD';

  constructor(
    private store: StoreService,
    private route: ActivatedRoute
  ) {
    this.universeId = this.route.snapshot.paramMap.get('id');
    if (this.universeId) {
      this.store.getUniverseById(this.universeId).subscribe((res) => {
        this.priceCurrencysePrice = res.papers[0].priceCurrency
        this.universeData = res
        this.universeDescription = res.description;
        // this.recommendedBooks = res.recommendedBooks;
        this.universePrice = res.papers
          .filter(p => p.status === 'available')
          .reduce((sum, p) => sum + (p.price || 0), 0);

          this.booksAvailable = res.papers
          .filter(p => p.status === 'available').length
      });
    }
  }

  optimizeImage(url: string): string {
    if (!url) return this.DEFAULT_COVER;
    return url.includes('/upload/')
      ? url.replace('/upload/', '/upload/w_300,f_auto,q_auto/')
      : url;
  }

  buyUniverse() {
    // alert(`🛒 Comprando o universo "${this.universeData?.name}" com ${this.universeData.papers.length} livros!`);
    // Aqui você pode integrar lógica de checkout futuramente
  }


}
