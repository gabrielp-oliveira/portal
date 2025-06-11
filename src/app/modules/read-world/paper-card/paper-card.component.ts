// 📁 paper-card.component.ts
import { Component, Input } from '@angular/core';
import { Chapter, paper } from '../../../models/paperTrailTypes';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { UtilsService } from '../../../utils.service';

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
  constructor(private util: UtilsService) {
    this.util.theme$.subscribe(theme => {
      this.isDarkMode = theme
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
    const lastRead = [...this.paperCard.chapterList].reverse().find(ch => ch.completed);
    console.log('Continue reading from:', lastRead);
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }


onViewDetails(chapter: any) {
  console.log('🔍 Detalhes do capítulo:', chapter);
  // Navegar ou abrir modal com os detalhes
}

onReadChapter(chapter: any) {
  console.log('📖 Lendo capítulo:', chapter);
  // Navegar para a tela de leitura
}


}
