import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';
import { WorldDataService } from '../../../dashboard/world-data.service';
import { Chapter, paper, StoryLine, Timeline } from '../../../../models/paperTrailTypes';
import { ErrorService } from '../../../error.service';
import { DialogService } from '../../../../dialog/dialog.service';
import { ApiService } from '../../../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, distinctUntilChanged,  } from 'rxjs';
import { PapperComponent } from '../papper/papper.component';


interface ExtendedChapter extends Chapter {
  papperName: string,
  timelineName: string,
  storylineName: string,
  // eventName:string
}

interface allData {
  timelines: Timeline[];
  storyLines: StoryLine[];
  chapters: Chapter[];
  papers: paper[];
}


@Component({
  selector: 'app-chapter',
  templateUrl: './chapter.component.html',
  styleUrl: './chapter.component.scss'
})
export class ChapterComponent implements OnInit {
  displayedColumns: string[] = ['order', 'name', 'created_at',  'papperName', "timelineName", 'storylineName','description', 'update', 'open'];
  dataSource = new MatTableDataSource<ExtendedChapter>([]);

  @ViewChild(MatSort) sort!: MatSort;

  chapter$: ExtendedChapter[];
  paper$: paper[];
  isDrag: boolean = true;
  sortDirection: boolean = true

  sortCriteria:string = "sort"

  filterValues: any = {
    order: '',
    name: '',
    created_at: '',
    papperName: '',
    timelineName: '',
    // eventName: '',
    storylineName: ''
  };
  searchInputs: any = {
    order: false,
    name: false,
    // eventName: false,
    created_at: false,
    papperName: false,
    timelineName: false,
    storylineName: false

  };



  orderSearchValue: string = ""
  nameSearchValue: string = ""
  dateSearchValue: string = ""
  papperNameSearchValue:String = ""
  timelineNameSearchValue:String = ""
  // eventNameSearchValue:String = ""
  storylineNameSearchValue:String = ""

  startDateSearchValue: string = ""
  endDateSearchValue: string = ""

  constructor(
    private wd: WorldDataService,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private dialog: DialogService,
    private errorHandler: ErrorService
  ) { }

  openChapter(papperId: string){
    const url = `/world/${this.wd.worldId}/chapter/${papperId}`;
    window.open(url, '_blank');
   }

   openDescription(c:Chapter){
    this.dialog.openChapterDescription(c, '150ms','150ms')
   }
  compareUpdates(): boolean {
    const valOrder = this.orderSearchValue ==  ""
    const valName = this.nameSearchValue ==  ""
    const valDate = this.dateSearchValue ==  ""
    const valPaperName = this.papperNameSearchValue == ""
    const valTlName = this.timelineNameSearchValue == ""
    // const valEvtName = this.eventNameSearchValue == ""
    const valStName = this.storylineNameSearchValue == ""
    
    const searchCondition = !valOrder || !valName || !valPaperName || !valTlName || !valStName
    const sortCondition =  (this.sortCriteria !== "order" && !this.sortDirection) || (this.sortCriteria !== "order" && !this.sortDirection)
    if(searchCondition || sortCondition ){
      return true
    }else {
      return false
    }
    
  }

  iconColors(c:Chapter){
    return {
      'color': this.numberToRGB(c.paper_id),
    }
  }
  ngOnInit() {


    combineLatest({
      "timelines": this.wd.timelines$, "storyLines": this.wd.storylines$,
      "chapters": this.wd.chapters$, "papers": this.wd.papers$, "events": this.wd.events$
    })
    .pipe(
      distinctUntilChanged(() => this.compareUpdates())
    )
    .subscribe((data) => {
      let { chapters, papers, storyLines, timelines, events } = data

      const chp:ExtendedChapter[] = chapters.map((c) => {
        const data:any = c
        const cht:ExtendedChapter = data
        
        const pp = papers.find((pp) => pp.id == c.paper_id)
        cht.papperName = pp?.name || ''

        const stl = storyLines.find((pp) => pp.id == c.storyline_id)
        cht.storylineName = stl?.name?stl.name:  ''
        
        const tl = timelines.find((pp) => pp.id == c.timeline_id)
        cht.timelineName = tl?.name || ''

        // const evt = events.find((ev) => ev.id == c.event_Id)
        // cht.eventName = evt?.name || ''
        
        
        return cht
      })

      this.dataSource.data =this.returnSortChapters(this.sortCriteria, chp)
      this.chapter$ =this.returnSortChapters(this.sortCriteria, chp)
    })
    

    this.dataSource.sort = this.sort;

  }

  // Função para reorganizar os itens da tabela
  drop(event: CdkDragDrop<Chapter[]> | any) {
    if(!this.isDrag){
      return 
    }
    const prevIndex = this.dataSource.data.findIndex(
      (d) => d === event.item.data
    );
    moveItemInArray(this.dataSource.data, prevIndex, event.currentIndex);
    this.dataSource._updateChangeSubscription(); // Atualiza a tabela

    const data: Chapter[] = this.dataSource.data.map((pp, idx) => {
      pp.order = idx + 1
      return pp
    })
    this.api.updateChapterList(data).subscribe((a) => {
      data.forEach((c) => {
        this.wd.updateChapter(c)
      })

    })

  }


