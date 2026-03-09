import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'co-consent',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <label class="co__consent" [class.co__consent--required]="required">
      <input type="checkbox"
        [ngModel]="value"
        (ngModelChange)="valueChange.emit($event)"
        [attr.aria-required]="true"
        [attr.aria-invalid]="required" />
      <span *ngIf="!isPt">
        I agree to the <a routerLink="/terms" target="_blank">Terms of Service</a>,
        <a routerLink="/privacy" target="_blank">Privacy Policy</a>, and
        <a routerLink="/refunds" target="_blank">Refund Policy</a>.
        I understand that digital purchases are non-refundable once access is granted.
      </span>
      <span *ngIf="isPt">
        Concordo com os <a routerLink="/terms" target="_blank">Termos de Serviço</a>,
        a <a routerLink="/privacy" target="_blank">Política de Privacidade</a> e a
        <a routerLink="/refunds" target="_blank">Política de Reembolso</a>.
        Entendo que compras de conteúdo digital não são reembolsáveis após a concessão de acesso.
      </span>
    </label>
  `,
  styles: [`
    .co__consent {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.8rem;
      color: var(--text2, #78716C);
      line-height: 1.5;
      cursor: pointer;

      input[type="checkbox"] {
        margin-top: 3px;
        flex-shrink: 0;
        width: 16px; height: 16px;
        accent-color: var(--accent, #B8732A);
        cursor: pointer;
      }

      a {
        color: var(--accent, #B8732A);
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      &--required {
        color: var(--danger, #DC2626);
        a { color: var(--danger, #DC2626); }
      }
    }
  `]
})
export class CoConsentComponent {
  @Input() isPt   = false;
  @Input() value   = false;
  @Input() required = false;
  @Output() valueChange = new EventEmitter<boolean>();
}
