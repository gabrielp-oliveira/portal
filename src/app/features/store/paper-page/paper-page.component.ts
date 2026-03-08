import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { GeoService } from '../../../core/geo.service';
import { StoreService } from '../store.service';

@Component({
  standalone: false,
  selector: 'app-paper-page',
  templateUrl: './paper-page.component.html',
  styleUrls: ['./paper-page.component.scss'],
})
export class PaperPageComponent implements OnInit {
  paper$ = this.store.storePaper$;
  loading = true;

  PaperCount!: number;
  worldDescription!: string;
  recommendedBooks: any;
  isPurchased  = false;
  isInWishlist = false;

  country      = 'US';
  currencyCode = 'USD';

  constructor(
    private store:  StoreService,
    private route:  ActivatedRoute,
    private geo:    GeoService,
    private title:  Title,
    private meta:   Meta,
  ) {}

  ngOnInit(): void {
    const paperId = this.route.snapshot.paramMap.get('paperId');
    if (!paperId) return;

    // GeoService já iniciou o fetch no boot do app — sem serialização ipapi→API.
    this.geo.geo.then(({ country, currency }) => {
      this.country      = country;
      this.currencyCode = currency;

      this.store.getPaperById(paperId, currency, country).subscribe((paper) => {
        this.store.setStorePaper(paper.paper);
        this.PaperCount       = paper.PaperCount;
        this.worldDescription = paper.worldDescription;
        this.isPurchased      = paper.isPurchased;
        this.isInWishlist     = paper.isInWishlist;
        this.loading          = false;

        // SEO — definido depois que os dados chegam
        const p = paper.paper;
        const pageTitle = p.name + (p.author_name ? ' — ' + p.author_name : '') + ' | Portal';
        const description = (p.description ?? '').slice(0, 155).trim()
          || `Leia ${p.name} no Portal.`;
        const coverUrl = p.cover_url ?? '';

        this.title.setTitle(pageTitle);
        this.meta.updateTag({ name: 'description',    content: description });
        this.meta.updateTag({ name: 'robots',         content: 'index, follow' });
        this.meta.updateTag({ property: 'og:title',   content: pageTitle });
        this.meta.updateTag({ property: 'og:description', content: description });
        this.meta.updateTag({ property: 'og:type',    content: 'book' });
        if (coverUrl) {
          this.meta.updateTag({ property: 'og:image', content: coverUrl });
        }
      });
    });
  }
}
