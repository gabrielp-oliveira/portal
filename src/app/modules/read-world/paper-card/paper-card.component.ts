import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chapter, paper } from '../../../models/paperTrailTypes';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { UtilsService } from '../../../utils.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ChapterDetailsComponent } from '../dialog/chapter-details/chapter-details.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TruncatePipe } from '../../../truncate.pipe';

export type paperCard = {
  paper: paper,
  chapterList: Chapter[]
};

@Component({
  selector: 'app-paper-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    TruncatePipe,
  ],
  templateUrl: './paper-card.component.html',
  styleUrls: ['./paper-card.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({ height: '*', opacity: 1 })),
      state('collapsed', style({ height: '0px', opacity: 0 })),
      transition('expanded <=> collapsed', animate('300ms ease-in-out'))
    ])
  ]
})
export class PaperCardComponent {
  @Input() paperCard!: paperCard;
  @Input() theme: boolean | undefined;
  currentChapter: Chapter;
  expanded = false;
  isDarkMode = false;
  expandLabel = 'chapters';

  constructor(
    private wd: WorldDataService,
    private dialog: MatDialog,
    private router: Router
  ) {  }

    ngOnInit(): void {
    if(this.theme === undefined){
      this.wd.settings$.subscribe(ss => {
        this.isDarkMode = ss.theme;
      });
    }else{
      this.isDarkMode = false;
    }
  }


    DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_100,f_auto,q_auto/defaultCover_lublod';

  optimizeImage(url: string, width: number = 200): string {
    return url?.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }

  get completedCount(): number {
    return this.paperCard.chapterList.filter(ch => ch.completed).length;
  }

  get totalChapters(): number {
    return this.paperCard.chapterList.length;
  }

  get favoritesCount(): number {
    return this.paperCard.chapterList.filter(ch => ch.favorite).length;
  }

  get annotationsCount(): number {
    return this.paperCard.chapterList.reduce((acc, ch) => acc + (ch.annotations?.length || 0), 0);
  }

  continueReading() {
    if (!this.paperCard?.chapterList?.length) return;

    const chapters = [...this.paperCard.chapterList];
    const sorted = chapters.sort((a, b) => a.order - b.order);

    const lastRead = [...sorted].reverse().find(ch => ch.completed);
    let nextChapter;

    if (lastRead) {
      nextChapter = sorted.find(ch => ch.order > lastRead.order) || sorted[sorted.length - 1];
    } else {
      nextChapter = sorted.find(ch => ch.order === 1) || sorted[0];
    }

    if (nextChapter) {
      const bookId = this.paperCard.paper.id;
      const chapterOrder = nextChapter.order;
      this.router.navigate(['/read/book', bookId, 'chapter', chapterOrder]);
    }
  }

  toggleExpand() {
    console.log(this.theme)
    console.log(this.isDarkMode)
    this.expanded = !this.expanded;
  }

  onViewDetails(chapter: Chapter) {

    this.dialog.open(ChapterDetailsComponent, {
      width: '400px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: chapter.id
    });
  }

  onReadChapter(chapter: Chapter) {
    this.router.navigate(['/read/book', chapter.paper_id, 'chapter', chapter.order]);
  }
}