  sortByOrder(a: Chapter, b: Chapter): number {
    if (this.sortDirection) {
      return a.order - b.order;
    } else {
      return b.order - a.order;
    }
  }
  sortByDate(a: Chapter, b: Chapter): number {
    if (this.sortDirection) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  }
  sortByName(a: Chapter, b: Chapter): number {
    if (this.sortDirection) {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  }
  sortByPapperName(a: ExtendedChapter, b: ExtendedChapter): number {
    if (this.sortDirection) {
      return a.papperName.localeCompare(b.papperName)
    } else {
      return b.papperName.localeCompare(a.papperName)
    }
  }
  sortByTimelineName(a: ExtendedChapter, b: ExtendedChapter): number {
    if (this.sortDirection) {
      return a.timelineName.localeCompare(b.timelineName)
    } else {
      return b.timelineName.localeCompare(a.timelineName)
    }
  }
  sortBystoryLineName(a: ExtendedChapter, b: ExtendedChapter): number {
    if (this.sortDirection) {
      return a.storylineName.localeCompare(b.storylineName)
    } else {
      return b.storylineName.localeCompare(a.storylineName)
    }
  }

  callInputSearch(columnName: string) {
    this.searchInputs[columnName] = !this.searchInputs[columnName]
    if(columnName == "created_at"){
      this.dialog.openDataPickerDialog("150ms",'150ms')
    }
  }
  searchChapter(key: string) {
    switch (key) {
      case 'order':
        let val = Number(this.orderSearchValue)
        if (val && val > 0) {
          this.dataSource.data = this.dataSource.data.filter((a) => a.order == Number(this.orderSearchValue));
          return
        }
        this.dataSource.data = this.chapter$
        return
      case 'name':
        let nameVal = this.nameSearchValue.toLowerCase(); // Normalizar para minúsculas
        if (nameVal && nameVal != "") {
          this.dataSource.data = this.dataSource.data.filter((c: Chapter) =>
            c.name.toLowerCase().includes(nameVal)
          );          
          return
        }
        this.dataSource.data = this.chapter$
        return
      case 'papperName':
        let papperName = this.papperNameSearchValue.toLowerCase(); // Normalizar para minúsculas
        if (papperName && papperName != "") {
          this.dataSource.data = this.dataSource.data.filter((c) =>
            c.papperName?.toLowerCase().includes(papperName)
          );          
          return
        }
        this.dataSource.data = this.chapter$
        return
      case 'storylineName':
        let storylineName = this.storylineNameSearchValue.toLowerCase(); // Normalizar para minúsculas
        if (storylineName && storylineName != "") {
          this.dataSource.data = this.dataSource.data.filter((c) =>
            c.storylineName?.toLowerCase().includes(storylineName)
          );          
          return
        }
        this.dataSource.data = this.chapter$
        return
      case 'timelineName':
        let timelineName = this.timelineNameSearchValue.toLowerCase(); // Normalizar para minúsculas
        if (timelineName && timelineName != "") {
          this.dataSource.data = this.dataSource.data.filter((c) =>
            c.timelineName?.toLowerCase().includes(timelineName)
          );          
          return
        }
        this.dataSource.data = this.chapter$
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

  sortChapters(criteria: string) {
    this.sortDirection = !this.sortDirection
    this.sortCriteria = criteria


    this.dataSource.data = this.returnSortChapters(criteria, this.dataSource.data)
    return
  }

  returnSortChapters(criteria: string, data:ExtendedChapter[]) {
    switch (criteria) {
      case 'order':
        this.isDrag = true
        return data.sort((a: ExtendedChapter, b: ExtendedChapter) => this.sortByOrder(a, b));
        case 'date':
        this.isDrag = false
        return data.sort((a: ExtendedChapter, b: ExtendedChapter) => this.sortByDate(a, b));
        case 'name':
        this.isDrag = false
        return data.sort((a: ExtendedChapter, b: ExtendedChapter) => this.sortByName(a, b));
        case 'papperName':
        this.isDrag = false
        return data.sort((a: ExtendedChapter, b: ExtendedChapter) => this.sortByPapperName(a, b));
        case 'timelineName':
        this.isDrag = false
        return data.sort((a: ExtendedChapter, b: ExtendedChapter) => this.sortByTimelineName(a, b));
        case 'storylineName':
        this.isDrag = false
        return data.sort((a: ExtendedChapter, b: ExtendedChapter) => this.sortBystoryLineName(a, b));
        default:
        this.isDrag = false
        return data;
    }
  }




  callCreteChapterDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.openCreateChapterDialog(enterAnimationDuration, exitAnimationDuration)
  }


  chapterBackgroundColor(c: Chapter) {
    return {
      'background-color': this.numberToRGB(c.paper_id),
      "filter": c.focus ? "brightness(1.2)" : "brightness(1)",
    }
  }

  numberToRGB(id: string): string {
    // Converte o ID em um número baseado nos caracteres do ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    // Garante que o hash seja positivo
    hash = Math.abs(hash);
  
    // Extrai valores de R, G, B a partir do hash
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = (hash & 0x0000FF);
  
    return `rgb(${r}, ${g}, ${b})`;
  }
  


  hoverChapter(pp: Chapter) {
    pp.focus = !!!pp.focus

    this.wd.updateChapter(pp)
  }
  updateChapter(chpId: string) {
    this.dialog.openUpdateChapterDialog('150ms', '150ms', chpId)
  }

}
