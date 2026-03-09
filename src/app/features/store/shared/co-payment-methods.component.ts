import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'co-payment-methods',
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="co__section-label">
      <mat-icon aria-hidden="true">payment</mat-icon>
      Payment method
    </div>

    <!-- BRL -->
    <div class="co__methods" role="radiogroup" aria-label="Payment method" *ngIf="currencyCode === 'BRL'">
      <label class="co__method" [class.co__method--selected]="value === 'pix'">
        <input type="radio" name="co-method" value="pix"
          [ngModel]="value" (ngModelChange)="valueChange.emit($event)" class="sr-only" />
        <span class="co__method-icon--pix" aria-hidden="true"></span>
        <span class="co__method-name">PIX</span>
        <span class="co__method-tag">Instant</span>
      </label>
      <label class="co__method" [class.co__method--selected]="value === 'credit_card'">
        <input type="radio" name="co-method" value="credit_card"
          [ngModel]="value" (ngModelChange)="valueChange.emit($event)" class="sr-only" />
        <mat-icon class="co__method-mat-icon" aria-hidden="true">credit_card</mat-icon>
        <span class="co__method-name">Credit card</span>
      </label>
      <label class="co__method" [class.co__method--selected]="value === 'boleto'">
        <input type="radio" name="co-method" value="boleto"
          [ngModel]="value" (ngModelChange)="valueChange.emit($event)" class="sr-only" />
        <mat-icon class="co__method-mat-icon" aria-hidden="true">receipt_long</mat-icon>
        <span class="co__method-name">Boleto bancário</span>
        <span class="co__method-tag">1-3 days</span>
      </label>
    </div>

    <!-- USD / International -->
    <div class="co__methods" role="radiogroup" aria-label="Payment method" *ngIf="currencyCode === 'USD'">
      <label class="co__method" [class.co__method--selected]="value === 'credit_card'">
        <input type="radio" name="co-method" value="credit_card"
          [ngModel]="value" (ngModelChange)="valueChange.emit($event)" class="sr-only" />
        <mat-icon class="co__method-mat-icon" aria-hidden="true">credit_card</mat-icon>
        <span class="co__method-name">Credit card</span>
        <span class="co__method-tag">Stripe</span>
      </label>
      <label class="co__method" [class.co__method--selected]="value === 'paypal'">
        <input type="radio" name="co-method" value="paypal"
          [ngModel]="value" (ngModelChange)="valueChange.emit($event)" class="sr-only" />
        <mat-icon class="co__method-mat-icon" aria-hidden="true">account_balance_wallet</mat-icon>
        <span class="co__method-name">PayPal</span>
      </label>
    </div>
  `,
  styles: [`
    .co__section-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: var(--text2, #78716C);
      mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }
    }

    .co__methods {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .co__method {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border: 1.5px solid var(--border, #E5E3DC);
      border-radius: 12px;
      cursor: pointer;
      transition: border-color .15s, background .15s;
      user-select: none;

      &:hover { border-color: var(--accent, #B8732A); background: var(--surface2, #F0EFEB); }
      &--selected {
        border-color: var(--accent, #B8732A);
        background: var(--surface2, #F0EFEB);
        .co__method-name { color: var(--text, #1C1917); font-weight: 600; }
      }
    }

    .co__method-mat-icon {
      font-size: 1.25rem; width: 1.25rem; height: 1.25rem;
      color: var(--text2, #78716C);
    }

    .co__method-icon--pix {
      width: 20px; height: 20px;
      background: #32BCAD;
      border-radius: 4px;
      flex-shrink: 0;
      position: relative;
      &::before {
        content: 'P';
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.7rem; font-weight: 900; color: #fff; font-family: monospace;
      }
    }

    .co__method-name { flex: 1; font-size: 0.9rem; color: var(--text, #1C1917); }

    .co__method-tag {
      font-size: 0.68rem; font-weight: 600;
      padding: 2px 7px; border-radius: 10px;
      background: var(--surface2, #F0EFEB);
      border: 1px solid var(--border, #E5E3DC);
      color: var(--text2, #78716C);
    }

    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
  `]
})
export class CoPaymentMethodsComponent {
  @Input() currencyCode = 'USD';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
}
