import { Component, Inject, DestroyRef, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ErrorService } from '../../../core/error.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Chapter, paper, Timeline } from '../../../models/paperTrailTypes';
import { take } from 'rxjs';
import { BottomSheetService } from '../bottom-sheet.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent {

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

  isDarkMode: boolean = false;
  private destroyRef = inject(DestroyRef);

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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (chapters) => {
          this.chapters = chapters;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
    this.wd.timelines$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (timeline) => {
          this.timelines = timeline;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
    this.wd.papers$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (papers) => {
          this.papers = papers;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
    this.wd.settings$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ss) => {
        this.isDarkMode = !ss.theme;
      });

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

  showDetails(timeline: Timeline) {
    alert(`Timeline: ${timeline.name}`);
    // No futuro, pode abrir um Dialog com mais detalhes
  }

  goToChapter(chapter: Chapter) {
    this.router.navigate(['/read/book', chapter.paper_id, 'chapter', chapter.order]);
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
    if (this.timelineSortBy === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.timelineSortBy = field;
      this.sortAsc = true;
    }
  }





}
