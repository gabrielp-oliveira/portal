// 📁 paper-card.component.ts
import { Component, Input } from '@angular/core';
import { Chapter, paper } from '../../../models/paperTrailTypes';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { UtilsService } from '../../../utils.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ChapterDetailsComponent } from '../dialog/chapter-details/chapter-details.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

export type paperCard = {
  paper: paper,
  chapterList: Chapter[]
};

@Component({
  selector: 'app-paper-card',
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
  currentChapter: Chapter | null = null;
  expanded = false;
  isDarkMode = false;
  expandLabel = 'chapters'
  constructor(private wd: WorldDataService, private dialog: MatDialog, private router: Router,) {
    this.wd.settings$.subscribe(ss => {
      this.isDarkMode = ss.theme
    });
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

  // 🔍 Encontra o último capítulo lido (completed)
  const lastRead = [...sorted].reverse().find(ch => ch.completed);

  let nextChapter;

  if (lastRead) {
    // 📘 Busca o próximo após o último lido
    nextChapter = sorted.find(ch => ch.order > lastRead.order);
    // Se não houver próximo (todos lidos), pega o último
    if (!nextChapter) {
      nextChapter = sorted[sorted.length - 1];
    }
  } else {
    // 🚀 Nenhum lido? Começa do primeiro (order = 1)
    nextChapter = sorted.find(ch => ch.order === 1) || sorted[0];
  }

  if (nextChapter) {
    const bookId = this.paperCard.paper.id;
    const chapterOrder = nextChapter.order;
    this.router.navigate(['/read/book', bookId, 'chapter', chapterOrder]);
  }
}



  toggleExpand() {
    this.expanded = !this.expanded;
  }


  onViewDetails(chapter: any) {
    console.log('🔍 Detalhes do capítulo:', chapter);
    // Navegar ou abrir modal com os detalhes
    const data = {
      chapter,
      paper: this.wd.getPaperByChapterId(chapter.id),
      link: this.wd.getChapterLink(chapter.id)
    }

    this.dialog.open(ChapterDetailsComponent, {
      width: '400px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: data
    });

  }

  onReadChapter(chapter: any) {
    console.log('📖 Lendo capítulo:', chapter);
    // Navegar para a tela de leitura
    this.router.navigate(['/read/book', chapter.paper_id, 'chapter', chapter.order]);

  }



}
