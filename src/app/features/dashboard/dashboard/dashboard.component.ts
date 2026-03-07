import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
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

  constructor(
    private auth: AuthService,
    public theme: ThemeService,
    public ds: DashboardDataService,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Painel de leitura | Portal');

    this.theme.isDark$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(dark => { this.isDark = dark; });

    this.ds.load(this.destroyRef);
  }

  // ── Template helpers (pure, stateless) ───────────────────────────────────
  progress(completed: number, total: number): number {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  }

  timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  }

  logOut(): void {
    this.auth.logOut();
  }
}
