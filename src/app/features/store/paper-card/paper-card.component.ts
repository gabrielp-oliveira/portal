import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { paper } from '../../../models/paperTrailTypes';
import { Router } from '@angular/router';
import { StoreService } from '../store.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-paper-card',
  templateUrl: './paper-card.component.html',
  styleUrl: './paper-card.component.scss'
})
export class PaperCardComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private storeService: StoreService,
    private authService: AuthService
  ) { }

  @Input() book: paper;

  readonly DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/defaultCover_lublod';

  isInWishlist = false;
  isLogged = false;
  wishlistLoading = false;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.isInWishlist = !!this.book?.is_in_wishlist;
    this.authService.isLogged$.pipe(takeUntil(this.destroy$)).subscribe(logged => {
      this.isLogged = logged;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToBookPage(): void {
    this.router.navigate(['/store/book', this.book.id]);
  }

  formatPrice(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    if (!this.isLogged || this.wishlistLoading) return;

    const prev = this.isInWishlist;
    this.isInWishlist    = !prev; // optimistic update
    this.wishlistLoading = true;

    this.storeService.toggleWishlist(this.book.id).subscribe({
      next: (res) => {
        this.isInWishlist    = res.is_in_wishlist;
        this.wishlistLoading = false;
      },
      error: () => {
        this.isInWishlist    = prev; // rollback
        this.wishlistLoading = false;
      }
    });
  }
}
