import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../core/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ErrorService } from '../../../core/error.service';
import { DialogService } from '../../../dialog/dialog.service';
import { ThemeService } from '../../../core/theme.service';
import { DashboardResponse } from '../../../models/paperTrailTypes';

interface StatCard {
  icon: string;
  value: number | string;
  label: string;
  accent: string;
}

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  private destroyRef = inject(DestroyRef);

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorService,
    private dialog: DialogService,
    public theme: ThemeService,
  ) { }

  loading = true;
  isDark = this.theme.isDark;
  data: DashboardResponse | null = null;
  statCards: StatCard[] = [];

  private static readonly LS_ANN      = 'db-expanded-annotations';
  private static readonly LS_SECTIONS = 'db-collapsed-sections';

  expandedAnnotations = new Set<string>(
    JSON.parse(localStorage.getItem(DashboardComponent.LS_ANN) ?? '[]')
  );
  collapsedSections = new Set<string>(
    JSON.parse(localStorage.getItem(DashboardComponent.LS_SECTIONS) ?? '[]')
  );

  isAnnotationOpen(id: string): boolean    { return this.expandedAnnotations.has(id); }
  isSectionCollapsed(id: string): boolean  { return this.collapsedSections.has(id); }

  toggleAnnotation(id: string): void {
    this.expandedAnnotations.has(id)
      ? this.expandedAnnotations.delete(id)
      : this.expandedAnnotations.add(id);
    localStorage.setItem(DashboardComponent.LS_ANN, JSON.stringify([...this.expandedAnnotations]));
  }

  toggleSection(id: string, event: Event): void {
    event.stopPropagation();
    this.collapsedSections.has(id)
      ? this.collapsedSections.delete(id)
      : this.collapsedSections.add(id);
    localStorage.setItem(DashboardComponent.LS_SECTIONS, JSON.stringify([...this.collapsedSections]));
  }

  ngOnInit() {
    this.theme.isDark$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(dark => { this.isDark = dark; });

    this.api.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.data = {
            ...res,
            recently_read:        res.recently_read        ?? [],
            papers_in_progress:   res.papers_in_progress   ?? [],
            recently_completed:   res.recently_completed   ?? [],
            not_started:          res.not_started          ?? [],
            recently_updated:     res.recently_updated     ?? [],
            favorite_chapters:    res.favorite_chapters    ?? [],
            favorite_annotations: res.favorite_annotations ?? [],
            worlds_summary:       res.worlds_summary       ?? [],
            wishlist_available:   res.wishlist_available   ?? [],
            recommended:          res.recommended          ?? [],
            genre_breakdown:      res.genre_breakdown      ?? [],
          };
          this.buildStatCards(res);
          this.loading = false;
        },
        error: (e) => {
          this.err.errHandler(e);
          this.loading = false;
        }
      });
  }

  private buildStatCards(res: DashboardResponse) {
    const s = res.stats;
    this.statCards = [
      { icon: 'public',        value: s.total_worlds,       label: 'Mundos',           accent: '#264653' },
      { icon: 'menu_book',     value: s.total_papers,       label: 'Livros',           accent: '#2A9D8F' },
      { icon: 'article',       value: s.total_chapters,     label: 'Capítulos',        accent: '#264653' },
      { icon: 'check_circle',  value: s.completed_chapters, label: 'Concluídos',       accent: '#2A9D8F' },
      { icon: 'favorite',      value: s.favorite_chapters,  label: 'Favoritos',        accent: '#E76F51' },
      { icon: 'sticky_note_2', value: s.total_annotations,  label: 'Anotações',        accent: '#E9C46A' },
      { icon: 'auto_stories',  value: s.pages_read,         label: 'Páginas lidas',    accent: '#F4A261' },
      { icon: 'description',   value: s.total_pages,        label: 'Total de páginas', accent: '#264653' },
    ];
  }

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

  isChapterFavorite(chapterId: string): boolean {
    return this.data?.favorite_chapters.some(c => c.chapter_id === chapterId) ?? false;
  }

  hasChapterAnnotation(chapterId: string): boolean {
    return this.data?.favorite_annotations.some(a => a.chapter_id === chapterId) ?? false;
  }

  openCreateWorldDialog() {
    this.dialog.openCreateWorldDialog('150ms', '150ms');
  }

  logOut() {
    this.auth.logOut();
  }
}
