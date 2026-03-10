import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { paper } from '../../../models/paperTrailTypes';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../store.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-book-checkout',
  templateUrl: './book-checkout.component.html',
  styleUrls: ['./book-checkout.component.scss']
})
export class BookCheckoutComponent implements OnInit {
  book: paper | null = null;

  paymentMethod  = '';
  country        = 'US';
  currencyCode   = 'USD';
  purchasing     = false;
  purchaseError: string | null = null;
  termsAccepted  = false;
  consentTouched = false;
  isPt           = navigator.language.startsWith('pt');

  private destroyRef = inject(DestroyRef);
  private titleSvc   = inject(Title);
  private meta       = inject(Meta);

  constructor(
    private route: ActivatedRoute,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    const paperId = this.route.snapshot.paramMap.get('paperId');
    if (!paperId) return;

    fetch('https://ipapi.co/json')
      .then(r => r.json())
      .then(d => {
        this.country      = d.country === 'BR' ? 'BR' : 'US';
        this.currencyCode = this.country === 'BR' ? 'BRL' : 'USD';
      })
      .catch(() => { this.country = 'US'; this.currencyCode = 'USD'; })
      .finally(() => {
        this.store.getPaperById(paperId, this.currencyCode, this.country)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(res => {
            this.book = res.paper;
            const b = res.paper;
            const pageTitle = `Buy ${b.name} — Narratus`;
            this.titleSvc.setTitle(pageTitle);
            this.meta.updateTag({ name: 'robots',          content: 'noindex, nofollow' });
            this.meta.updateTag({ name: 'description',     content: `Purchase "${b.name}" by ${b.author_name} on Narratus.` });
            this.meta.updateTag({ property: 'og:title',   content: pageTitle });
            this.meta.updateTag({ property: 'og:description', content: `Purchase "${b.name}" by ${b.author_name} on Narratus.` });
            if (b.cover_url) { this.meta.updateTag({ property: 'og:image', content: b.cover_url }); }
          });
      });
  }

  finalizePurchase(): void {
    if (!this.book) return;
    if (this.book.price > 0 && !this.paymentMethod) return;
    if (!this.termsAccepted) return;

    this.purchasing   = true;
    this.purchaseError = null;

    const body = {
      paymentMethod: this.paymentMethod || 'free',
      type: 'book',
      country: this.country,
      currencyCode: this.currencyCode,
      id: this.book.id,
    };

    this.store.checkoutBook(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.purchasing = false;
          if (res.checkoutUrl) {
            window.location.href = res.checkoutUrl;
          } else {
            alert('Book added to your library!');
          }
        },
        error: (err) => {
          this.purchasing    = false;
          this.purchaseError = err?.error?.error || 'Something went wrong. Please try again.';
        }
      });
  }

  truncate(text: string, max: number): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
  }
}
