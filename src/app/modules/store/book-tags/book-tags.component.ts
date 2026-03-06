import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-book-tags',
  templateUrl: './book-tags.component.html',
  styleUrl: './book-tags.component.scss'
})
export class BookTagsComponent {
   @Input() tags: any;
}
