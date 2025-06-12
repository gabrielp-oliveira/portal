import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../error.service';
import { basicWorld, Chapter, paper, StoryLine, Timeline, world } from '../../../models/paperTrailTypes';
import { Subject, takeUntil } from 'rxjs';
import { BottomSheetService } from '../bottom-sheet.service';
import { UtilsService } from '../../../utils.service';

@Component({
  selector: 'app-top-panel',
  templateUrl: './top-panel.component.html',
  styleUrls: ['./top-panel.component.scss']
})
export class TopPanelComponent implements OnInit, OnDestroy {
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

  completedChapters = 0;
  totalChapters = 0;


  destroy$ = new Subject<void>();

  papers$ = this.wd.papers$;
  timelines$ = this.wd.timelines$;
  storylines$ = this.wd.storylines$;
  chapters$ = this.wd.chapters$;
  world$ = this.wd.world$;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private wd: WorldDataService,
    private errorHandler: ErrorService,
    private bottomSheetService: BottomSheetService,
    private util: UtilsService
  ) { }

  ngOnInit(): void {
    this.wd.world$.subscribe((a) => {
      this.basicWorld = a
    })
    this.wd.settings$.pipe(takeUntil(this.destroy$)).subscribe((status) => {
      this.isDarkMode = status.theme;
    });

    this.papers$.pipe(takeUntil(this.destroy$)).subscribe(papers => {
      this.hiddenPapersCount = -papers.filter(p => !p.visible).length;
    });
    this.chapters$.pipe(takeUntil(this.destroy$)).subscribe(chapters => {
      this.hiddenChaptersCount = -chapters.filter(p => !p.visible).length;

      this.totalChapters = chapters.length;
      this.completedChapters = chapters.filter(c => c.completed).length;
    });

    this.timelines$.pipe(takeUntil(this.destroy$)).subscribe(timelines => {
      this.hiddenTimelinesCount = -timelines.filter(p => !p.visible).length;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
