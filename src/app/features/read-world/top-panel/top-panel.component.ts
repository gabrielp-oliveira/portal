import { Component, Input, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../../core/error.service';
import { basicWorld, Chapter, paper, StoryLine, Timeline, world } from '../../../models/paperTrailTypes';
import { BottomSheetService } from '../bottom-sheet.service';
import { UtilsService } from '../../../utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-top-panel',
  templateUrl: './top-panel.component.html',
  styleUrls: ['./top-panel.component.scss'],
  imports: [CommonModule, MatIconModule, MatTooltipModule],
})
export class TopPanelComponent implements OnInit {
  @Input() world!: world;

  basicWorld: basicWorld | null
  chapters: Chapter[] = [];
  timelines: Timeline[] = [];
  storyline: StoryLine[] = [];
  papers: paper[] = [];
  hiddenPapersCount = 0;
  hiddenChaptersCount = 0;
  hiddenTimelinesCount = 0;
  isDarkMode = false;
  filtersInfoOpen = false;

  completedChapters = 0;
  totalChapters = 0;

  private destroyRef = inject(DestroyRef);

  papers$ = this.wd.papers$;
  timelines$ = this.wd.timelines$;
  storylines$ = this.wd.storylines$;
  chapters$ = this.wd.chapters$;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private wd: WorldDataService,
    private errorHandler: ErrorService,
    private bottomSheetService: BottomSheetService,
    private util: UtilsService
  ) { }

  ngOnInit(): void {
    this.wd.world$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(a => {
        this.basicWorld = a;
      });
    this.wd.settings$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(status => {
      this.isDarkMode = !status.theme;
    });

    this.papers$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(papers => {
      this.hiddenPapersCount = -papers.filter(p => !p.visible).length;
    });
    this.chapters$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(chapters => {
      this.hiddenChaptersCount = -chapters.filter(p => !p.visible).length;

      this.totalChapters = chapters.length;
      this.completedChapters = chapters.filter(c => c.completed).length;
    });

    this.timelines$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(timelines => {
      this.hiddenTimelinesCount = -timelines.filter(p => !p.visible).length;
    });
  }

  openBottomSheet(type: 'chapters' | 'books' | 'timelines') {
    this.bottomSheetService.open(type);
  }

  clearFilters() {
    this.wd.updateAllPapersVisible();
    this.wd.updateAllChaptersVisible();
    this.wd.updateAllTimelinesVisible();
  }
}
