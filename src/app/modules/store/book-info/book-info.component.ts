import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FullPaper, StoreService } from '../store.service';
import { AuthService } from '../../../auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-book-info',
  templateUrl: './book-info.component.html',
  styleUrls: ['./book-info.component.scss']
})
export class BookInfoComponent implements OnInit, OnDestroy {
  @Input() book: FullPaper;
  @Input() worldDescription: string;
  @Input() PaperCount: number;
  @Input() isPurchased: boolean;
  @Input() isInWishlist: boolean;

  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';
  showFullBookDesc = false;
  showFullUniverseDesc = false;

  isLogged = false;
  private destroy$ = new Subject<void>();

  constructor(private store: StoreService, private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.isLogged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isLogged = status;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  optimizeImage(url: string, width: number = 300): string {
    return url?.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }

  toggleWishlist() {
    const paperId = this.book.id;
    if (!paperId) return;

    if (this.isInWishlist) {
      this.store.removeFromWishlist(paperId).subscribe({
        next: () => this.isInWishlist = false,
        error: err => console.error('Erro ao remover da wishlist:', err)
      });
    } else {
      this.store.addToWishlist(paperId).subscribe({
        next: () => this.isInWishlist = true,
        error: err => console.error('Erro ao adicionar à wishlist:', err)
      });
    }
  }
}
