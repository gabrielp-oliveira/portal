import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { paperCard } from '../../../../models/paperTrailTypes';
import { PaperCardComponent } from '../../paper-card/paper-card.component';

@Component({
  standalone: true,
  selector: 'app-rw-books',
  templateUrl: './rw-books.component.html',
  styleUrls: ['./rw-books.component.scss'],
  imports: [CommonModule, FormsModule, MatIconModule, PaperCardComponent],
})
export class RwBooksComponent {
  @Input() filteredCards: paperCard[] = [];
  @Input() booksStatusFilter: 'all' | 'in_progress' | 'completed' = 'all';
  @Input() searchQuery = '';

  @Output() statusFilterChange = new EventEmitter<'all' | 'in_progress' | 'completed'>();
  @Output() searchQueryChange  = new EventEmitter<string>();

  trackByPaperId(_: number, item: { paper: { id: string } }): string { return item.paper.id; }
}
