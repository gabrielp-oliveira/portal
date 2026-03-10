import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DetailsItem, PaginatedMeta, paperCard } from '../../../../models/paperTrailTypes';

@Component({
  standalone: true,
  selector: 'app-rw-notes',
  templateUrl: './rw-notes.component.html',
  styleUrls: ['./rw-notes.component.scss'],
  imports: [CommonModule, FormsModule, MatIconModule, DatePipe],
})
export class RwNotesComponent {
  @Input() detailsItems: DetailsItem[] = [];
  @Input() detailsMeta: PaginatedMeta | null = null;
  @Input() detailsLoading = false;
  @Input() detailsLoaded = false;
  @Input() annotationQuery = '';
  @Input() annotationFilter: 'all' | 'favorites' = 'all';
  @Input() annotationBook = 'all';
  @Input() annotationSort: 'newest' | 'oldest' | 'book' = 'newest';
  @Input() paperCardList: paperCard[] = [];

  @Output() annotationQueryChange  = new EventEmitter<string>();
  @Output() annotationFilterChange = new EventEmitter<'all' | 'favorites'>();
  @Output() annotationBookChange   = new EventEmitter<string>();
  @Output() annotationSortChange   = new EventEmitter<'newest' | 'oldest' | 'book'>();
  @Output() loadMore               = new EventEmitter<void>();
  @Output() navigate               = new EventEmitter<{ paperId: string; order: number }>();

  formatCappedTotal(total: number): string {
    return total >= 500 ? '500+' : String(total);
  }

  trackByDetailItem(_: number, item: DetailsItem): string { return item.annotation.id; }
  trackByPaperId(_: number, item: { paper: { id: string } }): string { return item.paper.id; }
}
