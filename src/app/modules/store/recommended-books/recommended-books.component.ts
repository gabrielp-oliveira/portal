import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { StoreService, SimplePaper } from '../store.service';
import { paper } from '../../../models/paperTrailTypes';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recommended-books',
  templateUrl: './recommended-books.component.html',
  styleUrls: ['./recommended-books.component.scss']
})
export class RecommendedBooksComponent implements OnInit, OnDestroy, OnChanges {
  @Input() book!: paper;

  recommendedBooks: SimplePaper[] = [];
  private subscription: Subscription | null = null;

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.fetchRecommendations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['book'] && !changes['book'].firstChange) {
      this.fetchRecommendations();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private fetchRecommendations(): void {
    this.subscription?.unsubscribe(); // garante que não fica inscrito múltiplas vezes
    if (this.book && this.book.id && this.book.genre?.length) {
      this.subscription = this.storeService.getBooksByGenreExcludingUniverse({
        currentBookId: this.book.id,
        worldId: this.book.world_id || '',
        genres: this.book.genre
      }).subscribe({
        next: (books) => {
          this.recommendedBooks = books;
        },
        error: (err) => {
          console.error('Erro ao buscar livros recomendados:', err);
        }
      });
    } else {
      this.recommendedBooks = [];
    }
  }

  optimizeImage(url: string): string {
    if (!url) return this.storeService.DEFAULT_COVER;
    return url.includes('/upload/')
      ? url.replace('/upload/', '/upload/w_100,h_150,c_fill,f_auto,q_auto/')
      : url;
  }
}
