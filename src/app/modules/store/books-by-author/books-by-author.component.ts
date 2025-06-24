import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { SimplePaper, StoreService } from '../store.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-books-by-author',
  templateUrl: './books-by-author.component.html',
  styleUrls: ['./books-by-author.component.scss']
})
export class BooksByAuthorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() authorId: string = '';
  @Input() excludeBookId: string = ''; // ← caso você use para filtrar o mesmo livro
  books: SimplePaper[] = [];

  private subscription: Subscription | null = null;

  constructor(private storeService: StoreService, private router: Router) { }

  ngOnInit() {
    this.loadBooks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['authorId'] && !changes['authorId'].firstChange) {
      this.loadBooks(); // recarrega quando muda o autor
    }
  }

  loadBooks(): void {
    if (this.subscription) this.subscription.unsubscribe();

    if (this.authorId) {
      this.subscription = this.storeService.getBooksByAuthor(this.authorId)
        .subscribe(data => {
          this.books = this.excludeBookId
            ? data.filter(book => book.id !== this.excludeBookId)
            : data;
        });
    }
  }

  optimizeImage(url: string): string {
    if (!url) return this.storeService.DEFAULT_COVER;

    return url.includes('/upload/')
      ? url.replace('/upload/', '/upload/w_100,h_150,c_fill,f_auto,q_auto/')
      : url;
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }

  goToBookPage(id: string) {
    window.location.href = `/store/book/${id}`;
  }


}
