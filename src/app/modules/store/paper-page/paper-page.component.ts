import { Component, OnInit } from '@angular/core';
import { StoreService } from '../store.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-paper-page',
  templateUrl: './paper-page.component.html',
  styleUrls: ['./paper-page.component.scss'], // Corrigido
})
export class PaperPageComponent implements OnInit {
  paper$ = this.store.storePaper$;

  PaperCount!: number;
  worldDescription!: string;
  recommendedBooks: any;
  isPurchased: boolean = false;

  country: string = 'US';
  currencyCode: string = 'USD';

  constructor(
    private store: StoreService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const paperId = this.route.snapshot.paramMap.get('paperId');
    if (!paperId) return;

    // 1. Detecta país
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
        // 2. Busca livro só depois de saber o país
        this.store.getPaperById(paperId, this.currencyCode, this.country)
          .subscribe((paper) => {
            this.store.setStorePaper(paper.paper);
            this.PaperCount = paper.PaperCount;
            this.worldDescription = paper.worldDescription;
            this.isPurchased = paper.isPurchased;
          });
      });
  }
}
