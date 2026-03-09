import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { RecommendedBook } from '../store.service';

@Component({
  standalone: false,
  selector: 'app-books-by-author',
  templateUrl: './books-by-author.component.html',
  styleUrls: ['./books-by-author.component.scss']
})
export class BooksByAuthorComponent {
  @Input() books: RecommendedBook[] = [];
  @Input() heading = 'More by this author';

  readonly DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/defaultCover_lublod';

  constructor(private router: Router) {}

  goTo(id: string): void { this.router.navigate(['/store/book', id]); }

  formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
  }
}
