import { Component, OnInit, OnDestroy, ViewChild, DestroyRef, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';
import { WorldDataService } from '../../../dashboard/world-data.service';
import { Chapter, description, paper } from '../../../../models/paperTrailTypes';
import { ErrorService } from '../../../../core/error.service';
import { DialogService } from '../../../../dialog/dialog.service';
import { ApiService } from '../../../../core/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs';
import { UtilsService } from '../../../../utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';



@Component({
  standalone: false,
  selector: 'app-paper-table',
  templateUrl: './paper-table.component.html',
  styleUrls: ['./paper-table.component.scss'],
})
export class PaperTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['order', 'name', 'created_at','description', 'update'];
  dataSource = new MatTableDataSource<paper>([]);

  @ViewChild(MatSort) sort!: MatSort;

  papers$: paper[];
  chapters$: Chapter[];
  sortDirection: boolean = true
  filterValues: any = {
    order: '',
    name: '',
    created_at: ''
  };
  searchInputs: any = {
    order: false,
    name: false,
    created_at: false
  };
  orderSearchValue: string = ""
  nameSearchValue: string = ""
  dateSearchValue: string = ""
  startDateSearchValue: string = ""
  endDateSearchValue: string = ""
  private destroyRef = inject(DestroyRef);
  private resizeSvgFn = (e: Event) => this.resizeSvg(e as any);
  pageWidth: number;
  constructor(
    private wd: WorldDataService,
    private router: Router,
    private utils: UtilsService,
    private api: ApiService,
    private dialog: DialogService,
    private errorHandler: ErrorService
  ) { }

  openPaperDescription(pp: paper){
    const params: description = {
      id: pp.id,
      resource_type: "paper",
      name: pp.name
    }
    this.dialog.openChapterDescription(params, '150ms','150ms')
  }
  ngOnInit() {
    this.pageWidth = window.innerWidth;
    window.addEventListener('resize', this.resizeSvgFn);

    this.wd.papers$.pipe(
      distinctUntilChanged(() => {
        const valOrder = this.orderSearchValue ==  ""
        const valName = this.nameSearchValue ==  ""
        const valDate = this.dateSearchValue ==  ""


        if(!valOrder || !valName){
          return true
        }else {
          return false
        }
      })
    )
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((p) => {
      this.dataSource.data = p
      this.papers$ = p
    })

    this.wd.chapters$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((c) => {
      this.chapters$ = c
    })
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeSvgFn);
  }

  resizeSvg(e: any){
    this.pageWidth = e.currentTarget.innerWidth
  }

  drop(event: CdkDragDrop<paper[]> | any) {
    const prevIndex = this.dataSource.data.findIndex(
      (d) => d === event.item.data
    );
    moveItemInArray(this.dataSource.data, prevIndex, event.currentIndex);
    this.dataSource._updateChangeSubscription();

    const data: paper[] = this.dataSource.data.map((pp, idx) => {
      pp.order = idx + 1
      return pp
    })
    this.api.updatePaperList(data)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((a) => {
      data.forEach((p) => {
        this.wd.updatePaper(p)
      })
    })
  }

  sortByOrder(a: paper, b: paper): number {
    if (this.sortDirection) {
      return a.order - b.order;
    } else {
      return b.order - a.order;
    }
  }
  sortByDate(a: paper, b: paper): number {
    if (this.sortDirection) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  }
  sortByName(a: paper, b: paper): number {
    if (this.sortDirection) {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  }

  callInputSearch(columnName: string) {
    this.searchInputs[columnName] = !this.searchInputs[columnName]
    if(columnName == "created_at"){
      this.dialog.openDataPickerDialog("150ms",'150ms')
    }
  }

  iconColors(p: paper){
    const color = p.color != '' ? p.color : this.utils.numberToHex(p.id)
    return { 'color': color }
  }

  searchPaper(key: string) {
    switch (key) {
      case 'order':
        let val = Number(this.orderSearchValue)
        if (val && val > 0) {
          this.dataSource.data = this.papers$.filter((a) => a.order == Number(this.orderSearchValue));
          return
        }
        this.dataSource.data = this.papers$
        return
      case 'name':
        let nameVal = this.nameSearchValue.toLowerCase();
        if (nameVal && nameVal != "") {
          this.dataSource.data = this.papers$.filter((paper: paper) =>
            paper.name.toLowerCase().includes(nameVal)
          );
          return
        }
        this.dataSource.data = this.papers$
        return
      case 'created_at':
        this.dialog.openDataPickerDialog("150ms",'150ms')
        return
      default:
        return
    }
  }

  applyFilter(trg: any, column: string) {
    const value = trg.value
    this.filterValues[column] = value;
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  sortPapers(criteria: string) {
    this.sortDirection = !this.sortDirection
    switch (criteria) {
      case 'order':
        this.dataSource.data = this.papers$.sort((a: paper, b: paper) => this.sortByOrder(a, b));
        return
      case 'created_at':
        this.dataSource.data = this.papers$.sort((a: paper, b: paper) => this.sortByDate(a, b));
        return
      case 'name':
        this.dataSource.data = this.papers$.sort((a: paper, b: paper) => this.sortByName(a, b));
        return
      default:
        this.dataSource.data = this.papers$;
        return
    }
  }

  callCreatePaperDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.openCreatePaperDialog(enterAnimationDuration, exitAnimationDuration)
  }

  paperBackgroundColor(pp: paper) {
    const color = pp.color != '' ? pp.color : this.utils.numberToHex(pp.id)
    return {
      'background-color': color,
      "filter": pp.focus ? "brightness(1.2)" : "brightness(1)",
    }
  }

  hoverPaper(pp: paper, status: boolean) {
    pp.focus = status
    const chpts = this.chapters$.filter((c) => c.paper_id == pp.id)
    chpts.forEach((c) => {
      c.focus = !c.focus
      this.wd.updateChapter(c)
    })
    this.wd.updatePaper(pp)
  }

  updatePaper(paperId: string) {
    this.dialog.openUpdatePaperDialog('150ms', '150ms', paperId)
  }
}
