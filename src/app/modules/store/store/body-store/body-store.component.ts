import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../store.service';
import { paper, StoreFilter, world } from '../../../../models/paperTrailTypes';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';

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
    query: '',
    status: undefined,
  };

  constructor(
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const page = parseInt(params['page'], 10) || 1;
      const startIndex = (page - 1) * this.pageSize;

      this.pageIndex = page - 1;

      // ⚠️ Não alteramos os outros filtros aqui, apenas o índice

      this.filter.searchType = params['searchType'] || 'books';
      this.filter.query = params['query'] || '';
      this.filter.genre = params['genre'] || '';
      this.filter.author = params['author'] || '';
      this.filter.universe = params['universe'] || '';
      this.filter.sort = params['sort'] || 'title';
      this.filter.order = params['order'] || 'asc';
      this.filter.status = params['status'] || '';

      this.storeService.setFilter({
        ...this.filter,
        startIndex,
        quantity: this.pageSize
      });

      console.log('1', params['searchType'])
    });

    this.storeService.filter$.subscribe((filter) => {
      console.log('2', filter['searchType'])
      this.filter = {
        searchType: filter.searchType,
        query: filter.query ?? '',
        genre: filter.genre ?? '',
        author: filter.author ?? '',
        universe: filter.universe ?? '',
        sort: filter.sort,
        order: filter.order,
        quantity: filter.quantity ?? 15,
        startIndex: filter.startIndex ?? 0,
        status: filter.status ?? undefined
      };

      this.pageSize = this.filter.quantity;
      this.pageIndex = Math.floor((this.filter.startIndex || 0) / this.pageSize);

      console.log(this.filter)

      if (this.filter.searchType === 'books') {
        this.fetchBooks();
      } else {
        this.fetchUniverse();
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    const updatedFilter: StoreFilter = {
      ...this.filter,
      startIndex: this.pageIndex * this.pageSize,
      quantity: this.pageSize
    };

    this.storeService.setFilter(updatedFilter);

    // Atualiza URL com novo page
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.pageIndex + 1 },
      queryParamsHandling: 'merge'
    });
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
