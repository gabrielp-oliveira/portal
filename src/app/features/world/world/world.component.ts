import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/api.service';
import {
  world, paper, Timeline, StoryLine, Chapter, ChapterConfiguration,
  Event as WorldEvent
} from '../../../models/paperTrailTypes';

export type WorldTab = 'overview' | 'books' | 'chapters' | 'structure' | 'events';

export interface PaperStats {
  paper:     paper;
  chapters:  Chapter[];
  total:     number;
  completed: number;
  favorites: number;
  pct:       number;
}

@Component({
  standalone: false,
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss']
})
export class WorldComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  world:   world | null = null;
  configs: ChapterConfiguration[] = [];

  loading = true;
  error   = false;

  activeTab: WorldTab = 'overview';
  isScrolled    = false;
  showBackToTop = false;

  readonly SKELETON_CARDS = Array(6);
  readonly DEFAULT_COVER  =
    'https://res.cloudinary.com/dyibidxxv/image/upload/defaultCover_lublod';

  @HostListener('window:scroll')
  onScroll(): void {
    const y = window.scrollY;
    this.isScrolled    = y > 8;
    this.showBackToTop = y > 400;
  }

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private api:    ApiService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(p => {
      const id = p.get('id');
      if (id) this.load(id);
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Data ──────────────────────────────────────────────────────────────────

  private load(id: string): void {
    this.loading = true;
    this.error   = false;
    forkJoin({
      world:   this.api.getWorldData(id),
      configs: this.api.getAllChapterConfigurations()
                       .pipe(catchError(() => of([] as ChapterConfiguration[])))
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ world, configs }) => {
        this.world   = world;
        this.configs = configs.filter(c => c.world_id === world.id);
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  // ── World-level computed ────────────────────────────────────────────────────

  get totalChapters():  number { return this.world?.chapters.length  ?? 0; }
  get totalTimelines(): number { return this.world?.timelines.length ?? 0; }
  get totalStorylines():number { return this.world?.storyLines.length ?? 0; }
  get totalEvents():    number { return this.world?.events.length    ?? 0; }
  get totalConnections():number{ return this.world?.connections.length ?? 0; }

  get completedCount(): number { return this.configs.filter(c => c.completed).length; }
  get favoriteCount():  number { return this.configs.filter(c => c.favorite).length; }

  get readingPct(): number {
    return this.totalChapters
      ? Math.round((this.completedCount / this.totalChapters) * 100)
      : 0;
  }

  get backdropUrl(): string {
    return this.world?.CoverURLs?.[0]
        ?? this.world?.papers?.[0]?.cover_url
        ?? '';
  }

  // ── Per-paper stats ─────────────────────────────────────────────────────────

  get paperStats(): PaperStats[] {
    if (!this.world) return [];
    return this.world.papers.map(p => {
      const chs  = this.world!.chapters.filter(c => c.paper_id === p.id);
      const cfgs = this.configs.filter(c => c.paper_id === p.id);
      const done = cfgs.filter(c => c.completed).length;
      const favs = cfgs.filter(c => c.favorite).length;
      return {
        paper:     p,
        chapters:  chs,
        total:     chs.length,
        completed: done,
        favorites: favs,
        pct:       chs.length ? Math.round((done / chs.length) * 100) : 0
      };
    });
  }

  // ── Chapter helpers ─────────────────────────────────────────────────────────

  isCompleted(chId: string): boolean {
    return this.configs.some(c => c.chapter_id === chId && c.completed);
  }
  isFavorite(chId: string): boolean {
    return this.configs.some(c => c.chapter_id === chId && c.favorite);
  }

  // ── Timeline / Storyline helpers ────────────────────────────────────────────

  chaptersForTimeline(tl: Timeline): Chapter[] {
    return this.world?.chapters.filter(c => c.timeline_id === tl.id) ?? [];
  }
  chaptersForStoryline(sl: StoryLine): Chapter[] {
    return this.world?.chapters.filter(c => c.storyline_id === sl.id) ?? [];
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  setTab(tab: WorldTab): void { this.activeTab = tab; }
  scrollToTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  // ── TrackBy ─────────────────────────────────────────────────────────────────

  trackByPaper   (_: number, s: PaperStats):   string { return s.paper.id; }
  trackByChapter (_: number, c: Chapter):      string { return c.id; }
  trackByTimeline(_: number, t: Timeline):     string { return t.id; }
  trackByStoryline(_: number, s: StoryLine):   string { return s.id; }
  trackByEvent   (_: number, e: WorldEvent):   string { return e.id; }
}
