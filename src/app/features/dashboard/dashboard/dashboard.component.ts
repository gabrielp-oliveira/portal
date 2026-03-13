import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/theme.service';
import { DashboardDataService } from '../dashboard.data.service';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  isDark        = this.theme.isDark;
  statsCollapsed = true;

  constructor(
    private auth:         AuthService,
    public  theme:        ThemeService,
    public  ds:           DashboardDataService,
    private titleService: Title,
    private meta:         Meta,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Painel de leitura | Portal');
    this.meta.updateTag({ name: 'description', content: 'Acompanhe seu progresso de leitura, livros em andamento, capítulos favoritos e estatísticas no painel do Portal.' });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    // Tema
    this.theme.isDark$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(dark => { this.isDark = dark; this.cdr.markForCheck(); });

    // Notificações do serviço de dados → força re-check no componente OnPush
    this.ds.stateChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());

    this.ds.load(this.destroyRef);
  }

  retry(): void { this.ds.retryLoad(this.destroyRef); }

  logOut(): void { this.auth.logOut(); }

  trackById(_: number, item: { id: string }):           string { return item.id; }
  trackByPaperId(_: number, item: { paper_id: string }): string { return item.paper_id; }
  trackByChapterId(_: number, item: { chapter_id: string }): string { return item.chapter_id; }
  trackByGenre(_: number, item: { genre: string }):     string { return item.genre; }
  trackByWorld(_: number, group: { world: string }):    string { return group.world; }
}
