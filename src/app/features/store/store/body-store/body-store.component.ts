import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService, CatalogBooksResponse, CatalogUniversesResponse } from '../../store.service';
import { paper, StoreFilter, world } from '../../../../models/paperTrailTypes';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

// Limites máximos por tipo para controlar peso de imagens:
// books:     15 por página × 1 imagem  = 15 imagens
// universes:  6 por página × 3 imagens = 18 imagens
const LIMIT_BOOKS     = 15;
const LIMIT_UNIVERSES = 6;

@Component({
  standalone: false,
  selector: 'app-store-body',
  templateUrl: './body-store.component.html',
  styleUrls: ['./body-store.component.scss']
})
export class BodyStoreComponent implements OnInit, OnDestroy {
  pagedPapers: paper[] = [];
  pagedWorlds: world[] = [];
  totalElements = 0;
  loading = false;
  loadError = false;

  pageSize  = LIMIT_BOOKS;
  pageIndex = 0;

  filter: StoreFilter = {
    searchType: 'books',
    page:  1,
    limit: LIMIT_BOOKS,
    sort:  'name',
    order: 'asc',
  };

  private destroy$ = new Subject<void>();

  constructor(
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // filter$ é a única fonte de verdade. switchMap cancela requests anteriores automaticamente.
    this.storeService.filter$.pipe(
      takeUntil(this.destroy$),
      switchMap(filter => {
        const typeChanged = filter.searchType !== this.filter.searchType;

        this.pageSize = filter.searchType === 'universes' ? LIMIT_UNIVERSES : LIMIT_BOOKS;
        this.filter = { ...filter, limit: this.pageSize, page: filter.page ?? 1 };

        if (typeChanged) {
          this.pageIndex   = 0;
          this.filter.page = 1;
          this.pagedPapers = [];
          this.pagedWorlds = [];
        } else {
          this.pageIndex = (this.filter.page ?? 1) - 1;
        }

        this.totalElements = 0;
        this.loadError     = false;
        this.loading       = true;

        return this.storeService.getCatalog(this.filter);
      })
    ).subscribe({
      next: res => this.applyResult(res),
      error: () => { this.loading = false; this.loadError = true; }
    });
  }

  ngOnDestroy(): void {
    this.storeService.setCatalogTotal(null);
    this.destroy$.next();
    this.destroy$.complete();
  }

  get skeletonItems(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }

  trackById(_: number, item: { id: string }): string { return item.id; }

  onPageChange(event: PageEvent): void {
    this.pageIndex    = event.pageIndex;
    this.filter.page  = this.pageIndex + 1;
    this.filter.limit = this.pageSize;

    // Atualiza a URL sem mexer no filter$ (evita reset de página pelo topPanel)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.filter.page },
      queryParamsHandling: 'merge'
    });

    // Fetch direto sem passar pelo setFilter para não disparar novo ciclo no switchMap
    this.loading   = true;
    this.loadError = false;
    this.storeService.getCatalog(this.filter).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => this.applyResult(res),
      error: () => { this.loading = false; this.loadError = true; }
    });
  }

  private applyResult(res: CatalogBooksResponse | CatalogUniversesResponse): void {
    if (res.type === 'books') {
      this.pagedPapers = (res as CatalogBooksResponse).papers;
      this.pagedWorlds = [];
    } else {
      this.pagedWorlds = (res as CatalogUniversesResponse).worlds;
      this.pagedPapers = [];
    }
    this.totalElements = res.total;
    this.loading       = false;
    this.loadError     = false;
    this.storeService.setCatalogTotal(res.total);
  }

  retry(): void {
    this.loadError = false;
    this.loading   = true;
    this.storeService.getCatalog(this.filter).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => this.applyResult(res),
      error: () => { this.loading = false; this.loadError = true; }
    });
  }
}
