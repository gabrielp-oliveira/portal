import { Component, Input } from '@angular/core';
import { paper } from '../../../models/paperTrailTypes';

@Component({
  selector: 'app-book-metadata',
  templateUrl: './book-metadata.component.html',
  styleUrl: './book-metadata.component.scss'
})
export class BookMetadataComponent {
 @Input() book: paper;

}
