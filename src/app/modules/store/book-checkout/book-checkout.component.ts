import { Component, OnInit, OnDestroy } from '@angular/core';
import { paper } from '../../../models/paperTrailTypes';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../store.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-checkout',
  templateUrl: './book-checkout.component.html',
  styleUrls: ['./book-checkout.component.scss']
})
export class BookCheckoutComponent implements OnInit, OnDestroy {
  type: 'book' | 'universe';
  id: string;

  collectionName = '';
  book: paper;

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

    if (!paperId) return;

    this.type = 'book';
    this.id = paperId;

    // 🔍 Detecta o país e só depois carrega o paper
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
        const sub = this.store.getPaperById(paperId, this.currencyCode, this.country).subscribe((res) => {
          this.book = res.paper;
          this.collectionName = res.paper.name;
          this.total = res.paper.price;
        });
        this.subscriptions.push(sub);
      });
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

    const sub = this.store.checkoutBook(body).subscribe({
      next: (res: any) => {
        if (res.price === 0) {
          alert('Livro gratuito adicionado à sua biblioteca!');
        } else if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        }
      },
      error: (err) => {
        const msg = err?.error?.error || 'Erro ao iniciar o checkout.';
        console.error(msg);
      }
    });

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
