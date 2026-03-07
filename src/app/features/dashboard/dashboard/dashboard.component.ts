import { Component, DestroyRef, inject, NgZone, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/theme.service';
import { DashboardDataService } from '../dashboard.data.service';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  isDark = this.theme.isDark;
  statsCollapsed = true;
  showBackToTop = false;

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  constructor(
    private auth: AuthService,
    public theme: ThemeService,
    public ds: DashboardDataService,
    private titleService: Title,
    private meta: Meta,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Painel de leitura | Portal');
    this.meta.updateTag({ name: 'description', content: 'Acompanhe seu progresso de leitura, livros em andamento, capítulos favoritos e estatísticas no painel do Portal.' });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    this.theme.isDark$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(dark => { this.isDark = dark; });

    // Scroll listener fora da zona do Angular — não dispara CD a cada evento;
    // só entra na zona quando o valor de showBackToTop realmente muda.
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll', { passive: true })
        .pipe(throttleTime(150), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const next = window.scrollY > 300;
          if (next !== this.showBackToTop) {
            this.ngZone.run(() => { this.showBackToTop = next; });
          }
        });
    });

    this.ds.load(this.destroyRef);
  }

  logOut(): void {
    this.auth.logOut();
  }
}
