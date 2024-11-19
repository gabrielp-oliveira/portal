import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';
import { WorldDataService } from '../../../dashboard/world-data.service';
import { Chapter, Connection, GroupConnection, paper, Subway_Settings } from '../../../../models/paperTrailTypes';
import { ErrorService } from '../../../error.service';
import { DialogService } from '../../../../dialog/dialog.service';
import { ApiService } from '../../../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs';
import { UtilsService } from '../../../../utils.service';


@Component({
  selector: 'app-group-connection',
  templateUrl: './group-connection.component.html',
  styleUrl: './group-connection.component.scss'
})

export class GroupConnectionComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'update'];
  dataSource = new MatTableDataSource<GroupConnection>([]);
  connections: Connection[]
  ss: Subway_Settings | null
  @ViewChild(MatSort) sort!: MatSort;

  groups$: GroupConnection[] = [];
  chapters$: Chapter[];
  sortDirection: boolean = false
  filterValues: any = {
    order: '',
    name: '',
    created_at: ''
  };
  searchInputs: any = {
    name: false,
  };
  orderSearchValue: string = ""
  nameSearchValue: string = ""
  dateSearchValue: string = ""
  startDateSearchValue: string = ""
  endDateSearchValue: string = ""

  constructor(
    private wd: WorldDataService,
    private router: Router,
    private utils: UtilsService,
    private api: ApiService,
    private dialog: DialogService,
    private errorHandler: ErrorService
  ) { }

  opengroupDescription(pp:GroupConnection){
    this.dialog.openChapterDescription(pp, '150ms','150ms')
  }
  ngOnInit() {

    this.wd.groupConnection$.subscribe((p) => {
      this.groups$ = p
      this.dataSource.data = p
    })
    this.wd.connections$.subscribe((cnn) => this.connections = cnn)
    this.wd.settings$.subscribe((ss) => this.ss = ss)


    this.dataSource.sort = this.sort;
  }

  // Função para reorganizar os itens da tabela
  drop(event: CdkDragDrop<GroupConnection[]> | any) {
    const prevIndex = this.dataSource.data.findIndex(
      (d) => d === event.item.data
    );
    moveItemInArray(this.dataSource.data, prevIndex, event.currentIndex);
    this.dataSource._updateChangeSubscription(); // Atualiza a tabela

    const data: GroupConnection[] = this.dataSource.data.map((pp, idx) => {
      // pp.order = idx + 1
      return pp
    })
    // this.api.updatePaperList(data).subscribe((a) => {
    //   data.forEach((p) => {
    //     this.wd.updatePaper(p)
    //   })

    // })

  }




  sortByName(a: GroupConnection, b: GroupConnection): number {
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

  iconColors(p:GroupConnection){
    return {
      'color': this.utils.numberToHex(p.id),
    }
  }

  setGlobalData(data: GroupConnection[] | undefined){
    if(this.ss?.group_connection_update_chapter){
      this.wd.setGlobalConnectionGroup(data)
    }if(this.ss?.group_connection_update_chapter === false) {
      this.wd.setGlobalConnectionGroup(undefined)
  }
  }
  
  searchgroup(key: string) {
    switch (key) {
      case 'name':
        let nameVal = this.nameSearchValue.toLowerCase(); // Normalizar para minúsculas

        if (nameVal && nameVal != "") {
          const data = this.groups$.filter((gc: GroupConnection) =>
            gc.name.toLowerCase().includes(nameVal)
          );      
          this.dataSource.data = data
          this.setGlobalData(data)    
          return
        }
        this.dataSource.data = this.groups$
        this.setGlobalData(undefined)
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

  sortgroups(criteria: string) {
    this.sortDirection = !this.sortDirection
    switch (criteria) {
      case 'name':
        const data = this.groups$.sort((a: GroupConnection, b: GroupConnection) => this.sortByName(a, b));
        this.dataSource.data = data
        return
      default:
        this.dataSource.data = this.groups$;
        return
    }
  }


  callCreateGroupConnection(enterAnimationDuration: string, exitAnimationDuration: string): void {
    // this.dialog.openCreateGroupConnection(enterAnimationDuration, exitAnimationDuration)
  }


  BackgroundColor(gc: GroupConnection) {
    return {
      'background-color': gc.color,
      "filter": gc.focus ? "brightness(1.2)" : "brightness(1)",
    }
  }
 
  


  hoverGroup(gp: GroupConnection, status: boolean) {

    const cnns = this.connections.filter((cnn) => cnn.group_id == gp.id)
    
    gp.focus = status
    cnns.map((c) => {
      c.focus = status
      this.wd.updateConnection(c)
      return c
    })
  }
  updateGroup(gc: GroupConnection) {
    this.dialog.openUpdateGroupConnectionDialog(gc, '150ms', '150ms')
  }

}
