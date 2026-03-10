import {
  Component, AfterViewInit, OnDestroy, DestroyRef, inject,
  ChangeDetectorRef, ViewChild, ElementRef, Input, Output, EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, combineLatest, debounceTime, switchMap, EMPTY, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorldDataService } from '../../../dashboard/world-data.service';
import { ApiService } from '../../../../core/api.service';
import { Subway_Settings } from '../../../../models/paperTrailTypes';
import { TopPanelComponent } from '../../top-panel/top-panel.component';

export type BoardChapterClickEvent = { id: string; clientX: number; clientY: number };
export type BoardGroupClickEvent   = { ids: string[]; clientX: number; clientY: number };
export type BoardTransformation    = { x: number; y: number; k: number };

@Component({
  standalone: true,
  selector: 'app-rw-board',
  templateUrl: './rw-board.component.html',
  styleUrls: ['./rw-board.component.scss'],
  imports: [CommonModule, MatIconModule, MatTooltipModule, TopPanelComponent],
})
export class RwBoardComponent implements AfterViewInit, OnDestroy {
  private destroyRef   = inject(DestroyRef);
  private cdr          = inject(ChangeDetectorRef);
  private wd           = inject(WorldDataService);
  private api          = inject(ApiService);

  @Input() phaseBoardLoaded = false;
  @Input() worldName = '';

  @Output() chapterClick    = new EventEmitter<BoardChapterClickEvent>();
  @Output() groupClick      = new EventEmitter<BoardGroupClickEvent>();

  private iframe!: HTMLIFrameElement;
  @ViewChild('boardFrame') set boardFrameRef(el: ElementRef<HTMLIFrameElement>) {
    if (!el) return;
    this.iframe = el.nativeElement;
    this.iframe.addEventListener('load', () => this.setupDataSyncWithIframe(), { once: true });
  }

  private settingsUpdate$ = new Subject<boolean>();
  private boardTransform$ = new Subject<BoardTransformation>();
  private lastSentPayload: string | null = null;
  private resizeObserver!: ResizeObserver;
  private readonly MOBILE_BREAKPOINT = 1100;
  private readonly ANIMATION_MS = 400;

  boardCollapsed           = localStorage.getItem('rw_board_collapsed') !== 'false';
  boardStorylinesCollapsed = false;
  boardInfoOpen            = false;
  boardFullscreen          = false;
  boardOrientationLocked   = false;

  ngAfterViewInit(): void {
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

    this.resizeObserver = new ResizeObserver(() => {
      if (window.innerWidth < this.MOBILE_BREAKPOINT && !this.boardCollapsed && !this.boardFullscreen) {
        this.boardCollapsed = true;
        this.cdr.markForCheck();
      }
    });
    this.resizeObserver.observe(document.body);
  }

  private setupDataSyncWithIframe(): void {
    combineLatest([this.wd.chapters$, this.wd.timelines$, this.wd.storylines$, this.wd.settings$])
      .pipe(debounceTime(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(([chapters, timelines, storylines, settings]) => {
        if (!settings?.id) return;
        const s = settings as Subway_Settings;
        const visibleChapters  = chapters.filter(c => c.visible);
        const visibleTimelines = timelines
          .filter(t => t.visible)
          .sort((a, b) => a.order - b.order)
          .map((t, i) => ({ ...t, order: i + 1 }));
        const serialized = JSON.stringify({
          chapters:   visibleChapters.map(c => c.id),
          timelines:  visibleTimelines.map(t => ({ id: t.id, order: t.order })),
          storylines: storylines.map(sl => sl.id),
          theme:      s.theme,
        });
        if (serialized === this.lastSentPayload) return;
        this.lastSentPayload = serialized;
        const boardChapters = visibleChapters.map(c => {
          const annotations              = c.annotations ?? [];
          const notes_count              = annotations.length;
          const favorited_excerpts_count = annotations.filter(a => a.favorite).length;
          return {
            id: c.id, title: c.title, timeline_id: c.timeline_id,
            storyline_id: c.storyline_id, range: c.range, order: c.order,
            color: c.color, favorite: c.favorite ?? false,
            has_notes: notes_count > 0,
            notes_count: notes_count > 0 ? notes_count : undefined,
            favorited_excerpts_count: favorited_excerpts_count > 0 ? favorited_excerpts_count : undefined,
          };
        });
        this.iframe.contentWindow?.postMessage({
          type: 'set-data',
          data: {
            timelines: visibleTimelines, storylines,
            chapters: boardChapters,
            settings: { config: { zoom: { k: s.k, x: s.x, y: s.y }, theme: { mode: s.theme ? 'light' : 'dark' }, collapsedAll: s.collapsed_all } }
          }
        }, '*');
      });
  }

  handleIframeMessage = (event: MessageEvent) => {
    const { type, data } = event.data || {};
    switch (type) {
      case 'chapter-click':
        this.chapterClick.emit({ id: data.id, clientX: data.clientX, clientY: data.clientY });
        break;
      case 'group-click':
        this.groupClick.emit({ ids: data.ids, clientX: data.clientX, clientY: data.clientY });
        break;
      case 'board-transform-update':
        this.boardTransform$.next(data.transform);
        break;
      case 'board-settings-update':
        this.boardStorylinesCollapsed = data.collapsedAll;
        this.settingsUpdate$.next(data.collapsedAll);
        break;
    }
  };

  toggleBoard(): void {
    if (window.innerWidth < this.MOBILE_BREAKPOINT) {
      this.boardFullscreen = true;
      document.body.style.overflow = 'hidden';
      if (navigator.maxTouchPoints > 0) this.lockLandscape();
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

  toggleStorylinesCollapse(): void {
    this.boardStorylinesCollapsed = !this.boardStorylinesCollapsed;
    this.iframe?.contentWindow?.postMessage(
      { type: 'set-collapse', data: { collapsed: this.boardStorylinesCollapsed } }, '*'
    );
  }

  closeMenus(): void {
    // emit to parent via an output if needed — here we just suppress propagation
  }

  async lockLandscape(): Promise<void> {
    try {
      if ((window.screen as any)?.orientation?.lock) {
        await (window.screen as any).orientation.lock('landscape');
        this.boardOrientationLocked = true;
      }
    } catch { /* ignore */ }
  }

  unlockOrientation(): void {
    if (!this.boardOrientationLocked) return;
    try { (window.screen as any)?.orientation?.unlock?.(); } catch { /* ignore */ }
    this.boardOrientationLocked = false;
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleIframeMessage);
    this.resizeObserver?.disconnect();
    document.body.style.overflow = '';
    this.unlockOrientation();
    this.lastSentPayload = null;
  }
}
