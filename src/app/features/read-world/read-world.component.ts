import { Component, AfterViewInit, OnDestroy, DestroyRef, inject, HostListener, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, debounceTime, switchMap, EMPTY, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title, Meta } from '@angular/platform-browser';
import { WorldDataService } from '../dashboard/world-data.service';
import { paper, paperCard, chapterDetailsModal, Chapter, ChapterAnnotation, WorldHeroResponse, HeroPaper, DetailsItem, FavoriteItem, PaginatedMeta } from '../../models/paperTrailTypes';
import { ApiService } from '../../core/api.service';
import { ChapterDetailsComponent } from './dialog/chapter-details/chapter-details.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-read-world',
  templateUrl: './read-world.component.html',
  styleUrls: ['./read-world.component.scss'],
})
export class ReadWorldComponent implements AfterViewInit, OnDestroy {
  private destroyRef = inject(DestroyRef);
  private iframe!: HTMLIFrameElement;

  @ViewChild('boardFrame') set boardFrameRef(el: ElementRef<HTMLIFrameElement>) {
    if (!el) return;
    this.iframe = el.nativeElement;
    this.iframe.addEventListener('load', () => this.setupDataSyncWithIframe(), { once: true });
  }
  private settingsUpdate$  = new Subject<boolean>();
  private boardTransform$  = new Subject<BoardTransformation>();
  private readonly ANIMATION_MS = 400;
  private lastSentPayload: string | null = null;
  private resizeObserver!: ResizeObserver;
  private readonly MOBILE_BREAKPOINT = 1100;

  // ── 3-phase state ───────────────────────────────────────────────────────────
  heroData: WorldHeroResponse | null = null;
  phaseHeroLoaded  = false;
  phaseBoardLoaded = false;

  // Phase 3 — details & favorites (lazy)
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

  boardCollapsed           = localStorage.getItem('rw_board_collapsed') !== 'false';
  boardStorylinesCollapsed = false;
  boardInfoOpen            = false;
  boardFullscreen          = false;
  boardOrientationLocked   = false;

  chapterMenu: ChapterMenu | null = null;
  chapterMenuExpanded  = false;
  groupMenu: GroupMenu | null = null;
  focusedChapterId: string | null = null;

  searchQuery       = '';
  annotationQuery   = '';
  annotationFilter: 'all' | 'favorites' = 'all';
  annotationBook    = 'all';
  annotationSort: 'newest' | 'oldest' | 'book' = 'newest';

  favSearch     = '';
  favBookFilter = 'all';
  favPage       = 0;
  readonly FAV_PAGE_SIZE = 8;

  booksStatusFilter: 'all' | 'in_progress' | 'completed' = 'all';

  annPage = 0;
  readonly ANN_PAGE_SIZE = 10;

