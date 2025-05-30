import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../error.service';
import { Chapter, paper, StoryLine, Timeline, world } from '../../../models/paperTrailTypes';
import { Subject } from 'rxjs';

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

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private wd: WorldDataService,
    private errorHandler: ErrorService
  ) {
  }

  destroy$ = new Subject<void>();

  papers$ = this.wd.papers$;
  timelines$ = this.wd.timelines$;
  storylines$ = this.wd.storylines$;
  chapters$ = this.wd.chapters$;
  world$ = this.wd.world$;
  range: number = 1


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
