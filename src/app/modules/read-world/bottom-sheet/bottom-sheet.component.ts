import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ErrorService } from '../../error.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Chapter, paper, Timeline } from '../../../models/paperTrailTypes';
import { Subject, takeUntil, take } from 'rxjs';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent implements OnDestroy {
  search = '';
  displayedChaptersColumns = ['visible', 'title', 'order', 'read', 'actions'];
  displayedPaperColumns = ['visible', 'name', 'order', 'read', 'actions'];
  displayedtimelinesColumns = ['visible', 'name', 'order','actions'];
  chapters: Chapter[] = [];
  timelines: Timeline[] = [];
  papers: paper[] = [];
  chapterSortBy: 'title' | 'order' = 'order';
  paperSortBy: 'name' | 'order' = 'order';
  timelineSortBy: 'name' | 'order' = 'order';
  sortAsc: boolean = true;

  destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { type: string },
    private route: ActivatedRoute,
    private router: Router,
    public wd: WorldDataService,
    private errorHandler: ErrorService
  ) { }

  ngOnInit() {
    this.wd.chapters$
      .subscribe({
        next: (chapters) => {
          this.chapters = chapters;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
    this.wd.timelines$
      .subscribe({
        next: (timeline) => {
          this.timelines = timeline;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
    this.wd.papers$
      .subscribe({
        next: (papers) => {
          this.papers = papers;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  onChapterVisibilityToggle(chapter: Chapter) {
    this.wd.updateChapter(chapter)
  }
  onPaperVisibilityToggle(paper: paper) {
    this.chapters.forEach((chp) => {
      if (chp.paper_id == paper.id) {
        chp.visible = paper.visible
        this.wd.updateChapter(chp)
      }
    })
    this.wd.updatePaper(paper)
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



}
