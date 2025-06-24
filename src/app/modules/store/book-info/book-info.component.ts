import { Component, Input } from '@angular/core';
import { paper } from '../../../models/paperTrailTypes';
import { FullPaper } from '../store.service';

@Component({
  selector: 'app-book-info',
  templateUrl: './book-info.component.html',
  styleUrl: './book-info.component.scss'
})
export class BookInfoComponent {
  @Input() book: FullPaper;
  @Input() worldDescription:string;
  @Input() PaperCount: number;
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';
  showFullBookDesc = false;
  showFullUniverseDesc = false;

  optimizeImage(url: string, width: number = 300): string {
    return url?.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }

}
