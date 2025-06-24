import { Component, Input } from '@angular/core';
import { paper } from '../../../models/paperTrailTypes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paper-card',
  templateUrl: './paper-card.component.html',
  styleUrl: './paper-card.component.scss'
})
export class PaperCardComponent {
  constructor(private router: Router) { }

  @Input() book: paper;

  defaultCover = 'assets/defaultCover.png'; // ou o caminho que você estiver usando
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  optimizeImage(url: string, width: number = 300): string {
    return url?.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }

  goToBookPage() {
    this.router.navigate(['/store/book', this.book.id])
  }


}
