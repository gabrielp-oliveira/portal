import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';
import { WorldDataService } from '../../../dashboard/world-data.service';
import { Chapter, paper, StoryLine, Subway_Settings, ExtendedChapter, Timeline } from '../../../../models/paperTrailTypes';
import { ErrorService } from '../../../error.service';
import { DialogService } from '../../../../dialog/dialog.service';
import { ApiService } from '../../../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, distinctUntilChanged,  } from 'rxjs';
import { PapperComponent } from '../papper/papper.component';
import { UtilsService } from '../../../../utils.service';






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
  settings: Subway_Settings | null;
  isDrag: boolean = true;
  sortDirection: boolean = true

  sortCriteria:string = "sort"
  @ViewChild('circle') circle: ElementRef;

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

  gridHeight = 50


  orderSearchValue: string = ""
  nameSearchValue: string = ""
  timelines: Timeline[] = []
  storylines: StoryLine[] = []
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
    private utils: UtilsService,
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
      'color': c.color ==''? this.utils.numberToHex(c.paper_id): c.color,
    }
  }
  ngOnInit() {


    combineLatest({
      "timelines": this.wd.timelines$, "storyLines": this.wd.storylines$,
      "chapters": this.wd.chapters$, "papers": this.wd.papers$, "events": this.wd.events$,
      "ss":this.wd.settings$
    })
    .pipe(
      distinctUntilChanged(() => this.compareUpdates())
    )
    .subscribe((data) => {
      let { chapters, papers, storyLines, timelines, ss } = data

      this.settings = ss
      const chp:ExtendedChapter[] = chapters.map((c) => {
        const data:any = c
        const cht:ExtendedChapter = data
        
        const pp = papers.find((pp) => pp.id == c.paper_id)
        cht.papperName = pp?.name || ''
        cht.papperOrder = pp?.order || 1
        const stl = storyLines.find((pp) => pp.id == c.storyline_id)
        cht.storylineName = stl?.name?stl.name:  ''
        this.storylines = storyLines
        const tl = timelines.find((pp) => pp.id == c.timeline_id)
        cht.timelineName = tl?.name || ''
        this.timelines = timelines

        // const evt = events.find((ev) => ev.id == c.event_Id)
        // cht.eventName = evt?.name || ''
        
        
        return cht
      })

      this.dataSource.data =this.returnSortChapters(this.sortCriteria, chp)
      this.chapter$ = this.returnSortChapters(this.sortCriteria, chp)
    })
    

    this.dataSource.sort = this.sort;

  }

  
  onDragMoved(a: CdkDragDrop<Chapter[]> | any) {
    if (a.event.target.id !== 'tableChapter') {

      const targetEl = (a.event.target);  // Exibe todo o objeto do evento para referência

      const subwayElement = document.getElementById('subway'); // Obtém o elemento com o ID #subway

// Verifica se o subwayElement contém o targetElement como filho
    if (subwayElement && subwayElement.contains(targetEl)) {
      const circleElement = this.circle.nativeElement;
      circleElement.style.display = 'block';     
      circleElement.style.backgroundColor =  this.utils.numberToHex(a.source.data.paper_id);
      circleElement.style.top = a.event.clientY +10 + "px";
      circleElement.style.left = a.event.clientX +10 + "px";
      }
    } else {
      const circleElement = this.circle.nativeElement;
      circleElement.style.display = 'none';
    }
  }

  getTimelineAndAdjustedRange(xPosition: number): { timeline: Timeline, adjustedRange: number } | undefined {
    const RANGE_MULTIPLIER = 20;
    let accumulatedX = 100;
  
    for (const timeline of this.timelines.sort((a, b) => a.order - b.order)) {
        // Calcula a largura do timeline atual
        const timelineWidth =  (timeline.range ) * RANGE_MULTIPLIER;
  
        // Checa se xPosition está dentro do intervalo acumulado para o timeline atual
        if (xPosition >= accumulatedX && xPosition < accumulatedX + timelineWidth) {
            // Calcular o range ajustado necessário para manter o capítulo na mesma posição
            const offsetWithinTimeline = xPosition - accumulatedX;
            let adjustedRange = Math.floor((offsetWithinTimeline) / RANGE_MULTIPLIER);
            adjustedRange = adjustedRange <= 0? 1 : adjustedRange
            return {
                timeline,
                adjustedRange
            };
        }
  
        // Atualiza o acumulado para o próximo intervalo
        accumulatedX += timelineWidth;
    }
    
    // Se xPosition estiver fora do intervalo de todos os timelines
    return undefined;
  }
  
  private findStorylineForChapter( y: number): StoryLine {
    let range = Math.round((y - 50) / this.gridHeight)
    if (range >= this.storylines.length - 1) {
      range = this.storylines.length - 1
    }
    const str = this.storylines.filter((s) => s.order == (range + 1))
    return str[0];
  }



  
  // Função para reorganizar os itens da tabela
  drop(event: CdkDragDrop<Chapter[]> | any) {
    const circleElement = this.circle.nativeElement;
    circleElement.style.display = 'none'; // Exemplo: muda a cor de fundo
    const targetEl = (event.event.target);  // Exibe todo o objeto do evento para referência

    const subwayElement = document.getElementById('subway'); // Obtém o elemento com o ID #subway

    if (subwayElement && subwayElement.contains(targetEl)) {

      const chapter :Chapter= event.item.data
      const tl = this.getTimelineAndAdjustedRange(event.dropPoint.x)
      
      
      const x = event.event.clientX - subwayElement.getBoundingClientRect().left;
      const y = event.event.clientY - subwayElement.getBoundingClientRect().top;
      
      const str = this.findStorylineForChapter( y);
      
      console.log(str)
      chapter.storyline_id = str.id
      chapter.timeline_id = tl?.timeline.id || ''
      chapter.range= tl?.adjustedRange || 0
      console.log(tl?.adjustedRange)
      this.api.updateChapter(chapter.id, chapter).subscribe((c) => {
        this.wd.updateChapter(c)
      })
      console.log(tl)
      console.log(chapter)



    } 

    if (!this.isDrag) {
      return;
    }
    // Identifica o `paperId` do capítulo que está sendo movido
    const draggedChapter = event.item.data;
    const paperId = draggedChapter.paper_id;
  
    // Filtra os capítulos que pertencem ao mesmo `paper`
    const chaptersInSamePaper = this.dataSource.data.filter(
      (chapter) => chapter.paper_id === paperId
    );
  
    // Encontra o índice original e o índice alvo dentro do conjunto de capítulos do mesmo `paper`
    const prevIndex = chaptersInSamePaper.findIndex(
      (d) => d === draggedChapter
    );
    const currentIndex = event.currentIndex;
  
    // Move o capítulo na lista filtrada para reorganização
    moveItemInArray(chaptersInSamePaper, prevIndex, currentIndex);
  
    // Atualiza a ordem dos capítulos no `paper` específico
    chaptersInSamePaper.forEach((chapter, idx) => {
      chapter.order = idx + 1;
    });
  
    // Atualiza a dataSource para refletir as novas ordens no `paper` específico
    this.dataSource.data = this.dataSource.data.map((chapter) =>
      chapter.paper_id === paperId ? chaptersInSamePaper.find((ch) => ch.id === chapter.id) || chapter : chapter
    );
    
    // Atualiza a tabela
    this.dataSource._updateChangeSubscription();
  
    // Envia a atualização ao servidor apenas para os capítulos do mesmo `paper`
    this.api.updateChapterList(chaptersInSamePaper).subscribe((updatedChapters) => {
      updatedChapters.forEach((c) => {
        this.wd.updateChapter(c);
      });
    });
  }
  


  sortByOrder(a: ExtendedChapter, b: ExtendedChapter): number {
    // Primeiro, compara o campo `order` dos capítulos
    if (a.order !== b.order) {
      return this.sortDirection ? a.order - b.order : b.order - a.order;
    }
  
    // Se o campo `order` dos capítulos for igual, compara pelo `order` dos papers
    if (a.papperOrder !== undefined && b.papperOrder !== undefined) {
      return this.sortDirection ? a.papperOrder - b.papperOrder : b.papperOrder - a.papperOrder;
    }
  
    // Se `order` dos capítulos e dos papers forem iguais ou ausentes, retorna 0
    return 0;
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

  setGlobalData(data: Chapter[], val:String){
    if(this.settings?.display_table_chapters){
      this.wd.setTableChapter(data)
    }if(this.settings?.display_table_chapters === false) {
      this.wd.setTableChapter(undefined)

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
          const data = this.dataSource.data.filter((a) => a.order == Number(this.orderSearchValue));
          this.dataSource.data = data
          this.setGlobalData(data, this.orderSearchValue)
          return
        }
        this.dataSource.data = this.chapter$
        this.wd.setTableChapter(undefined)
        return
      case 'name':
        let nameVal = this.nameSearchValue.toLowerCase(); // Normalizar para minúsculas
        if (nameVal && nameVal != "") {
          const data = this.dataSource.data.filter((c: Chapter) =>
            c.name.toLowerCase().includes(nameVal)
          );          
          this.dataSource.data = data
          this.setGlobalData(data, nameVal)
          return
        }
        this.dataSource.data = this.chapter$
        this.wd.setTableChapter(undefined)
        return
      case 'papperName':
        let papperName = this.papperNameSearchValue.toLowerCase(); // Normalizar para minúsculas
        if (papperName && papperName != "") {
          const data = this.dataSource.data.filter((c) =>
            c.papperName?.toLowerCase().includes(papperName)
          );     
          this.dataSource.data = data
          this.setGlobalData(data, papperName)
     
          return
        }
        this.dataSource.data = this.chapter$
        this.wd.setTableChapter(undefined)
        return
      case 'storylineName':
        let storylineName = this.storylineNameSearchValue.toLowerCase(); // Normalizar para minúsculas
        if (storylineName && storylineName != "") {
          const data = this.dataSource.data.filter((c) =>
            c.storylineName?.toLowerCase().includes(storylineName)
          ); 
          this.dataSource.data = data
    
          this.setGlobalData(data, storylineName)

          return
        }
        this.dataSource.data = this.chapter$
        this.wd.setTableChapter(undefined)
        return
      case 'timelineName':
        let timelineName = this.timelineNameSearchValue.toLowerCase(); // Normalizar para minúsculas
        if (timelineName && timelineName != "") {
          const data = this.dataSource.data.filter((c) =>
            c.timelineName?.toLowerCase().includes(timelineName)
          );   
          this.dataSource.data = data
          this.setGlobalData(data, timelineName)

          return
        }
        this.dataSource.data = this.chapter$
        this.wd.setTableChapter(undefined)
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


  chapterBackgroundColor(c: Chapter) {    return {
      'background-color': c.color,
      "filter": c.focus ? "brightness(1.2)" : "brightness(1)",
    }
  }




  hoverChapter(pp: Chapter, status:boolean) {
    pp.focus = status

    this.wd.updateChapter(pp)
  }
  updateChapter(chpId: string) {
    this.dialog.openUpdateChapterDialog('150ms', '150ms', chpId)
  }

}
