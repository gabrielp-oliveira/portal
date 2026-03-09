import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-legal-layout',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-page">

      <!-- Hero -->
      <div class="legal-hero" aria-hidden="true">
        <div class="legal-hero__inner">
          <span class="legal-hero__icon">⚖️</span>
          <p class="legal-hero__label">{{ isPt ? 'Informações legais' : 'Legal information' }}</p>
          <p class="legal-hero__sub">{{ isPt ? 'Transparência e clareza nas nossas políticas' : 'Transparency and clarity in our policies' }}</p>
        </div>
      </div>

      <div class="legal-body">
        <!-- Tab nav -->
        <nav class="legal-nav" [attr.aria-label]="isPt ? 'Páginas legais' : 'Legal pages'">
          <a routerLink="/terms"   routerLinkActive="active">
            <span class="legal-nav__dot"></span>
            {{ isPt ? 'Termos de Serviço' : 'Terms of Service' }}
          </a>
          <a routerLink="/privacy" routerLinkActive="active">
            <span class="legal-nav__dot"></span>
            {{ isPt ? 'Privacidade' : 'Privacy Policy' }}
          </a>
          <a routerLink="/refunds" routerLinkActive="active">
            <span class="legal-nav__dot"></span>
            {{ isPt ? 'Reembolsos' : 'Refund Policy' }}
          </a>
        </nav>

        <!-- Content slot -->
        <div class="legal-content">
          <ng-content></ng-content>
        </div>

        <!-- Footer bar -->
        <div class="legal-foot">
          <p *ngIf="!isPt">Questions? Email us at <a href="mailto:legal&#64;papertrail.app">legal&#64;papertrail.app</a></p>
          <p *ngIf="isPt">Dúvidas? Envie um e-mail para <a href="mailto:legal&#64;papertrail.app">legal&#64;papertrail.app</a></p>
          <a [href]="backUrl" class="legal-foot__back">{{ backLabel }}</a>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      --bg:      #F4F4F0;
      --surface: #FFFFFF;
      --border:  #E5E3DC;
      --text:    #1C1917;
      --text2:   #78716C;
      --accent:  #B8732A;
      display: block;
      background: var(--bg);
      min-height: 100vh;
    }
    :host-context(.dark-theme) {
      --bg:      #111110;
      --surface: #1C1B1A;
      --border:  #2E2C2A;
      --text:    #F5F4F0;
      --text2:   #A8A29E;
      --accent:  #F0A830;
    }

    /* Hero */
    .legal-hero {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 48px 20px 36px;
      text-align: center;
    }
    .legal-hero__inner {
      max-width: 760px;
      margin: 0 auto;
    }
    .legal-hero__icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 12px;
    }
    .legal-hero__label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: var(--accent);
      margin: 0 0 8px;
    }
    .legal-hero__sub {
      font-size: 1rem;
      color: var(--text2);
      margin: 0;
    }

    /* Body */
    .legal-body {
      max-width: 760px;
      margin: 0 auto;
      padding: 32px 20px 80px;
    }

    /* Tab nav */
    .legal-nav {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 36px;

      a {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 7px 18px;
        border-radius: 24px;
        font-size: 0.83rem;
        font-weight: 500;
        color: var(--text2);
        text-decoration: none;
        background: var(--surface);
        border: 1px solid var(--border);
        transition: color .15s, border-color .15s, background .15s;

        &:hover { color: var(--accent); border-color: var(--accent); }
        &.active {
          color: var(--accent);
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 8%, transparent);
          font-weight: 600;
        }
      }
    }
    .legal-nav__dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
      opacity: .5;

      .active & { opacity: 1; }
    }

    /* Content */
    .legal-content { min-height: 400px; }

    /* Footer bar */
    .legal-foot {
      margin-top: 56px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;

      p {
        font-size: 0.82rem;
        color: var(--text2);
        margin: 0;
        a {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
      }
    }
    .legal-foot__back {
      font-size: 0.82rem;
      color: var(--text2);
      text-decoration: none;
      font-weight: 500;
      transition: color .15s;
      &:hover { color: var(--accent); }
    }
  `]
})
export class LegalLayoutComponent {
  isPt = navigator.language.startsWith('pt');

  /** If the user opened this tab from a checkout page, send them back there. */
  readonly backUrl:   string;
  readonly backLabel: string;

  constructor() {
    const ref = document.referrer;
    const isCheckout = ref.includes('/checkout');
    const isUniverse = ref.includes('/universe/');

    if (isCheckout) {
      // Extract the path from the referrer URL so we can use it as an href
      try {
        this.backUrl = new URL(ref).pathname;
      } catch {
        this.backUrl = '/store';
      }
      if (this.isPt) {
        this.backLabel = isUniverse ? '← Voltar ao checkout do universo' : '← Voltar ao checkout';
      } else {
        this.backLabel = isUniverse ? '← Back to universe checkout' : '← Back to checkout';
      }
    } else {
      this.backUrl   = '/store';
      this.backLabel = this.isPt ? '← Voltar à loja' : '← Back to Store';
    }
  }
}
