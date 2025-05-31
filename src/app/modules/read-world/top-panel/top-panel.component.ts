import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../error.service';
import { Chapter, paper, StoryLine, Timeline, world } from '../../../models/paperTrailTypes';
import { Subject, takeUntil } from 'rxjs';
import { BottomSheetService } from '../bottom-sheet.service';

@Component({
  selector: 'app-top-panel',
  templateUrl: './top-panel.component.html',
  styleUrls: ['./top-panel.component.scss']
})
export class TopPanelComponent {

  @Input() world!: world;

  chapters: Chapter[]
  timelines: Timeline[]
  storyline: StoryLine[]
  papers: paper[]
  hiddenPapersCount = 0;
  hiddenChaptersCount = 0;
  hiddenTimelinesCount = 0;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private wd: WorldDataService,
    private errorHandler: ErrorService,
    private bottomSheetService: BottomSheetService
  ) {
  }

  destroy$ = new Subject<void>();

  papers$ = this.wd.papers$;
  timelines$ = this.wd.timelines$;
  storylines$ = this.wd.storylines$;
  chapters$ = this.wd.chapters$;
  world$ = this.wd.world$;
  range: number = 1

  ngOnInit(): void {
    this.wd.papers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(papers => {
        const notVisible = papers.filter(p => !p.visible).length;
        this.hiddenPapersCount = -notVisible;
      });
    this.wd.chapters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(chapter => {
        const notVisible = chapter.filter(p => !p.visible).length;
        this.hiddenChaptersCount = -notVisible;
      });
    this.wd.timelines$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tl => {
        const notVisible = tl.filter(p => !p.visible).length;
        this.hiddenTimelinesCount = -notVisible;
      });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openBottomSheet(type: 'chapters' | 'books' | 'timelines') {
    this.bottomSheetService.open(type);
  }

}
