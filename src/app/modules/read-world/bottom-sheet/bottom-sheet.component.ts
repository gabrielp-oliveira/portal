import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ErrorService } from '../../error.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Chapter, paper, Timeline } from '../../../models/paperTrailTypes';
import { Subject, takeUntil, take } from 'rxjs';
import { BottomSheetService } from '../bottom-sheet.service';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent implements OnDestroy {

  search = '';
  displayedChaptersColumns = ['visible', 'title', 'order', 'read'];
  displayedPaperColumns = ['visible', 'name', 'order', 'read'];
  displayedtimelinesColumns = ['visible', 'name', 'order', 'actions'];
  chapters: Chapter[] = [];
  timelines: Timeline[] = [];
  papers: paper[] = [];
  chapterSortBy: 'title' | 'order' = 'order';
  paperSortBy: 'name' | 'order' = 'order';
  timelineSortBy: 'name' | 'order' = 'order';
  sortAsc: boolean = true;

  isDarkTheme: boolean = false
  destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { type: string },
    private route: ActivatedRoute,
    private router: Router,
    public wd: WorldDataService,
    private errorHandler: ErrorService,
    private bottomSheetService: BottomSheetService
  ) { }


  close() {
    this.bottomSheetService.close()
  }

  ngOnInit() {

    this.wd.chapters$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chapters) => {
          this.chapters = chapters;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
    this.wd.timelines$

      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (timeline) => {
          this.timelines = timeline;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
    this.wd.papers$

      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (papers) => {
          this.papers = papers;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
    this.wd.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ss) => {
        this.isDarkTheme = ss.theme
        this.applyThemeToMaterialClasses();
      })

    this.observeBottomSheetChanges(); // observa novas instâncias

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  onChapterVisibilityToggle(chapter: Chapter) {
    this.wd.updateChapter(chapter)
  }
onPaperVisibilityToggle(paper: paper) {
  const affectedTimelineIds = new Set<string>()

  // Atualiza capítulos do paper e coleta timeline_ids afetados
  this.chapters.forEach((chp) => {
    if (chp.paper_id === paper.id) {
      chp.visible = paper.visible
      this.wd.updateChapter(chp)

      if (chp.timeline_id) {
        affectedTimelineIds.add(chp.timeline_id)
      }
    }
  })

  this.wd.updatePaper(paper)

  // Atualiza visibilidade das timelines com base nos capítulos visíveis
  const updatedTimelines = this.timelines.map((timeline) => {
    if (affectedTimelineIds.has(timeline.id)) {
      const hasVisibleChapters = this.chapters.some(
        (chp) => chp.timeline_id === timeline.id && chp.visible === true
      )
      return { ...timeline, visible: hasVisibleChapters }
    }
    return timeline
  })

  // Aplica as alterações nas timelines atualizadas
  updatedTimelines.forEach((timeline) => {
    this.wd.updateTimeline(timeline)
  })

  // Se você mantém um estado local com timelines (ex: this.timelines), atualize também:
  this.timelines = updatedTimelines
}



  onTimelinesVisibilityToggle(timeline: Timeline) {
    this.chapters.forEach((chp) => {
      if (chp.timeline_id == timeline.id) {
        chp.visible = timeline.visible
        this.wd.updateChapter(chp)
      }
    })
    this.wd.updateTimeline(timeline)
  }

  showDetails(chapter: Chapter) {
    alert(`📄 Detalhes do capítulo:\n\n${chapter.description}`);
    // No futuro, pode abrir um Dialog com mais detalhes
  }

  goToChapter(chapter: Chapter) {
    const worldName = this.route.snapshot.paramMap.get('worldName');
    if (worldName) {
      this.router.navigate([`/reader/${worldName}/${chapter.id}`]);
    }
  }

  truncateText(text: string, maxLength: number = 20): string {
    return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
  }

  get filteredChapters(): Chapter[] {
    const filtered = this.chapters.filter(ch =>
      ch.title.toLowerCase().includes(this.search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = this.chapterSortBy === 'title' ? a.title.toLowerCase() : a.order;
      const bValue = this.chapterSortBy === 'title' ? b.title.toLowerCase() : b.order;

      if (aValue < bValue) return this.sortAsc ? -1 : 1;
      if (aValue > bValue) return this.sortAsc ? 1 : -1;
      return 0;
    });
  }
  get filteredPapers(): paper[] {
    const filtered = this.papers.filter(ch =>
      ch.name.toLowerCase().includes(this.search.toLowerCase())
    );
    return filtered.sort((a, b) => {
      const aValue = this.paperSortBy === 'name' ? a.name.toLowerCase() : a.order;
      const bValue = this.paperSortBy === 'name' ? b.name.toLowerCase() : b.order;

      if (aValue < bValue) return this.sortAsc ? -1 : 1;
      if (aValue > bValue) return this.sortAsc ? 1 : -1;
      return 0;
    });
  }
  get filteredTimelines(): Timeline[] {
    const filtered = this.timelines.filter(tl =>
      tl.name.toLowerCase().includes(this.search.toLowerCase())
    );
    return filtered.sort((a, b) => {
      const aValue = this.timelineSortBy === 'name' ? a.name.toLowerCase() : a.order;
      const bValue = this.timelineSortBy === 'name' ? b.name.toLowerCase() : b.order;

      if (aValue < bValue) return this.sortAsc ? -1 : 1;
      if (aValue > bValue) return this.sortAsc ? 1 : -1;
      return 0;
    });
  }

  toggleSort(field: 'title' | 'order') {
    if (this.chapterSortBy === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.chapterSortBy = field;
      this.sortAsc = true;
    }
  }
  toggleTimelinesSort(field: 'name' | 'order') {
    console.log(field)
    if (this.timelineSortBy === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.timelineSortBy = field;
      this.sortAsc = true;
    }
  }

  private applyThemeToMaterialClasses() {
    const background = this.isDarkTheme ? '#1e1e1e' : '#ffffff';
    const color = this.isDarkTheme ? '#f4f4f4' : '#1a1a1a';

    const elements = document.querySelectorAll<HTMLElement>(
      '.mat-bottom-sheet-container, .mat-elevation-z2, .mat-elevation-z2 tr'
    );

    elements.forEach((el) => {
      el.style.backgroundColor = background;
      el.style.color = color;
      el.style.fontFamily = "'Segoe UI', sans-serif";
      el.style.fontSize = '14px';
    });
  }

  private observeBottomSheetChanges() {
    const observer = new MutationObserver(() => {
      this.applyThemeToMaterialClasses(); // aplica o estilo sempre que algo novo for adicionado
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Opcional: guarda para desconectar depois, se quiser limpar
    this.destroy$.subscribe(() => observer.disconnect());
  }




}
