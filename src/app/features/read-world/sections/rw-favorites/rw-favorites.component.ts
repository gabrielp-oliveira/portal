import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FavoriteItem, PaginatedMeta, paperCard } from '../../../../models/paperTrailTypes';

@Component({
  standalone: true,
  selector: 'app-rw-favorites',
  templateUrl: './rw-favorites.component.html',
  styleUrls: ['./rw-favorites.component.scss'],
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule],
})
export class RwFavoritesComponent {
  @Input() favoriteItems: FavoriteItem[] = [];
  @Input() favoritesMeta: PaginatedMeta | null = null;
  @Input() favoritesLoading = false;
  @Input() favoritesLoaded = false;
  @Input() favSearch = '';
  @Input() favBookFilter = 'all';
  @Input() paperCardList: paperCard[] = [];

  @Output() favSearchChange     = new EventEmitter<string>();
  @Output() favBookFilterChange = new EventEmitter<string>();
  @Output() loadMore            = new EventEmitter<void>();
  @Output() navigate            = new EventEmitter<{ paperId: string; order: number }>();
  @Output() resetSearch         = new EventEmitter<void>();

  get favIsFiltering(): boolean {
    return !!this.favSearch.trim() || this.favBookFilter !== 'all';
  }

  formatCappedTotal(total: number): string {
    return total >= 500 ? '500+' : String(total);
  }

  trackByFavItem(_: number, item: FavoriteItem): string { return item.chapter_id; }
  trackByPaperId(_: number, item: { paper: { id: string } }): string { return item.paper.id; }
}
