import { Component } from '@angular/core';
import { StoreFilter } from '../../../models/paperTrailTypes';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent {
  currentFilters: StoreFilter = {
    searchType: 'books',
    query: '',
    genre: '',
    author: '',
    universe: '',
    sort: 'name',
    order: 'asc',
    quantity: 0
  };

  onFilterChange(filters: StoreFilter) {
    this.currentFilters = filters;
  }
}
