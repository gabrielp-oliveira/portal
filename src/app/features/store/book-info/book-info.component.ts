import { Component, EventEmitter, Input, OnInit, DestroyRef, inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FullPaper, RatingResponse, StoreService } from '../store.service';
import { AuthService } from '../../../core/auth/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-book-info',
  templateUrl: './book-info.component.html',
  styleUrls: ['./book-info.component.scss']
})
export class BookInfoComponent implements OnInit {
  @Input() book!: FullPaper;
  @Input() PaperCount!: number;
  @Input() isPurchased!: boolean;
  @Input() isInWishlist!: boolean;

  @Input() ratingAvg:  number | null = null;
  @Input() ratingCount = 0;
  @Input() userRating: number | null = null;

  @Output() ratingChange = new EventEmitter<RatingResponse>();

  readonly DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/defaultCover_lublod';
  readonly STARS = [1, 2, 3, 4, 5];

  isLogged        = false;
  wishlistLoading = false;
  ratingLoading   = false;
  hoverRating     = 0;

  private destroyRef = inject(DestroyRef);

  constructor(private store: StoreService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.isLogged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(status => this.isLogged = status);
  }

  get maturityLabel(): string {
    switch (this.book?.maturity) {
      case 'MATURE':     return '18+';
      case 'NOT_MATURE': return 'All ages';
      case 'TEEN':       return 'Teen';
      default:           return 'Unrated';
    }
  }

  // ── Stars ──────────────────────────────────────────────────────────────────
  starIcon(pos: number): string {
    const val = this.hoverRating || this.userRating || this.ratingAvg || 0;
    if (pos <= Math.floor(val)) return 'star';
    if (pos === Math.ceil(val) && val % 1 >= 0.5) return 'star_half';
    return 'star_border';
  }

  rate(stars: number): void {
    if (!this.isLogged || this.ratingLoading) return;
    if (stars === this.userRating) { this.removeRating(); return; }

    this.ratingLoading = true;
    this.store.rateBook(this.book.id, stars).subscribe({
      next: (res) => {
        this.userRating  = res.userRating;
        this.ratingAvg   = res.ratingAvg;
        this.ratingCount = res.ratingCount;
        this.ratingLoading = false;
        this.ratingChange.emit(res);
      },
      error: () => { this.ratingLoading = false; }
    });
  }

  private removeRating(): void {
    this.ratingLoading = true;
    this.store.deleteRating(this.book.id).subscribe({
      next: (res) => {
        this.userRating  = null;
        this.ratingAvg   = res.ratingAvg;
        this.ratingCount = res.ratingCount;
        this.ratingLoading = false;
        this.ratingChange.emit(res);
      },
      error: () => { this.ratingLoading = false; }
    });
  }

  goToLogin(): void {
    localStorage.setItem('auth-redirect', this.router.url);
    this.router.navigate(['/login']);
  }

  // ── Wishlist / Favorite ───────────────────────────────────────────────────
  get wishlistLabel(): string {
    if (this.isPurchased) return this.isInWishlist ? 'Favorited' : 'Favorite';
    return this.isInWishlist ? 'Saved' : 'Save';
  }

  toggleWishlist(): void {
    if (!this.book?.id || this.wishlistLoading) return;

    const prev = this.isInWishlist;
    this.isInWishlist    = !prev;
    this.wishlistLoading = true;

    this.store.toggleWishlist(this.book.id).subscribe({
      next:  (res) => { this.isInWishlist = res.is_in_wishlist; this.wishlistLoading = false; },
      error: ()    => { this.isInWishlist = prev;               this.wishlistLoading = false; }
    });
  }
}
