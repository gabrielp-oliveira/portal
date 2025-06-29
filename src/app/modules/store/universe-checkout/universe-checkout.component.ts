import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService, FullPaper } from '../store.service';
import { paper } from '../../../models/paperTrailTypes';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-universe-checkout',
  templateUrl: './universe-checkout.component.html',
  styleUrls: ['./universe-checkout.component.scss']
})
export class UniverseCheckoutComponent implements OnInit, OnDestroy {
  type: 'book' | 'universe';
  id: string;

  collectionName = '';
  book: paper | null = null;
  books: paper[] = [];

  paymentMethod: string = '';
  total = 0;
  country = 'BR';
  currencyCode = 'BRL';
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private store: StoreService
  ) { }

  ngOnInit(): void {
    const paperId = this.route.snapshot.paramMap.get('paperId');
    const universeId = this.route.snapshot.paramMap.get('id');

    // 🔍 Detecta o país
    fetch('https://ipapi.co/json')
      .then(res => res.json())
      .then(data => {
        this.country = data.country === 'BR' ? 'BR' : 'US';
        this.currencyCode = this.country === 'BR' ? 'BRL' : 'USD';
      })
      .catch(() => {
        this.country = 'US';
        this.currencyCode = 'USD';
      });

    // 📚 Carrega o conteúdo da compra
    if (paperId) {
      this.type = 'book';
      this.id = paperId;

      const sub = this.store.getPaperById(paperId).subscribe((res) => {
        this.book = res.paper;
        this.collectionName = res.paper.name;
        this.total = res.paper.price ;
      });
      this.subscriptions.push(sub);
    } else if (universeId) {
      this.type = 'universe';
      this.id = universeId;

      const sub = this.store.getUniverseById(universeId).subscribe(universe => {
        this.collectionName = universe.name;
        this.books = universe.papers || [];
        this.total = this.books.length * 9.99;
      });
      this.subscriptions.push(sub);
    }
  }

  finalizePurchase() {
    if (!this.paymentMethod) {
      alert("Por favor, selecione uma forma de pagamento.");
      return;
    }

    const body = {
      paymentMethod: this.paymentMethod,
      type: this.type,
      country: this.country,
      currencyCode: this.currencyCode,
      id: this.id,
    };

    let sub: Subscription;

    if (this.type === 'book') {
      sub = this.store.checkoutBook(body).subscribe({
        next: (res) => {
          console.log('Livro comprado:', res);
        },
        error: (err) => {
          console.error('Erro ao comprar livro:', err);
        }
      });
    } else {
      sub = this.store.checkoutUniverse(body).subscribe({
        next: (res) => {
          console.log('Universo comprado:', res);
        },
        error: (err) => {
          console.error('Erro ao comprar universo:', err);
        }
      });
    }

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
