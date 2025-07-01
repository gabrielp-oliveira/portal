import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../store.service';
import { paper } from '../../../models/paperTrailTypes';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-universe-checkout',
  templateUrl: './universe-checkout.component.html',
  styleUrls: ['./universe-checkout.component.scss']
})
export class UniverseCheckoutComponent implements OnInit, OnDestroy {
  id: string = '';
  collectionName = '';
  books: paper[] = [];
  booksToBuy: paper[] = [];

  paymentMethod: string = '';
  total = 0;
  totalOriginal = 0;
  country = 'BR';
  currencyCode = 'BRL';
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    const universeId = this.route.snapshot.paramMap.get('id');
    if (!universeId) return;

    this.id = universeId;

    fetch('https://ipapi.co/json')
      .then(res => res.json())
      .then(data => {
        this.country = data.country === 'BR' ? 'BR' : 'US';
        this.currencyCode = this.country === 'BR' ? 'BRL' : 'USD';
        this.loadContent();
      })
      .catch(() => {
        this.country = 'US';
        this.currencyCode = 'USD';
        this.loadContent();
      });
  }

  loadContent() {
    const sub = this.store.getUniverseById(this.id, this.currencyCode, this.country).subscribe(universe => {
      this.collectionName = universe.name;
      this.books = universe.papers || [];

      this.booksToBuy = this.books.filter(b => !b.AlreadyPurchased);
      this.total = this.booksToBuy.reduce((sum, book) => sum + (Number(book.price) || 0), 0);
      this.totalOriginal = this.books.reduce((sum, book) => sum + (Number(book.price) || 0), 0);
    });

    this.subscriptions.push(sub);
  }

  finalizePurchase() {
    if (!this.paymentMethod) {
      alert("Por favor, selecione uma forma de pagamento.");
      return;
    }

    const body = {
      paymentMethod: this.paymentMethod,
      type: 'universe',
      country: this.country,
      currencyCode: this.currencyCode,
      id: this.id,
    };

    const sub = this.store.checkoutUniverse(body).subscribe({
      next: (res:any) => {
        if (this.total === 0) {
          alert('Livro gratuito adicionado à sua biblioteca!');
        } else if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        }
      },
      error: (err) => console.error('Erro ao comprar universo:', err),
    });

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
