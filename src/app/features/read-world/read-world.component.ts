import { Component, OnInit, OnDestroy, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { throttleTime, map, distinctUntilChanged } from 'rxjs/operators';
import { Title, Meta } from '@angular/platform-browser';
import { WorldDataService } from '../dashboard/world-data.service';
import { paper, paperCard, chapterDetailsModal, Chapter, WorldHeroResponse, HeroPaper, DetailsItem, FavoriteItem, PaginatedMeta } from '../../models/paperTrailTypes';
import { ApiService } from '../../core/api.service';
import { ChapterDetailsComponent } from './dialog/chapter-details/chapter-details.component';
import { MatDialog } from '@angular/material/dialog';
import { BoardChapterClickEvent, BoardGroupClickEvent } from './sections/rw-board/rw-board.component';
import { GroupMenuItem } from './sections/rw-group-menu/rw-group-menu.component';

type ChapterMenu = { x: number; y: number; chapterId: string };
type GroupMenu   = { x: number; y: number; ids: string[] };

@Component({
  standalone: false,
  selector: 'app-read-world',
  templateUrl: './read-world.component.html',
  styleUrls: ['./read-world.component.scss'],
})
export class ReadWorldComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);
  private doc        = inject(DOCUMENT) as Document;

  // ── Phase state ──────────────────────────────────────────────────────────────
  heroData: WorldHeroResponse | null = null;
  phaseHeroLoaded  = false;
  phaseBoardLoaded = false;

  detailsItems:    DetailsItem[]   = [];
  detailsMeta:     PaginatedMeta | null = null;
  detailsLoading   = false;
  detailsLoaded    = false;

  favoriteItems:   FavoriteItem[]  = [];
  favoritesMeta:   PaginatedMeta | null = null;
  favoritesLoading = false;
  favoritesLoaded  = false;
  // ────────────────────────────────────────────────────────────────────────────

  paperCardList: paperCard[] = [];

  // Context menus
  chapterMenu: ChapterMenu | null = null;
  chapterMenuExpanded = false;
  groupMenu: GroupMenu | null = null;

  // Filter/search state
  searchQuery       = '';
  annotationQuery   = '';
  annotationFilter: 'all' | 'favorites' = 'all';
  annotationBook    = 'all';
  annotationSort: 'newest' | 'oldest' | 'book' = 'newest';
  favSearch         = '';
  favBookFilter     = 'all';
  booksStatusFilter: 'all' | 'in_progress' | 'completed' = 'all';

  showScrollTop = false;

  constructor(
    private route:    ActivatedRoute,
    public  wd:       WorldDataService,
    private api:      ApiService,
    public  router:   Router,
    private dialog:   MatDialog,
    private titleSvc: Title,
    private metaSvc:  Meta,
    private cdr:      ChangeDetectorRef,
  ) {}

  // ── Data loading — 3-phase ──────────────────────────────────────────────────

  ngOnInit(): void {
    // Throttled scroll — no @HostListener polling every frame
    fromEvent(window, 'scroll')
      .pipe(
        throttleTime(100, undefined, { leading: true, trailing: true }),
        map(() => window.scrollY > 400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(show => { this.showScrollTop = show; this.cdr.markForCheck(); });

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        throttleTime(50),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(e => { if (e.key === 'Escape') this.closeMenus(); });

    const worldName = this.route.snapshot.paramMap.get('worldName');
    if (!worldName) return;

    // Preload cached cover from previous visit so browser starts fetch before API responds
    try {
      const cachedCover = localStorage.getItem(`rw_cover_${worldName}`);
      if (cachedCover) this.preloadCoverImage(cachedCover);
    } catch { /* storage restricted */ }

    // Phase 1: hero (cached)
    this.api.getWorldHero(worldName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (hero) => {
          // Preload cover immediately — before *ngIf renders the <img>
          const coverUrl = hero.papers?.[0]?.cover_url;
          if (coverUrl) {
            this.preloadCoverImage(coverUrl);
            try { localStorage.setItem(`rw_cover_${worldName}`, coverUrl); } catch { /* storage restricted */ }
          }
          this.heroData        = hero;
          this.phaseHeroLoaded = true;
          this.titleSvc.setTitle(`${hero.name} — PaperTrail`);
          this.metaSvc.updateTag({ name: 'description',        content: hero.description || `Explore ${hero.name} on PaperTrail` });
          this.metaSvc.updateTag({ property: 'og:title',       content: hero.name });
          this.metaSvc.updateTag({ property: 'og:description', content: hero.description || '' });
          if (coverUrl) this.metaSvc.updateTag({ property: 'og:image', content: coverUrl });
          this.buildPaperCardListFromHero(hero.papers);
          this.wd.setPapers(hero.papers.map(hp => ({
            id: hp.id, name: hp.name, cover_url: hp.cover_url,
            color: hp.color, order: hp.order, status: hp.status, visible: true,
          } as any)));
          this.cdr.markForCheck();
        },
        error: () => {}
      });

    // Phase 2: board data — deferred so hero render is not blocked
    setTimeout(() => this.loadBoardPhase(worldName), 0);
  }

  private loadBoardPhase(worldName: string): void {
    this.api.getWorldBoard(worldName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (board) => {
          const visibleTimelines = board.timelines.map(t => ({ ...t, visible: true } as any));
          this.wd.setTimelines(visibleTimelines);
          this.wd.setStorylines(board.storylines as any);
          this.wd.setSettings(board.subway_settings);

          const chapters: Chapter[] = board.chapters.map(bc => ({
            id: bc.id, title: bc.title, paper_id: bc.paper_id,
            timeline_id: bc.timeline_id, storyline_id: bc.storyline_id,
            range: bc.range, order: bc.order, color: bc.color,
            favorite: bc.favorite, completed: bc.completed, visible: true,
            has_notes: bc.has_notes, notes_count: bc.notes_count,
            favorited_excerpts_count: bc.favorited_excerpts_count,
            world_id: '', description: '', created_at: '', event_Id: '',
            width: 0, height: 0, pageCount: 0, selected: false, focus: false,
          } as unknown as Chapter));
          this.wd.setChapters(chapters);

          const chaptersByPaper = new Map<string, Chapter[]>();
          chapters.forEach(c => {
            if (!chaptersByPaper.has(c.paper_id)) chaptersByPaper.set(c.paper_id, []);
            chaptersByPaper.get(c.paper_id)!.push(c);
          });
          if (this.heroData) {
            this.paperCardList = this.heroData.papers.map(hp => ({
              paper: { id: hp.id, name: hp.name, cover_url: hp.cover_url, color: hp.color, order: hp.order, status: hp.status as any } as paper,
              chapterList: (chaptersByPaper.get(hp.id) || []).sort((a, b) => a.order - b.order),
            }));
          }

          this.triggerLoadDetails();
          this.triggerLoadFavorites();
          this.phaseBoardLoaded = true;
          this.cdr.markForCheck();
        },
        error: () => {
          this.api.getWorldDataByName(worldName)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((world) => {
              const coloredPapers    = (world.papers   || []).map(p  => ({ ...p, visible: true }));
              const paperColorMap    = new Map(coloredPapers.map(p => [p.id, p.color]));
              const coloredChapters  = (world.chapters  || []).map(ch => ({ ...ch, visible: true, color: paperColorMap.get(ch.paper_id) || '#CCCCCC' }));
              const visibleTimelines = (world.timelines || []).map(t => ({ ...t, visible: true }));
              this.wd.setWorldData({ ...world, papers: coloredPapers, chapters: coloredChapters, timelines: visibleTimelines });
              this.parsePaperChapters(coloredPapers);
              if (!this.phaseHeroLoaded) {
                this.titleSvc.setTitle(`${world.name} — PaperTrail`);
                this.metaSvc.updateTag({ name: 'description', content: world.description || `Explore ${world.name} on PaperTrail` });
              }
              this.phaseBoardLoaded = true;
              this.cdr.markForCheck();
            });
        }
      });
  }

  private preloadCoverImage(url: string): void {
    if (!url) return;
    if (this.doc.head.querySelector(`link[rel="preload"][href="${CSS.escape(url)}"]`)) return;
    const link = this.doc.createElement('link') as HTMLLinkElement;
    link.rel  = 'preload';
    (link as any).as = 'image';
    link.href = url;
    this.doc.head.appendChild(link);
  }

  private buildPaperCardListFromHero(papers: HeroPaper[]): void {
    this.paperCardList = papers.map(hp => ({
      paper: { id: hp.id, name: hp.name, cover_url: hp.cover_url, color: hp.color, order: hp.order, status: hp.status, progress: hp.progress } as unknown as paper,
      chapterList: [],
    }));
  }

  parsePaperChapters(papers: paper[]): void {
    this.paperCardList = papers.map(pp => ({ paper: pp, chapterList: this.wd.getChapterByPaperId(pp.id) }));
  }

  ngOnDestroy(): void {}

  // ── Board events ────────────────────────────────────────────────────────────

  onBoardChapterClick(event: BoardChapterClickEvent): void {
    this.groupMenu           = null;
    this.chapterMenuExpanded = false;
    this.chapterMenu = { x: this.clampMenuX(event.clientX), y: this.clampMenuY(event.clientY, 500), chapterId: event.id };
    this.cdr.detectChanges();
  }

  onBoardGroupClick(event: BoardGroupClickEvent): void {
    this.chapterMenu = null;
    this.groupMenu = { x: this.clampMenuX(event.clientX, 280), y: this.clampMenuY(event.clientY, 400), ids: event.ids };
    this.cdr.detectChanges();
  }

  private clampMenuX(rawX: number, menuWidth = 320): number {
    const centered = rawX - menuWidth / 2;
    return Math.min(Math.max(8, centered), window.innerWidth - menuWidth - 8);
  }
  private clampMenuY(rawY: number, menuHeight = 420): number {
    const minY = window.scrollY + 8;
    const maxY = window.scrollY + window.innerHeight - menuHeight - 8;
    return Math.min(Math.max(minY, rawY), Math.max(minY, maxY));
  }

  // ── Context menu helpers ────────────────────────────────────────────────────

  closeMenus(): void {
    this.chapterMenu = null;
    this.chapterMenuExpanded = false;
    this.groupMenu = null;
  }

  get chapterMenuChapter(): Chapter | null {
    return this.chapterMenu ? this.wd.getChapterById(this.chapterMenu.chapterId) : null;
  }
  get chapterMenuPaperName(): string | null {
    return this.chapterMenu ? (this.wd.getPaperByChapterId(this.chapterMenu.chapterId)?.name ?? null) : null;
  }
  get chapterMenuPaperCoverUrl(): string | null {
    return this.chapterMenu ? (this.wd.getPaperByChapterId(this.chapterMenu.chapterId)?.cover_url ?? null) : null;
  }
  get chapterMenuPaperColor(): string | null {
    return this.chapterMenu ? (this.wd.getPaperByChapterId(this.chapterMenu.chapterId)?.color ?? null) : null;
  }
  get chapterMenuTimelineName(): string | null {
    if (!this.chapterMenu) return null;
    const ch = this.wd.getChapterById(this.chapterMenu.chapterId);
    return ch?.timeline_id ? (this.wd.getTimeline(ch.timeline_id)?.name ?? null) : null;
  }
  get chapterMenuStorylineName(): string | null {
    if (!this.chapterMenu) return null;
    const ch = this.wd.getChapterById(this.chapterMenu.chapterId);
    return ch?.storyline_id ? (this.wd.getStoryline(ch.storyline_id)?.name ?? null) : null;
  }
  get groupMenuItems(): GroupMenuItem[] {
    if (!this.groupMenu) return [];
    return this.groupMenu.ids.reduce<GroupMenuItem[]>((acc, id) => {
      const chapter = this.wd.getChapterById(id);
      const paper   = this.wd.getPaperByChapterId(id);
      if (chapter && paper) acc.push({ chapter, paper });
      return acc;
    }, []);
  }

  openChapterDetails(id: string): void {
    const data: chapterDetailsModal = {
      chapter: this.wd.getChapterById(id),
      paper:   this.wd.getPaperByChapterId(id)!,
      link:    this.wd.getChapterLink(id)
    };
    this.dialog.open(ChapterDetailsComponent, {
      width: '400px', maxHeight: '90vh',
      panelClass: 'custom-dialog-container', data
    });
  }

  // ── Computed ────────────────────────────────────────────────────────────────

  get isDark(): boolean { return !(this.wd.getSettings()?.theme ?? true); }

  get totalCompletedChapters(): number {
    const s = this.heroData?.stats;
    if (s?.completed_chapters != null) return s.completed_chapters;
    return this.paperCardList.reduce((n, c) => n + c.chapterList.filter(ch => ch.completed).length, 0);
  }
  get totalFavorites(): number {
    const s = this.heroData?.stats;
    if (s?.total_favorites != null) return s.total_favorites;
    return this.paperCardList.reduce((n, c) => n + c.chapterList.filter(ch => ch.favorite).length, 0);
  }
  get totalAnnotations(): number {
    const s = this.heroData?.stats;
    if (s?.total_annotations != null) return s.total_annotations;
    return this.paperCardList.reduce((n, c) => n + c.chapterList.reduce((m, ch) => m + (ch.annotations?.length || 0), 0), 0);
  }
  get totalChapters(): number {
    const s = this.heroData?.stats;
    if (s?.total_chapters != null) return s.total_chapters;
    return this.paperCardList.reduce((n, c) => n + c.chapterList.length, 0);
  }
  get completedBooks(): number {
    const s = this.heroData?.stats;
    if (s?.completed_books != null) return s.completed_books;
    return this.paperCardList.filter(c => c.chapterList.length > 0 && c.chapterList.every(ch => ch.completed)).length;
  }
  get readingPct(): number {
    const s = this.heroData?.stats;
    if (s?.reading_pct != null) return s.reading_pct;
    return this.totalChapters ? Math.round((this.totalCompletedChapters / this.totalChapters) * 100) : 0;
  }
  get backdropCover(): string {
    if (this.heroData?.papers?.length) return this.heroData.papers[0].cover_url || '';
    return this.paperCardList[0]?.paper?.cover_url || '';
  }
  get uniqueAuthors(): string[] {
    const seen = new Set<string>();
    return this.paperCardList.map(c => c.paper.author_name).filter(a => a && !seen.has(a) && seen.add(a)) as string[];
  }
  get nextRead(): { card: paperCard; chapterOrder: number; chapterTitle: string } | null {
    for (const card of this.paperCardList) {
      const next = [...card.chapterList].sort((a, b) => a.order - b.order).find(ch => !ch.completed);
      if (next) return { card, chapterOrder: next.order, chapterTitle: next.title };
    }
    return null;
  }
  get filteredCards(): paperCard[] {
    let list = this.paperCardList;
    if (this.booksStatusFilter === 'in_progress')
      list = list.filter(c => c.chapterList.some(ch => ch.completed) && !c.chapterList.every(ch => ch.completed));
    else if (this.booksStatusFilter === 'completed')
      list = list.filter(c => c.chapterList.length > 0 && c.chapterList.every(ch => ch.completed));
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(c => c.paper.name.toLowerCase().includes(q) || c.chapterList.some(ch => ch.title.toLowerCase().includes(q)));
  }
  get favIsFiltering(): boolean { return !!this.favSearch.trim() || this.favBookFilter !== 'all'; }
  get currentWorldName(): string { return this.route.snapshot.paramMap.get('worldName') || ''; }

  // ── Phase 3 ─────────────────────────────────────────────────────────────────

  reloadDetails(): void {
    this.detailsItems = []; this.detailsMeta = null; this.detailsLoaded = false;
    this.loadDetails(this.currentWorldName);
  }
  reloadFavorites(): void {
    this.favoriteItems = []; this.favoritesMeta = null; this.favoritesLoaded = false;
    this.loadFavorites(this.currentWorldName);
  }
  loadDetails(worldName: string, after_id?: string): void {
    if (this.detailsLoading) return;
    this.detailsLoading = true;
    const filters = after_id ? { limit: 20, after_id } : {
      limit: 20, sort: this.annotationSort,
      filter: this.annotationFilter !== 'all' ? this.annotationFilter : undefined,
      book:   this.annotationBook !== 'all'   ? this.annotationBook   : undefined,
      search: this.annotationQuery.trim()      || undefined,
    };
    this.api.getWorldDetails(worldName, filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.detailsItems   = after_id ? [...this.detailsItems, ...res.items] : res.items;
          this.detailsMeta    = res.pagination;
          this.detailsLoading = false;
          this.detailsLoaded  = true;
          this.cdr.markForCheck();
        },
        error: () => { this.detailsLoading = false; this.cdr.markForCheck(); }
      });
  }
  loadFavorites(worldName: string, after_id?: string): void {
    if (this.favoritesLoading) return;
    this.favoritesLoading = true;
    const filters = after_id ? { limit: 20, after_id } : { limit: 20, book: this.favBookFilter !== 'all' ? this.favBookFilter : undefined };
    this.api.getWorldFavorites(worldName, filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.favoriteItems    = after_id ? [...this.favoriteItems, ...res.items] : res.items;
          this.favoritesMeta    = res.pagination;
          this.favoritesLoading = false;
          this.favoritesLoaded  = true;
          this.cdr.markForCheck();
        },
        error: () => { this.favoritesLoading = false; this.cdr.markForCheck(); }
      });
  }
  triggerLoadDetails(): void {
    if (!this.detailsLoaded && !this.detailsLoading) this.loadDetails(this.currentWorldName);
  }
  triggerLoadFavorites(): void {
    if (!this.favoritesLoaded && !this.favoritesLoading) this.loadFavorites(this.currentWorldName);
  }
  loadMoreDetails(): void {
    if (this.detailsMeta?.next_cursor) this.loadDetails(this.currentWorldName, this.detailsMeta.next_cursor);
  }
  loadMoreFavorites(): void {
    if (this.favoritesMeta?.next_cursor) this.loadFavorites(this.currentWorldName, this.favoritesMeta.next_cursor);
  }
  resetFavSearch(): void {
    this.favSearch = ''; this.favBookFilter = 'all'; this.reloadFavorites();
  }
  scrollToTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  continueReading(): void {
    const nr = this.nextRead;
    if (!nr) return;
    this.router.navigate(['/read/book', nr.card.paper.id, 'chapter', nr.chapterOrder]);
  }
  navigate(event: { paperId: string; order: number }): void {
    this.router.navigate(['/read/book', event.paperId, 'chapter', event.order]);
  }
}
