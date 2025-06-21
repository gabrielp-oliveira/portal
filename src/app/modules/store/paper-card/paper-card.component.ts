import { Component, Input } from '@angular/core';
import { paper } from '../../../models/paperTrailTypes';

@Component({
  selector: 'app-paper-card',
  templateUrl: './paper-card.component.html',
  styleUrl: './paper-card.component.scss'
})
export class PaperCardComponent {


@Input() book: paper;

defaultCover = 'assets/defaultCover.png'; // ou o caminho que você estiver usando
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  optimizeImage(url: string, width: number = 300): string {
  return url?.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
}


}
