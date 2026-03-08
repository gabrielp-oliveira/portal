import { Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { retry, shareReplay } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import {
  DashboardFavoriteAnnotation,
  DashboardFavoriteChapter,
  DashboardHeroResponse,
  DashboardNotStarted,
  DashboardResponse
} from '../../models/paperTrailTypes';

export interface StatCard {
  icon: string;
  value: number | string;
  label: string;
  accent: string;
}

@Injectable()
export class DashboardDataService {
  private static readonly LS_ANN      = 'db-expanded-annotations';
  private static readonly LS_SECTIONS = 'db-collapsed-sections';
  private static readonly LS_HERO     = 'db-hero-cache';

  // ── Notifica o componente OnPush de que o estado mudou ───────────────────
  readonly stateChanged$ = new Subject<void>();

  // ── Data state ───────────────────────────────────────────────────────────
  heroLoading = true;
  heroData: DashboardHeroResponse | null = null;
  loading = true;
  data: DashboardResponse | null = null;
  statCards: StatCard[] = [];

  notStartedByUniverse: Array<{ world: string; books: DashboardNotStarted[] }> = [];

  private favoriteChapterIdsSet    = new Set<string>();
  private annotatedChapterIdsSet   = new Set<string>();
  private worldNameMap             = new Map<string, string>();
  private paperWorldMap            = new Map<string, string>();

  // ── UI state (persisted) ─────────────────────────────────────────────────
  expandedAnnotations = new Set<string>(
    JSON.parse(localStorage.getItem(DashboardDataService.LS_ANN) ?? '[]')
  );
  collapsedSections = new Set<string>(
    JSON.parse(localStorage.getItem(DashboardDataService.LS_SECTIONS) ?? '[]')
  );

  // ── Search state — memoized: computed once per keystroke, not per CD cycle ─
  private _searchQuery = '';
  searchAnnotations: DashboardFavoriteAnnotation[] = [];
  searchChapters:    DashboardFavoriteChapter[]    = [];
  searchHasResults   = false;
  isSearching        = false;

  get searchQuery(): string { return this._searchQuery; }
  set searchQuery(v: string) {
    this._searchQuery = v;
    this.recomputeSearch();
  }

  private recomputeSearch(): void {
    const q = this._searchQuery.trim().toLowerCase();
    this.isSearching = q.length > 0;

    if (!this.data || !this.isSearching) {
      this.searchAnnotations = [];
      this.searchChapters    = [];
      this.searchHasResults  = false;
      return;
    }

    this.searchAnnotations = this.data.favorite_annotations.filter(a =>
      a.span_text.toLowerCase().includes(q) ||
      (a.note?.toLowerCase().includes(q) ?? false) ||
      a.chapter_title.toLowerCase().includes(q) ||
      a.paper_name.toLowerCase().includes(q)
    );
    this.searchChapters = this.data.favorite_chapters.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.paper_name.toLowerCase().includes(q) ||
      (c.description?.toLowerCase().includes(q) ?? false)
    );
    this.searchHasResults = this.searchAnnotations.length > 0 || this.searchChapters.length > 0;
  }

  // Pre-started requests — fired at module init, before ngOnInit
  private readonly _hero$ = this.api.getDashboardHero().pipe(retry(1), shareReplay({ bufferSize: 1, refCount: false }));
  private readonly _dash$ = this.api.getDashboard().pipe(retry(1), shareReplay({ bufferSize: 1, refCount: false }));

  constructor(private api: ApiService, private err: ErrorService) {
    try {
      const cached = localStorage.getItem(DashboardDataService.LS_HERO);
      if (cached) {
        this.heroData    = JSON.parse(cached);
        this.heroLoading = false;
      }
    } catch { /* ignore */ }

    // Trigger HTTP requests immediately (errors handled in load())
    this._hero$.subscribe({ error: () => {} });
    this._dash$.subscribe({ error: () => {} });
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  load(destroyRef: DestroyRef): void {
    // Phase 1: hero — result already in-flight or cached
    this._hero$
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (hero) => {
          this.heroData    = hero;
          this.heroLoading = false;
          try { localStorage.setItem(DashboardDataService.LS_HERO, JSON.stringify(hero)); } catch { /* ignore */ }
          this.stateChanged$.next();
        },
        error: () => {
          this.heroLoading = false;
          this.stateChanged$.next();
        }
      });

    // Phase 2: full dashboard — result already in-flight or cached
    this._dash$
      .pipe(takeUntilDestroyed(destroyRef))
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
          this.worldNameMap = new Map(
            (res.worlds_summary ?? []).map(w => [w.world_id, w.name])
          );
          this.paperWorldMap = new Map(
            (res.recently_read ?? [])
              .filter(r => r.world_name)
              .map(r => [r.paper_id, r.world_name!])
          );
          this.statCards = this.buildStatCards(res);
          this.favoriteChapterIdsSet  = new Set((res.favorite_chapters    ?? []).map(c => c.chapter_id));
          this.annotatedChapterIdsSet = new Set((res.favorite_annotations ?? []).map(a => a.chapter_id).filter(Boolean));
          this.notStartedByUniverse   = this.buildNotStartedByUniverse(res.not_started ?? []);
          this.autoCollapseEmpty();
          this.heroData = {
            continue_reading:   res.continue_reading,
            papers_in_progress: res.papers_in_progress ?? [],
            stats: {
              total_papers:       res.stats.total_papers,
              completed_chapters: res.stats.completed_chapters,
            },
            reading_streak: res.reading_streak,
          };
          this.loading = false;
          // Re-run search in case data arrived after the user typed something
          this.recomputeSearch();
          this.stateChanged$.next();
        },
        error: (e) => {
          this.err.errHandler(e);
          this.loading = false;
          this.stateChanged$.next();
        }
      });
  }

  private buildNotStartedByUniverse(
    books: DashboardNotStarted[]
  ): Array<{ world: string; books: DashboardNotStarted[] }> {
    const map = new Map<string, DashboardNotStarted[]>();
    for (const b of books) {
      const key = b.world_name ?? 'Sem universo';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return Array.from(map.entries()).map(([world, books]) => ({ world, books }));
  }

  private buildStatCards(res: DashboardResponse): StatCard[] {
    const s = res.stats;
    return [
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

  // ── Annotation expand state ───────────────────────────────────────────────
  isAnnotationOpen(id: string): boolean { return this.expandedAnnotations.has(id); }

  toggleAnnotation(id: string): void {
    this.expandedAnnotations.has(id)
      ? this.expandedAnnotations.delete(id)
      : this.expandedAnnotations.add(id);
    localStorage.setItem(DashboardDataService.LS_ANN, JSON.stringify([...this.expandedAnnotations]));
  }

  // ── Auto-collapse empty sections ──────────────────────────────────────────
  private autoCollapseEmpty(): void {
    if (!this.data) return;
    const d = this.data;
    const emptySections: Array<[string, number]> = [
      ['in-progress',       d.papers_in_progress.length + (d.continue_reading ? 1 : 0)],
      ['not-started',       d.not_started.length],
      ['recommended',       d.recommended.length],
      ['recently-updated',  d.recently_updated.length],
      ['completed',         d.recently_completed.length],
      ['recently-read',     d.recently_read.length],
      ['fav-chapters',      d.favorite_chapters.length],
      ['fav-annotations',   d.favorite_annotations.length],
      ['genres',            d.genre_breakdown.length],
      ['wishlist',          d.wishlist_available.length],
    ];
    for (const [id, count] of emptySections) {
      if (count === 0) this.collapsedSections.add(id);
    }
  }

  // ── Section collapse state ────────────────────────────────────────────────
  isSectionCollapsed(id: string): boolean { return this.collapsedSections.has(id); }

  toggleSection(id: string): void {
    this.collapsedSections.has(id)
      ? this.collapsedSections.delete(id)
      : this.collapsedSections.add(id);
    localStorage.setItem(DashboardDataService.LS_SECTIONS, JSON.stringify([...this.collapsedSections]));
  }

  // ── World navigation ──────────────────────────────────────────────────────
  worldRoute(worldId?: string, worldName?: string, paperId?: string): string[] | null {
    const name = worldName
      ?? (worldId ? this.worldNameMap.get(worldId)  : undefined)
      ?? (paperId ? this.paperWorldMap.get(paperId) : undefined);
    return name ? ['/read', name] : null;
  }

  // ── Cross-section helpers (O(1) Set lookups) ─────────────────────────────
  isChapterFavorite(chapterId: string):    boolean { return this.favoriteChapterIdsSet.has(chapterId); }
  hasChapterAnnotation(chapterId: string): boolean { return this.annotatedChapterIdsSet.has(chapterId); }
}
