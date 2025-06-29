import { Component } from '@angular/core';
import { paper } from '../../../models/paperTrailTypes';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../store.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-checkout',
  templateUrl: './book-checkout.component.html',
  styleUrl: './book-checkout.component.scss'
})
export class BookCheckoutComponent {
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
        console.log(res)
        this.book = res.paper;
        this.collectionName = res.paper.name;
        this.total = res.paper.price;
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

        sub = this.store.checkoutBook(body).subscribe({
      next: (res: any) => {
        if (res.price === 0) {
          // Livro gratuito já foi adicionado
          alert('Livro gratuito adicionado à sua biblioteca!')
        } else if (res.checkoutUrl) {
          // Redireciona para o Stripe
          window.location.href = res.checkoutUrl;
        }
      },
      error: (err) => {
        const msg = err?.error?.error || 'Erro ao iniciar o checkout.';
        console.error(msg)
      }
    });

    this.subscriptions.push(sub);

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
