import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../store.service';
import { paper, StoreFilter, world } from '../../../../models/paperTrailTypes';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-store-body',
  templateUrl: './body-store.component.html',
  styleUrls: ['./body-store.component.scss']
})
export class BodyStoreComponent implements OnInit {
  pagedPapers: paper[] = [];
  pagedWorlds: world[] = [];
  totalElements = 0;
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  pageSize = 15;
  pageIndex = 0;

  filter: StoreFilter = {
    searchType: 'books',
    quantity: 15,
    startIndex: 0,
    sort: 'title',
    order: 'asc',
    query: ''
  };

  constructor(private storeService: StoreService) {}

ngOnInit(): void {
  this.storeService.filter$.subscribe((filter) => {
    this.filter = {
      searchType: filter.searchType ?? 'books',
      query: filter.query ?? '',
      genre: filter.genre ?? '',
      author: filter.author ?? '',
      universe: filter.universe ?? '',
      sort: filter.sort ?? 'title',
      order: filter.order ?? 'asc',
      quantity: filter.quantity ?? 15,
      startIndex: filter.startIndex ?? 0
    };

    this.pageIndex = this.filter?.startIndex || 1 / (this.filter?.quantity || 1);
    this.pageSize = this.filter?.quantity;
    if(filter.searchType == 'books'){
      this.fetchBooks();
    }else{
      this.fetchUniverse()
    }
  });
}

  // Quando usuário troca de página ou quantidade
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    const updatedFilter = {
      ...this.filter,
      startIndex: this.pageIndex * this.pageSize,
      quantity: this.pageSize
    };

    this.storeService.setFilter(updatedFilter); // ✅ isso dispara nova chamada via filter$
  }

  fetchBooks(): void {
    this.storeService.getBooks(this.filter).subscribe((res) => {
      this.pagedPapers = res.papers;
      this.totalElements = res.total;
    });
  }
  fetchUniverse(): void {
    this.storeService.getUniverses(this.filter).subscribe((res) => {
      this.pagedWorlds = res.worlds;
      this.totalElements = res.total;
    });
  }
  optimizeImage(url: string, width: number = 300): string {
  return url?.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
}


}
