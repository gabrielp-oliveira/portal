import { Component, Input } from '@angular/core';
import { paper } from '../../../models/paperTrailTypes';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-paper-card',
  templateUrl: './paper-card.component.html',
  styleUrl: './paper-card.component.scss'
})
export class PaperCardComponent {
  constructor(private router: Router) { }

  @Input() book: paper;

  readonly DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/defaultCover_lublod';

  goToBookPage() {
    this.router.navigate(['/store/book', this.book.id])
  }


}
