import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-chapter-details',
  templateUrl: './chapter-details.component.html',
  styleUrl: './chapter-details.component.scss'
})
export class ChapterDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<ChapterDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  tabs = ['resumo', 'timeline', 'anotacoes', 'conexoes'];

  close() {
    this.dialogRef.close();
  }

    selectedTab: string = 'resumo';


  chapter = {
    title: 'Capítulo 4: O Segredo de Beth',
    book: 'Little Women',
    summary: `Beth enfrenta um desafio pessoal quando, após cuidar de um bebê doente da vizinhança, ela contrai escarlatina. A doença de Beth preocupa profundamente sua família, enquanto um intenso cuidado de todos se faz necessário.`,
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Little_Women_1868.djvu/page1-800px-Little_Women_1868.djvu.jpg',
    timeline: {
      name: 'Infância das March',
      range: 2,
      ordem: 4,
    },
    comments: [
      'Muito emocionante.',
      'Podia ter mais detalhes sobre a mãe.'
    ]
  };

}
