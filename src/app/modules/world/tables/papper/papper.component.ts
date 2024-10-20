import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';
import { WorldDataService } from '../../../dashboard/world-data.service';
import { Chapter, paper } from '../../../../models/paperTrailTypes';
import { ErrorService } from '../../../error.service';
import { DialogService } from '../../../../dialog/dialog.service';
import { ApiService } from '../../../api.service';
import { ActivatedRoute, Router } from '@angular/router';

export interface Person {
  name: string;
  age: number;
}

const ELEMENT_DATA: Person[] = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 },
  { name: 'David', age: 40 },
];

@Component({
  selector: 'app-papper',
  templateUrl: './papper.component.html',
  styleUrls: ['./papper.component.scss'],
})
export class PapperComponent implements OnInit {
  displayedColumns: string[] = ['order', 'name', 'created_at', 'update'];
  dataSource = new MatTableDataSource<paper>([]);

  @ViewChild(MatSort) sort!: MatSort;

  papers$: paper[];
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

  constructor(
    private wd: WorldDataService,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private dialog: DialogService,
    private errorHandler: ErrorService
  ) { }

  ngOnInit() {

    this.wd.papers$.subscribe((p) => {
      this.dataSource.data = p
      this.papers$ = p
    })

    this.dataSource.sort = this.sort;
  }

  // Função para reorganizar os itens da tabela
  drop(event: CdkDragDrop<Person[]> | any) {
    const prevIndex = this.dataSource.data.findIndex(
      (d) => d === event.item.data
    );
    moveItemInArray(this.dataSource.data, prevIndex, event.currentIndex);
    this.dataSource._updateChangeSubscription(); // Atualiza a tabela

    const data: paper[] = this.dataSource.data.map((pp, idx) => {
      pp.order = idx + 1
      return pp
    })
    this.api.updatePaperList(data).subscribe((a) => {
      data.forEach((p) => {
        this.wd.updatePaper(p)
      })

    })

  }


  sortByOrder(a: paper, b: paper): number {
    console.log(this.sortDirection)
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
  }
  searchPapper(key: string) {
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
        let nameVal = this.nameSearchValue.toLowerCase(); // Normalizar para minúsculas

        if (nameVal && nameVal != "") {
          this.dataSource.data = this.papers$.filter((paper: paper) =>
            paper.name.toLowerCase().includes(nameVal)
          );          
          return
        }
        this.dataSource.data = this.papers$
        return
      case 'created_at':
        console.log(this.dateSearchValue)
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
      case 'date':
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


  papperBackgroundColor(pp: paper) {
    return {
      'background-color': this.numberToRGB(pp.created_at),
      "filter": pp.focus ? "brightness(1.2)" : "brightness(1)",
    }
  }

  numberToRGB(dateString: string): string {
    // Converte a string da data em um número baseado nos caracteres da data
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Garante que o hash seja positivo
    hash = Math.abs(hash);

    // Extrai valores de R, G, B a partir do hash
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = (hash & 0x0000FF);

    return `rgb(${r}, ${g}, ${b})`;
  }


  hoverPappeer(pp: paper) {
    pp.focus = !!!pp.focus

    this.wd.updatePaper(pp)
  }
  updatePaper(papperId: string) {
    this.dialog.openUpdatePaperrDialog('150ms', '150ms', papperId)
  }

}
