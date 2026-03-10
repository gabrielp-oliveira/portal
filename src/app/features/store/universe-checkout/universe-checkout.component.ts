import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../store.service';
import { paper } from '../../../models/paperTrailTypes';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-universe-checkout',
  templateUrl: './universe-checkout.component.html',
  styleUrls: ['./universe-checkout.component.scss']
})
export class UniverseCheckoutComponent implements OnInit, OnDestroy {
  id            = '';
  collectionName = '';
  books: paper[] = [];
  booksToBuy: paper[] = [];

  paymentMethod  = '';
  total          = 0;
  totalOriginal  = 0;
  ownedCount     = 0;
  country        = 'US';
  currencyCode   = 'USD';
  purchasing     = false;
  purchaseError: string | null = null;
  termsAccepted  = false;
  consentTouched = false;
  isPt           = navigator.language.startsWith('pt');

  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: StoreService,
    private titleSvc: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    const universeId = this.route.snapshot.paramMap.get('id');
    if (!universeId) return;
    this.id = universeId;

    fetch('https://ipapi.co/json')
      .then(r => r.json())
      .then(d => {
        this.country      = d.country === 'BR' ? 'BR' : 'US';
        this.currencyCode = this.country === 'BR' ? 'BRL' : 'USD';
      })
      .catch(() => { this.country = 'US'; this.currencyCode = 'USD'; })
      .finally(() => this.loadContent());
  }

  private loadContent(): void {
    const sub = this.store.getUniverseById(this.id, this.currencyCode, this.country).subscribe(res => {
      const u = res.universe ?? (res as any);
      this.collectionName  = u.name;
      this.books           = u.papers || [];
      this.booksToBuy      = this.books.filter((b: paper) => !b.AlreadyPurchased);
      this.ownedCount      = this.books.length - this.booksToBuy.length;
      this.total           = this.booksToBuy.reduce((s, b) => s + (Number(b.price) || 0), 0);
      this.totalOriginal   = this.books.reduce((s, b) => s + (Number(b.price) || 0), 0);

      const pageTitle = `Buy ${u.name} Universe — Narratus`;
      this.titleSvc.setTitle(pageTitle);
      this.meta.updateTag({ name: 'robots',          content: 'noindex, nofollow' });
      this.meta.updateTag({ name: 'description',     content: `Get the full "${u.name}" universe — ${this.books.length} books on Narratus.` });
      this.meta.updateTag({ property: 'og:title',   content: pageTitle });
      this.meta.updateTag({ property: 'og:description', content: `Get the full "${u.name}" universe — ${this.books.length} books on Narratus.` });
      const cover = this.books[0]?.cover_url;
      if (cover) { this.meta.updateTag({ property: 'og:image', content: cover }); }
    });
    this.subs.push(sub);
  }

  finalizePurchase(): void {
    if (this.total > 0 && !this.paymentMethod) return;
    if (!this.termsAccepted) return;

    this.purchasing    = true;
    this.purchaseError = null;

    const body = {
      paymentMethod: this.paymentMethod || 'free',
      type: 'universe',
      country: this.country,
      currencyCode: this.currencyCode,
      id: this.id,
    };

    const sub = this.store.checkoutUniverse(body).subscribe({
      next: (res: any) => {
        this.purchasing = false;
        if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        } else {
          alert('Universe added to your library!');
        }
      },
      error: (err) => {
        this.purchasing    = false;
        this.purchaseError = err?.error?.error || 'Something went wrong. Please try again.';
      }
    });
    this.subs.push(sub);
  }

  trackById(_: number, b: paper): string { return b.id; }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
