import { Component, OnInit, OnDestroy, NgZone, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { fromEvent, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-back-to-top',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="back-to-top"
      *ngIf="visible"
      (click)="scrollToTop()"
      aria-label="Back to top">
      <mat-icon aria-hidden="true">arrow_upward</mat-icon>
    </button>
  `,
  styles: [`
    .back-to-top {
      position: fixed;
      bottom: 24px;
      right: 20px;
      z-index: 200;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: #B8732A;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,.22);
      transition: opacity .2s, transform .2s;
      animation: bttFadeIn .2s ease;

      mat-icon { font-size: 20px; width: 20px; height: 20px; }

      &:hover  { opacity: .88; transform: translateY(-2px); }
      &:active { transform: translateY(0); }
      &:focus-visible { outline: 2px solid #B8732A; outline-offset: 3px; }
    }

    @keyframes bttFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class BackToTopComponent implements OnInit, OnDestroy {
  visible = false;
  private sub: Subscription | null = null;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.sub = fromEvent(window, 'scroll', { passive: true })
        .pipe(throttleTime(100))
        .subscribe(() => {
          const next = window.scrollY > 300;
          if (next !== this.visible) {
            this.ngZone.run(() => { this.visible = next; this.cdr.markForCheck(); });
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
