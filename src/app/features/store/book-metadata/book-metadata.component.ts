import { Component, Input } from '@angular/core';
import { paper } from '../../../models/paperTrailTypes';

@Component({
  standalone: false,
  selector: 'app-book-metadata',
  templateUrl: './book-metadata.component.html',
  styleUrl: './book-metadata.component.scss'
})
export class BookMetadataComponent {
  @Input() book!: paper;

  get maturityLabel(): string {
    switch (this.book?.maturity) {
      case 'MATURE':     return '18+';
      case 'NOT_MATURE': return 'All ages';
      case 'TEEN':       return 'Teen';
      default:           return 'Unrated';
    }
  }
}