  showScrollTop = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showScrollTop = window.scrollY > 400;
  }

  constructor(
    private route:  ActivatedRoute,
    public  wd:     WorldDataService,
    private api:    ApiService,
    public  router: Router,
    private dialog: MatDialog,
    private titleSvc: Title,
    private metaSvc:  Meta,
    private cdr: ChangeDetectorRef,
  ) {}

  // ── Data loading — 3-phase ──────────────────────────────────────────────────

  ngAfterViewInit(): void {
    const worldName = this.route.snapshot.paramMap.get('worldName');
    if (!worldName) return;

    this.settingsUpdate$
      .pipe(
        debounceTime(this.ANIMATION_MS),
        switchMap(collapsed_all => {
          const current = this.wd.getSettings();
          if (!current?.id) return EMPTY;
          const updated = { ...current, collapsed_all };
          this.wd.setSettings(updated);
          return this.api.updateSettings(updated.id, updated).pipe(map(ss => ({ ...ss, collapsed_all })));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(ss => this.wd.setSettings(ss));

    this.boardTransform$
      .pipe(
        debounceTime(300),
        switchMap(data => {
          const current = this.wd.getSettings();
          if (!current?.id) return EMPTY;
          if (current.x === data.x && current.y === data.y && current.k === data.k) return EMPTY;
          return this.api.updateSettings(current.id, { ...current, ...data });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(ss => this.wd.setSettings(ss));

    window.addEventListener('message', this.handleIframeMessage);

    // Auto-close board when viewport shrinks below mobile breakpoint
    this.resizeObserver = new ResizeObserver(() => {
      if (window.innerWidth < this.MOBILE_BREAKPOINT && !this.boardCollapsed && !this.boardFullscreen) {
        this.boardCollapsed = true;
        this.cdr.markForCheck();
      }
    });
    this.resizeObserver.observe(document.body);

    // ── Phase 1: hero (cached 1h) — fires first ─────────────────────────────
    this.api.getWorldHero(worldName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (hero) => {
          Promise.resolve().then(() => {
            this.heroData        = hero;
            this.phaseHeroLoaded = true;
            this.titleSvc.setTitle(`${hero.name} — PaperTrail`);
            this.metaSvc.updateTag({ name: 'description', content: hero.description || `Explore ${hero.name} on PaperTrail` });
            this.metaSvc.updateTag({ property: 'og:title',       content: hero.name });
            this.metaSvc.updateTag({ property: 'og:description', content: hero.description || '' });
            this.buildPaperCardListFromHero(hero.papers);
            this.wd.setPapers(hero.papers.map(hp => ({
              id: hp.id, name: hp.name, cover_url: hp.cover_url,
              color: hp.color, order: hp.order, status: hp.status,
              visible: true,
            } as any)));
            this.cdr.markForCheck();
          });
        },
        error: () => { /* Phase 1 failed — Phase 2 will still provide data */ }
      });

    // ── Phase 2: board data (parallel with Phase 1) ─────────────────────────
    this.api.getWorldBoard(worldName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (board) => {
          const visibleTimelines = board.timelines.map(t => ({ ...t, visible: true } as any));
          this.wd.setTimelines(visibleTimelines);
          this.wd.setStorylines(board.storylines as any);
          this.wd.setSettings(board.subway_settings);

          // Map BoardChapter → Chapter (minimal fields needed for board sync + UI)
          const chapters: Chapter[] = board.chapters.map(bc => ({
            id:           bc.id,
            title:        bc.title,
            paper_id:     bc.paper_id,
            timeline_id:  bc.timeline_id,
            storyline_id: bc.storyline_id,
            range:        bc.range,
            order:        bc.order,
            color:        bc.color,
            favorite:     bc.favorite,
            completed:    bc.completed,
            visible:      true,
            has_notes:    bc.has_notes,
            notes_count:  bc.notes_count,
            favorited_excerpts_count: bc.favorited_excerpts_count,
            world_id: '', description: '', created_at: '', event_Id: '',
            width: 0, height: 0, pageCount: 0, selected: false, focus: false,
          } as unknown as Chapter));
          this.wd.setChapters(chapters);

          // Populate paperCardList chapterLists so continue-reading + books section work
          const chaptersByPaper = new Map<string, Chapter[]>();
          chapters.forEach(c => {
            if (!chaptersByPaper.has(c.paper_id)) chaptersByPaper.set(c.paper_id, []);
            chaptersByPaper.get(c.paper_id)!.push(c);
          });
          if (this.heroData) {
            this.paperCardList = this.heroData.papers.map(hp => ({
              paper: {
                id: hp.id, name: hp.name, cover_url: hp.cover_url,
                color: hp.color, order: hp.order, status: hp.status as any,
              } as paper,
              chapterList: (chaptersByPaper.get(hp.id) || []).sort((a, b) => a.order - b.order),
            }));
          }

          // Auto-trigger Phase 3 now that board is loaded
          this.triggerLoadDetails();
          this.triggerLoadFavorites();

          this.phaseBoardLoaded = true;
          this.cdr.markForCheck();
        },
        error: () => {
          // Phase 2 failed — fall back to legacy full-world call
          this.api.getWorldDataByName(worldName)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((world) => {
              const coloredPapers   = (world.papers   || []).map(p  => ({ ...p, visible: true }));
              const paperColorMap   = new Map(coloredPapers.map(p => [p.id, p.color]));
              const coloredChapters = (world.chapters  || []).map(ch => ({
                ...ch, visible: true,
                color: paperColorMap.get(ch.paper_id) || '#CCCCCC',
              }));
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

  /** Build paperCardList from HeroPaper[] so hero section renders before Phase 2 */
  private buildPaperCardListFromHero(papers: HeroPaper[]): void {
    this.paperCardList = papers.map(hp => ({
      paper: {
        id: hp.id, name: hp.name, cover_url: hp.cover_url,
        color: hp.color, order: hp.order, status: hp.status,
        progress: hp.progress,
      } as unknown as paper,
      chapterList: [],
    }));
  }

  private setupDataSyncWithIframe(): void {
    combineLatest([this.wd.chapters$, this.wd.timelines$, this.wd.storylines$, this.wd.settings$])
      .pipe(debounceTime(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(([chapters, timelines, storylines, settings]) => {
        if (!settings?.id) return;
        const visibleChapters   = chapters.filter(c => c.visible);
        const visibleTimelines  = timelines
          .filter(t => t.visible)
          .sort((a, b) => a.order - b.order)
          .map((t, i) => ({ ...t, order: i + 1 }));
        const serialized = JSON.stringify({
          chapters:   visibleChapters.map(c => c.id),
          timelines:  visibleTimelines.map(t => ({ id: t.id, order: t.order })),
          storylines: storylines.map(s => s.id),
          theme:      settings.theme,
        });
        if (serialized === this.lastSentPayload) return;
        this.lastSentPayload = serialized;
        const boardChapters = visibleChapters.map(c => {
          const annotations              = c.annotations ?? [];
          const notes_count              = annotations.length;
          const favorited_excerpts_count = annotations.filter(a => a.favorite).length;
          return {
            id:           c.id,
            title:        c.title,
            timeline_id:  c.timeline_id,
            storyline_id: c.storyline_id,
            range:        c.range,
            order:        c.order,
            color:        c.color,
            favorite:     c.favorite ?? false,
            has_notes:    notes_count > 0,
            notes_count:  notes_count > 0 ? notes_count : undefined,
            favorited_excerpts_count: favorited_excerpts_count > 0 ? favorited_excerpts_count : undefined,
          };
        });
        this.iframe.contentWindow?.postMessage({
          type: 'set-data',
          data: {
            timelines: visibleTimelines, storylines,
            chapters: boardChapters,
            settings: { config: { zoom: { k: settings.k, x: settings.x, y: settings.y }, theme: { mode: settings.theme ? 'light' : 'dark' }, collapsedAll: settings.collapsed_all } }
          }
        }, '*');
      });
  }

  handleIframeMessage = (event: MessageEvent) => {
    const { type, data } = event.data || {};
    switch (type) {
      case 'chapter-option-selected': this.ChapterSelect(data);               break;
      case 'board-transform-update':  this.boardTransform(data.transform);    break;
      case 'board-settings-update':   this.boardSettingsUpdate(data);         break;
      case 'board-size-update':       this.boardSizeUpdate(data);             break;
      case 'chapter-click':           this.onChapterClick(data);              break;
      case 'group-click':             this.onGroupClick(data);                break;
      case 'chapter-focus':           this.focusedChapterId = data.focus ? data.id : null; break;
    }
  };

  private boardSizeUpdate(_data: { width: number; height: number; collapsed: boolean }): void {
    // Height is fixed — board content is navigated via pan/zoom inside the iframe.
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

  private onChapterClick(data: { id: string; clientX: number; clientY: number; kind: 'solo' | 'group-item' }): void {
    const rect = this.iframe.getBoundingClientRect();
    const rawX = rect.left + data.clientX;
    const rawY = rect.top  + data.clientY + window.scrollY;
    this.groupMenu           = null;
    this.chapterMenuExpanded = false;
    this.chapterMenu = { x: this.clampMenuX(rawX), y: this.clampMenuY(rawY, 500), chapterId: data.id };
    this.cdr.detectChanges();
  }

  private onGroupClick(data: { groupId: string; ids: string[]; clientX: number; clientY: number }): void {
    const rect = this.iframe.getBoundingClientRect();
    const rawX = rect.left + data.clientX;
    const rawY = rect.top  + data.clientY + window.scrollY;
    this.chapterMenu = null;
    this.groupMenu   = { x: this.clampMenuX(rawX, 280), y: this.clampMenuY(rawY, 400), ids: data.ids };
    this.cdr.detectChanges();
  }

  // ── trackBy helpers ────────────────────────────────────────────────────────
  trackById(_: number, item: { id?: string }): string | number { return item.id ?? _; }
  trackByPaperId(_: number, item: { paper: { id: string } }): string { return item.paper.id; }
  trackByChapterId(_: number, item: { chapter: { id: string } }): string { return item.chapter.id; }
  trackByFavItem(_: number, item: FavoriteItem): string { return item.chapter_id; }
  trackByDetailItem(_: number, item: DetailsItem): string { return item.annotation.id; }

  closeMenus(): void {
    this.chapterMenu         = null;
    this.chapterMenuExpanded = false;
    this.groupMenu           = null;
  }

  toggleChapterMenuExpanded(): void {
    this.chapterMenuExpanded = !this.chapterMenuExpanded;
  }

  sortedAnnotations(ch: Chapter): ChapterAnnotation[] {
    if (!ch.annotations?.length) return [];
    return [...ch.annotations].sort((a, b) => Number(b.favorite) - Number(a.favorite));
  }

  chapterFavAnnotationsCount(ch: Chapter): number {
    return ch.annotations?.filter(a => a.favorite).length ?? 0;
  }

  chapterMenuTimeline() {
    if (!this.chapterMenu) return null;
    const ch = this.wd.getChapterById(this.chapterMenu.chapterId);
    return ch?.timeline_id ? (this.wd.getTimeline(ch.timeline_id) ?? null) : null;
  }

  chapterMenuStoryline() {
    if (!this.chapterMenu) return null;
    const ch = this.wd.getChapterById(this.chapterMenu.chapterId);
    return ch?.storyline_id ? (this.wd.getStoryline(ch.storyline_id) ?? null) : null;
  }

  isMobile(): boolean {
    return window.innerWidth < this.MOBILE_BREAKPOINT;
  }

  toggleBoard(): void {
    if (this.isMobile()) {
      this.boardFullscreen = true;
      document.body.style.overflow = 'hidden';
      if (navigator.maxTouchPoints > 0) this.lockLandscape(); // only on real touch devices
    } else {
      this.boardCollapsed = !this.boardCollapsed;
      localStorage.setItem('rw_board_collapsed', String(this.boardCollapsed));
    }
  }

  closeBoardFullscreen(): void {
    this.boardFullscreen = false;
    document.body.style.overflow = '';
    this.unlockOrientation();
  }

  async lockLandscape(): Promise<void> {
    const screen = window.screen as any;
    try {
      if (screen?.orientation?.lock) {
        await screen.orientation.lock('landscape');
        this.boardOrientationLocked = true;
      }
    } catch {
      // Not supported or denied — silently ignore
    }
  }

  unlockOrientation(): void {
    if (!this.boardOrientationLocked) return;
    try {
      (window.screen as any)?.orientation?.unlock?.();
    } catch { /* ignore */ }
    this.boardOrientationLocked = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.boardFullscreen) { this.closeBoardFullscreen(); return; }
    this.closeMenus();
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleIframeMessage);
    this.resizeObserver?.disconnect();
    document.body.style.overflow = '';
    this.unlockOrientation();
    this.lastSentPayload = null;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  ChapterSelect(data: ChapterSelected) {
    const chapter = this.wd.getChapterTitle(data.chapterId);
    if (data.option === 'Read Chapter')    this.router.navigate(['/read/book', chapter.paper_id, 'chapter', chapter.order]);
    if (data.option === 'Chapter Details') this.openChapterDetails(data.chapterId);
  }

  boardSettingsUpdate(data: { collapsedAll: boolean }) {
    this.boardStorylinesCollapsed = data.collapsedAll;
    this.settingsUpdate$.next(data.collapsedAll);
  }

  toggleStorylinesCollapse(): void {
    this.boardStorylinesCollapsed = !this.boardStorylinesCollapsed;
    this.iframe?.contentWindow?.postMessage(
      { type: 'set-collapse', data: { collapsed: this.boardStorylinesCollapsed } },
      '*'
    );
  }

  boardTransform(data: BoardTransformation) {
    this.boardTransform$.next(data);
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

  parsePaperChapters(papers: paper[]) {
    this.paperCardList = papers.map(pp => ({
      paper: pp,
      chapterList: this.wd.getChapterByPaperId(pp.id)
    }));
  }

  // ── Phase 3: lazy details & favorites ──────────────────────────────────────

  /** Call when filter/sort controls change — resets list and refetches */
  reloadDetails(): void {
    this.detailsItems  = [];
    this.detailsMeta   = null;
    this.detailsLoaded = false;
    this.loadDetails(this.currentWorldName);
  }

  reloadFavorites(): void {
    this.favoriteItems   = [];
    this.favoritesMeta   = null;
    this.favoritesLoaded = false;
    this.loadFavorites(this.currentWorldName);
  }

  loadDetails(worldName: string, after_id?: string): void {
    if (this.detailsLoading) return;
    this.detailsLoading = true;
    const filters = after_id
      ? { limit: 20, after_id }
      : {
          limit: 20,
          sort:   this.annotationSort,
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
    const filters = after_id
      ? { limit: 20, after_id }
      : { limit: 20, book: this.favBookFilter !== 'all' ? this.favBookFilter : undefined };
    this.api.getWorldFavorites(worldName, filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.favoriteItems   = after_id ? [...this.favoriteItems, ...res.items] : res.items;
          this.favoritesMeta   = res.pagination;
          this.favoritesLoading = false;
          this.favoritesLoaded  = true;
          this.cdr.markForCheck();
        },
        error: () => { this.favoritesLoading = false; this.cdr.markForCheck(); }
      });
  }

  get currentWorldName(): string {
    return this.route.snapshot.paramMap.get('worldName') || '';
  }

  triggerLoadDetails(): void {
    if (!this.detailsLoaded && !this.detailsLoading) {
      this.loadDetails(this.currentWorldName);
    }
  }

  triggerLoadFavorites(): void {
    if (!this.favoritesLoaded && !this.favoritesLoading) {
      this.loadFavorites(this.currentWorldName);
    }
  }

  loadMoreDetails(): void {
    if (this.detailsMeta?.next_cursor) {
      this.loadDetails(this.currentWorldName, this.detailsMeta.next_cursor);
    }
  }

  loadMoreFavorites(): void {
    if (this.favoritesMeta?.next_cursor) {
      this.loadFavorites(this.currentWorldName, this.favoritesMeta.next_cursor);
    }
  }

  // ── Computed ───────────────────────────────────────────────────────────────

  get isDark(): boolean {
    return !(this.wd.getSettings()?.theme ?? true);
  }

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

  private readonly PAGINATION_CAP = 500;
  formatCappedTotal(total: number): string {
    return total >= this.PAGINATION_CAP ? `${this.PAGINATION_CAP}+` : String(total);
  }

  get totalAnnotations(): number {
    const s = this.heroData?.stats;
    if (s?.total_annotations != null) return s.total_annotations;
    return this.paperCardList.reduce((n, c) =>
      n + c.chapterList.reduce((m, ch) => m + (ch.annotations?.length || 0), 0), 0);
  }

  get totalChapters(): number {
    const s = this.heroData?.stats;
    if (s?.total_chapters != null) return s.total_chapters;
    return this.paperCardList.reduce((n, c) => n + c.chapterList.length, 0);
  }

  get completedBooks(): number {
    const s = this.heroData?.stats;
    if (s?.completed_books != null) return s.completed_books;
    return this.paperCardList.filter(c =>
      c.chapterList.length > 0 && c.chapterList.every(ch => ch.completed)
    ).length;
  }

  get readingPct(): number {
    const s = this.heroData?.stats;
    if (s?.reading_pct != null) return s.reading_pct;
    return this.totalChapters
      ? Math.round((this.totalCompletedChapters / this.totalChapters) * 100)
      : 0;
  }

  get nextRead(): { card: paperCard; chapterOrder: number; chapterTitle: string } | null {
    for (const card of this.paperCardList) {
      const sorted = [...card.chapterList].sort((a, b) => a.order - b.order);
      // Find first chapter that is not yet completed
      const next = sorted.find(ch => !ch.completed);
      if (next) return { card, chapterOrder: next.order, chapterTitle: next.title };
    }
    return null;
  }

  get backdropCover(): string {
    if (this.heroData?.papers?.length) return this.heroData.papers[0].cover_url || '';
    return this.paperCardList[0]?.paper?.cover_url || '';
  }

  get uniqueAuthors(): string[] {
    const seen = new Set<string>();
    return this.paperCardList
      .map(c => c.paper.author_name)
      .filter(a => a && !seen.has(a) && seen.add(a)) as string[];
  }

  get filteredCards(): paperCard[] {
    let list = this.paperCardList;
    if (this.booksStatusFilter === 'in_progress')
      list = list.filter(c => c.chapterList.some(ch => ch.completed) && !c.chapterList.every(ch => ch.completed));
    else if (this.booksStatusFilter === 'completed')
      list = list.filter(c => c.chapterList.length > 0 && c.chapterList.every(ch => ch.completed));

    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return list;
    // Annotations not available from board data — search only book + chapter titles
    return list.filter(c =>
      c.paper.name.toLowerCase().includes(q) ||
      c.chapterList.some(ch => ch.title.toLowerCase().includes(q))
    );
  }

  // ── Favorites (Phase 3 data) ────────────────────────────────────────────────
  get favIsFiltering(): boolean {
    return !!this.favSearch.trim() || this.favBookFilter !== 'all';
  }

  resetFavSearch() {
    this.favSearch     = '';
    this.favBookFilter = 'all';
    this.reloadFavorites();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  continueReading(): void {
    const nr = this.nextRead;
    if (!nr) return;
    this.router.navigate(['/read/book', nr.card.paper.id, 'chapter', nr.chapterOrder]);
  }

  chapterMenuChapter() {
    if (!this.chapterMenu) return null;
    return this.wd.getChapterById(this.chapterMenu.chapterId);
  }

  chapterMenuPaper() {
    if (!this.chapterMenu) return null;
    return this.wd.getPaperByChapterId(this.chapterMenu.chapterId);
  }

  groupMenuChapters(): { chapter: Chapter; paper: paper }[] {
    if (!this.groupMenu) return [];
    const result: { chapter: Chapter; paper: paper }[] = [];
    for (const id of this.groupMenu.ids) {
      const chapter = this.wd.getChapterById(id);
      if (!chapter) continue;
      const paper = this.wd.getPaperByChapterId(id);
      if (!paper) continue;
      result.push({ chapter, paper });
    }
    return result;
  }
}

type ChapterSelected     = { chapterId: string; option: 'Chapter Details' | 'Read Chapter' };
type BoardTransformation = { x: number; y: number; k: number };
type ChapterMenu         = { x: number; y: number; chapterId: string };
type GroupMenu           = { x: number; y: number; ids: string[] };
