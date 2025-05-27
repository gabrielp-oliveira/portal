import { ChangeDetectorRef, Component, ElementRef, ViewChild, Renderer2, OnDestroy, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { SubwayService } from '../subway.service';
import { EDGE_BORDER_COLOR_DEFAULT, EDGE_BORDER_WIDTH_DEFAULT, LABEL_FONT_FAMILY_DEFAULT, LABEL_FONT_SIZE_DEFAULT, LABEL_FONT_SIZE_GROUP, LOADING_DELAY, NODE_BORDER_WIDTH_DEFAULT, MARGIN, PATH_ROOT_MARGIN_RIGHT, PATH_ROOT_MARGIN_TOP, TopoAddregatedNode, TopoEdge, TopoLegend, TopoNode, TopologyControlType, TopologyGeometryType, TopologyNodeType, groupColorMap, RANGE_GAP } from '../../../models/graphsTypes';
import {  combineLatest, finalize, Observable, Subject, takeUntil, tap } from 'rxjs';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Chapter, Connection, description, Event, GroupConnection, infoDialog, paper, StoryLine, Subway_Settings, Timeline } from '../../../models/paperTrailTypes';
import { ApiService } from '../../api.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { DialogService } from '../../../dialog/dialog.service';
import { NumberInput } from '@angular/cdk/coercion';
import { Router } from '@angular/router';
import { ErrorService } from '../../error.service';
import { UtilsService } from '../../../utils.service';

const D3_ROOT_ELEMENT_ID = "subway";


@Component({
  selector: 'app-subway',
  templateUrl: './subway.component.html',
  styleUrls: ['./subway.component.scss']
})
export class SubwayComponent implements OnDestroy  {

  width: number;
  height: number;
  zoom: number = 1;
  tiltX: number = 1
  tiltY: number = 1
  timeLineTxtHeight: number = 20
  selectedEvent: Event | undefined
  duplucateChaptersPosition: Record<string, Chapter[]>

  selectedChapter: Chapter | undefined;
  selectedConnection: Connection | undefined;
  storylineSelected: StoryLine
  prevStoryline: StoryLine
  storylinesMoved: StoryLine[] = []
  lastStorylineChanged: StoryLine
  selectedTimeline: Timeline;
  ss: Subway_Settings | null;
  gcs: GroupConnection[] = [];
  textDisplay : 'block' | 'none' = "block"
  nextStorylineSelected: number;
  reset: boolean
  currentSelectTimelineLeftGap: number;

  resizeDirection: "left"|"right" | ""

  isCreateConnectionSet: boolean;
  timelineEdit: boolean = false
  gridWidth = 100
  gridHeight = 50
  totalGridHeight = 0

  buttonsSpacing: any = {

    0: -25,
    1: 0,
    2: 25

  }
  @ViewChild('chapterMenuTrigger') chapterMenuTrigger!: MatMenuTrigger;
  @ViewChild('menuTimelineTrigger') menuTimelineTrigger!: MatMenuTrigger;
  @ViewChild('storylineMenuTrigger') storylineMenuTrigger!: MatMenuTrigger;
  @ViewChild("connectionMenuTrigger") trggerConnectionMenu!: MatMenuTrigger;
  @ViewChild("eventMenuTrigger") evtMenuTrigger!: MatMenuTrigger;

  bodyElement: HTMLElement = document.body;
  @ViewChild(`${D3_ROOT_ELEMENT_ID}`, { read: ElementRef }) root: ElementRef | undefined;

  storylines$ = this.wd.storylines$;
  timelines$ = this.wd.timelines$;
  chapters$ = this.wd.chapters$;
  tableChapter$ = this.wd.tableChapter$;
  settings$ = this.wd.settings$;
  papers$ = this.wd.papers$;
  connections$ = this.wd.connections$;
  events$ = this.wd.events$;

  graphHeigh: number = 0

  chapters: Chapter[] = [];
  connections: Connection[] = [];
  papers: paper[]
  svgHeight: number = 1
  timelines: Timeline[] = [];
  timelineOrderToUpdate: number
  storylineOrderToUpdate: number
  storylineY: number
  timelineX: number
  prevTimeline: Timeline | undefined
  uniqueChapters: Chapter[]
  duplicateChapters: Chapter[][]
  ChapterGroup: any = {}
  Showloading:boolean
  destroy$ = new Subject<void>();
  storylines: StoryLine[];


  constructor(
    private dialog: DialogService,
    private wd: WorldDataService,
    private api: ApiService,
    private err: ErrorService,
    private utils:UtilsService,
    private errorHandler: ErrorService

  ) {
    this.cleanItemsOnSvg();
  }

 
  
  ngOnDestroy(): void {
    this.destroy$.next();
    window.removeEventListener('resize', () => {});
    this.destroy$.complete();
  }

  test(){
    this.wd.setLoading(!this.Showloading)

  }

  private resizeSvg(e: any) {
    this.width = e.currentTarget.innerWidth

    const width = e.currentTarget.innerWidth || 800;
    const height =  400;
    
    d3.select(`#${D3_ROOT_ELEMENT_ID} svg`)
      .attr("viewBox", `0 0 ${width} ${height}`);
  }

  ngAfterViewInit(): void {
    this.width = window.innerWidth;
    this.height = this.root?.nativeElement.offsetHeight;
    
    // this.wd.loadingOn()



    this.wd.loading$
    .pipe(takeUntil(this.destroy$))
    .subscribe((loading) => this.Showloading = loading)

    let svg = this.initSvg();
    window.addEventListener('resize', (e) => this.resizeSvg(e));

    combineLatest({
      "timelines": this.timelines$, "storyLines": this.storylines$,
      "chapters": this.chapters$, "papers": this.papers$, "connections": this.connections$, "events": this.events$,
      "ss": this.settings$, "tbChp": this.tableChapter$, "gc": this.wd.groupConnection$, "globalGc": this.wd.SsGroupConnection$
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
      data.chapters = data.chapters.map((c) => {
        c.color = c.color == '' ? (data.papers.find((pp) => pp.id == c.paper_id)?.color || this.utils.numberToHex(c.paper_id)) : this.utils.numberToHex(c.paper_id) 
        return c
      })
      data.chapters = data.chapters.filter((c) => c.timeline_id != null && c.storyline_id != null)
      let {  papers, storyLines, timelines, connections, tbChp, gc,globalGc } = data
      this.gcs = gc
      this.ss = data.ss
      this.timelines = timelines
      this.storylines = storyLines
      const showTableChapters = data.ss?.display_table_chapters
      const showGroupConnections = data.ss?.group_connection_update_chapter

      let chpList = (showTableChapters == true &&  tbChp !== undefined)? tbChp: data.chapters 
      let cnnList = (showGroupConnections === true && globalGc !== undefined)
        ? data.connections.filter((cnn) => 
            globalGc?.some((gc) => gc.id === cnn.group_id) 
          ) : data.connections;
      
    
      this.textDisplay =  data.ss?.chapter_names == true ? "block" : "none"


      const chapterIds = new Set(chpList.map(c => c.id));

        const filteredConnections = cnnList.filter((connection) => {
          return (
            chapterIds.has(connection.sourceChapterID) &&
            chapterIds.has(connection.targetChapterID)
          );
        });
        
        filteredConnections.map((cnn) => {
          const group = this.gcs.find((gp)=>gp.id == cnn.group_id )
          cnn.color = group?.color || 'black'
          return cnn
        })
        data.connections = filteredConnections
        this.connections = filteredConnections
      

      this.papers = papers
      data.timelines = timelines.sort((a, b) => a.order - b.order);
      data.chapters = chpList.map((c) => {
        c.width = 0
        const str = storyLines.filter((s) => s.id == c.storyline_id)[0]
        const tl = timelines.filter((t) => t.id == c.timeline_id)[0]
        const pp = papers.filter((p) => p.id == c.paper_id)[0]

        this.svgHeight = storyLines.length
        if (!c.selected) {
          c.color = pp.color ==""? this.utils.numberToHex(pp?.id) : pp.color
        }
        c.height = (str?.order * this.gridHeight) || 0


        const tlRanges = data.timelines.reduce((a, b) => {
          if (b.order < tl?.order) {
            return a + b.range
          } else {
            return a
          }
        }, 0)
        const width = (tlRanges * RANGE_GAP) + ((c.range - 1) * RANGE_GAP)
        c.width = width + 100
        return c
      })
      this.chapters = chpList


     this.duplucateChaptersPosition = this.separateChaptersByDimensions(chpList)

      this.cleanItemsOnSvg();
      data.chapters = chpList
      this.handleGraphEvents(svg, data);
      return
    },
    error: (err) => this.err.errHandler(err),
    
    complete: () => {
      console.log(',,,')
      

    }})
    // Subscribe events for graph

  }



separateChaptersByDimensions(chapters: Chapter[]): Record<string, Chapter[]> {
  // Agrupa capítulos por width e height
  const groups = chapters.reduce((acc, chapter) => {
    const key = `${chapter.height}-${chapter.width}`;
    this.ChapterGroup[key] = (this.ChapterGroup[key] != undefined) ? this.ChapterGroup[key] : false
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  // Separa capítulos únicos e duplicados
  // const duplicateChapters: Chapter[][] = [];

  this.uniqueChapters = []
  this.duplicateChapters = []
  Object.values(groups).forEach((group:any) => {
    if (group.length === 1) {
      this.uniqueChapters.push(group[0]);
    } else {
      this.duplicateChapters.push(group);
    }
  });

  return  groups ;
}





private initSvg(): d3.Selection<SVGGElement, unknown, HTMLElement, any> {
  const width =  this.width || 800;
  const height =  400;

  // Seleciona o elemento e define atributos responsivos
  return d3.select(`#${D3_ROOT_ELEMENT_ID}`)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`) // Proporção de visualização
    .attr("preserveAspectRatio", "xMidYMid meet") // Mantém centralizado e proporcional
    .style("width", "100%")
    .style("border-radius", "8px")
    .style("height", "auto") // Ajusta a altura proporcionalmente
    .append("g"); // Retorna o grupo <g>
}


  getFillColor(chp: Chapter): string {
    const pps = this.papers
    const papper = pps.filter((p) => p.id == chp.paper_id)[0]
    if (chp?.focus) {
      return d3.color(chp.color)?.brighter(0.5)?.toString() || chp.color; // Aumenta a claridade da cor
    } else if (papper?.focus) {
      const result = this.chapters.filter((chp) => chp.paper_id == papper.id)

      result.forEach((c) => {
        const element = document.getElementById(`${c.id}-chapter-circle`);
        d3.select(element)
          .transition()
          .duration(100)
          .attr("fill", d3.color(c.color)?.brighter(1)?.toString() || c.color)
          .attr("r", this.getDiameter(chp))

      })
    }
    return chp.color;
  }

  onMenuClosed() {
    this.selectedChapter
    if (this.selectedChapter) {
      this.selectedChapter.focus = false
      this.wd.updateChapter(this.selectedChapter)
      // this.selectedChapter = undefined
    }

  }
  getDiameter(chp: Chapter): number {
    if (chp?.focus) {
      return 10
    } else {
      return 8
    }
  }

  focusChapter(c: Chapter, focus: boolean) {
    if (this.selectedChapter) {
      return
    }
    c.focus = focus
    this.wd.updateChapter(c)
    return
  }
  private renderGroupChapters(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    s: StoryLine[],
    t: Timeline[],
    c: Connection[]
  ) {
    // Seleciona ou adiciona o grupo principal para cada posição de capítulo duplicada
    if(this.duplicateChapters.length < 1){
      return
    }
    let eleEnter = svg.selectAll("g.chapter-group-stack")
      .data(this.duplicateChapters)
      .enter()
      .append("g")
      .attr("class", "chapter-group-stack");
  

    // Adiciona um retângulo transparente para expandir a área de detecção
    eleEnter
      .append("rect")
      .attr("id", (c) => `${c[0].height}-${c[0].width}-rect`)
      .attr("width", RANGE_GAP)
      .attr("height", this.gridHeight)  
      .attr("x", (c) => c[0].width - 10) // Ajusta a posição horizontal para centralizar
      .attr("y", (c) => c[0].height - this.gridHeight) // Ajusta a posição vertical para centralizar
      .attr("fill", "transparent")
    // Itera por cada grupo de capítulos duplicados
    eleEnter.each((group: Chapter[], idx) => {
      const elGroup = d3.select(eleEnter.nodes()[idx]);
      const key: any = `${group[0].height}-${group[0].width}`;

      // Renderiza os círculos
      elGroup.selectAll("circle")
        .data(group)
        .enter()
        .append("circle")
        .attr("id", (c: Chapter) => `${c.id}-chapter-circle`)
        .attr("cx", (chp: Chapter) => chp.width)
        .attr("cy", (chp: Chapter) => {
          const pos = ((this.duplucateChaptersPosition[key].findIndex((e) => e.id == chp.id)) + 1);
          if(this.ChapterGroup[key]){
            return chp.height - (pos * 15);
          }else{
            return chp.height - ((pos > 8 ? 8 : pos) * 5);
          }
        })
        .attr("r", (c) => this.getDiameter(c))
        .attr("fill", (chp: Chapter) => this.getFillColor(chp))
        .attr("stroke", "black")
        .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
        .attr("cursor", "pointer")
        .call(
          d3.drag<SVGCircleElement, Chapter>()
            .on("start", (event, d) => this.dragStarted(event, d))
            .on("drag", (event, d) => this.dragged(svg, event, d, c, this.chapters, true))
            .on("end", (event, d) => this.dragEnded(s, t, event, d))
        )
        .on('contextmenu', (e: MouseEvent, chp: Chapter) => this.chapterMenu(e, chp))
        .on("mouseover", (e: MouseEvent, chp: Chapter) => this.ChapterMouseEnter(e, chp, true))
        .on("mouseout", (e: MouseEvent, chp: Chapter) => this.chapterMouseLeave(chp, true));

  
      // Adiciona um texto para cada capítulo dentro do grupo
      elGroup.selectAll("text")
        .data([{}])
        .enter()
        .append("text")
        .attr("dx", () => group[0].width)
        .attr("dy", () => group[0].height + 15)
        .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
        .attr("font-size", LABEL_FONT_SIZE_GROUP)
        .attr("font-weight", 700)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("cursor", "pointer")
        .text(() => 'group ' + (idx + 1))
        .on("click", (e:MouseEvent) => this.getChapterGroup(svg, e, group, elGroup));

        
        if(this.ChapterGroup[key]){
          
          group.forEach((c) => {
          elGroup
          .append("text")
          .attr("dx", () => c.width - ((c.name.length * 3) + 15))
          .attr("dy", ( i) => {
            const pos = ((this.duplucateChaptersPosition[key].findIndex((e) => e.id == c.id)) + 1);
            const cy = c.height - (pos * 15)
            return cy
          })
          .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
          .attr("font-size", LABEL_FONT_SIZE_GROUP)
          .attr("text-anchor", "middle")
          .attr("fill", "black")  // Cor inicial do texto
          .attr("id", () => `${c.id}-chapter-group-txt`)  // Adiciona um ID único para cada grupo de capítulos
          .attr("display", this.textDisplay)
          .text(() => c.name);
        })
        }
        
    });
    
    
  }
  
  getChapterGroup(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    e:MouseEvent, group: Chapter[] ,getGroup:any){
    const key: any = `${group[0].height}-${group[0].width}`+'';
    if(this.ChapterGroup[key] == false ){
      this.handleMouseOver(svg, e, group, getGroup)

      this.ChapterGroup[key] = true 
    }else{
      this.ChapterGroup[key] = false
      this.handleMouseOut(svg, e, group, getGroup)
    }
    this.wd.updateChapter(group[0])

  }

  // Funções para manipular o evento de destaque no grupo
  private handleMouseOver(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    event:MouseEvent, chpList: Chapter[], element:any) {
   
    chpList.forEach((chp) => {
      const el = d3.select(document.getElementById(`${chp.id}-chapter-circle`))
      const key: any = `${chp.height}-${chp.width}`;
      const pos = ((this.duplucateChaptersPosition[key].findIndex((e) => e.id == chp.id)) + 1);
      const cy = chp.height - (pos * 15)
      el
      .transition()
      .duration(100)
      .attr("cy", () => cy);
      
     element
      .append("text")
      .raise()
      .attr("dx", () => chp.width - ((chp.name.length * 3) + 15))
      .attr("dy", () => cy)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_GROUP)
      .attr("text-anchor", "middle")
      .attr("fill", "black")  // Cor inicial do texto
      .attr("display", this.textDisplay)
      .attr("id", () => `${chp.id}-chapter-group-txt`)  // Adiciona um ID único para cada grupo de capítulos
      .text(() => chp.name);
      this.updateConnectionDrag(svg, this.connections, chpList, chp)

        
    });


  }
  
  private handleMouseOut(    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    e: MouseEvent, chpList: Chapter[], element:any) {
    chpList.forEach((chp) => {
      d3.select(document.getElementById(`${chp.id}-chapter-circle`))
        .transition()
        .duration(100)
        .attr("cy", () => {
          const key: any = `${chp.height}-${chp.width}`;
          const pos = ((this.duplucateChaptersPosition[key].findIndex((e) => e.id == chp.id)) + 1);
          return chp.height - ((pos > 8 ? 8 : pos) * 5);
        })

        const txt = d3.select(document.getElementById(`${chp.id}-chapter-group-txt`))
        .remove()


        // this.updateConnectionDrag(svg, this.connections, chpList, chp)
    });

  }
  
  

  private renderUniqueChapters(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    chapters: Chapter[],
    s: StoryLine[],
    t: Timeline[],
    c: Connection[]
  ) {
    // Cria um grupo (g) para cada capítulo

    let eleEnter = svg.selectAll("g.chapter-group")
      .data(this.uniqueChapters)
      .raise()
      .enter()
      .append("g")
      .attr("id", (c: Chapter) => `${c.id}-chapter-group`)  // Adiciona um ID único para cada grupo de capítulos
      .attr("class", "chapter-group");

    // Circles

    eleEnter
      .append("circle")
      .attr("id", (c: Chapter) => `${c.id}-chapter-circle`)  // Adiciona um ID único para cada grupo de capítulos
      .raise()
      .attr("cx", (chp: Chapter) => chp.width)
      .attr("cy", (chp: Chapter) => chp.height)
      .attr("r", (c) => this.getDiameter(c))
      .attr("fill", (chp: Chapter) => this.getFillColor(chp)) // Cor ajustada dinamicamente
      .attr("stroke", (chp: Chapter) => "black") // Cor da borda ajustada dinamicamente
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
      .attr("cursor", "pointer")
      .call(
        d3.drag<SVGCircleElement, Chapter>()
          .on("start", (event, d) => this.dragStarted(event, d))
          .on("drag", (event, d) => this.dragged(svg, event, d, c, chapters, false))
          .on("end", (event, d) => this.dragEnded(s, t, event, d))
      )
      .on('contextmenu', (event: MouseEvent, c: Chapter) => this.chapterMenu(event, c))
      .on("mouseover", (e: MouseEvent, c: Chapter) => this.ChapterMouseEnter(e, c, false))
      .on("mouseout", (_: MouseEvent, c: Chapter) => this.chapterMouseLeave(c, false));
    // Labels (Texto)

      eleEnter
      .append("text")
      .raise()
      .attr("dx", (node: Chapter) => node.width)
      .attr("dy", (node: Chapter) => node.height + 15)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_GROUP)
      .attr("text-anchor", "middle")
      .attr("display", this.textDisplay)
      .attr("fill", "black")  // Cor inicial do texto
      .attr("id", (c: Chapter) => `${c.id}-chapter-group-txt`)  // Adiciona um ID único para cada grupo de capítulos
      .attr("display", this.textDisplay)
      .text((node: Chapter) => node.name);
    }
 


  ChapterMouseEnter (event: MouseEvent, c: Chapter, isGroup:boolean)  {
    if (this.selectedChapter) {
      return
    }
    if (!c?.focus) {

      c.focus = true;
      this.wd.updateChapter(c); // Update the state

      
      
      // this.ChapterGroupHover = key

      const element = document.getElementById(`${c.id}-chapter-circle`);
      const elementtx = document.getElementById(`${(c.id)}-chapter-group-txt`);

      d3.select(element)
      .transition()
      .duration(100)
      .attr("fill", d3.color(c.color)?.brighter(1)?.toString() || c.color) // Lighten the color
      .attr("r", this.getDiameter(c));

      const connections = this.connections.filter((cnn) => cnn.sourceChapterID == c.id || cnn.targetChapterID == c.id)
      connections.forEach((cnn) => {
        const el = document.getElementById(cnn.id + "-connections-group" )
        const el2= d3.select(el)
        .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT * 2)
      })
      const uniqueChapterIDs = Array.from(
        new Set(connections.map(cnn => [cnn.sourceChapterID, cnn.targetChapterID]).flat())
      );

      uniqueChapterIDs.forEach((id) => {
        const chp = this.chapters.filter((c) => c.id == id)[0]

        const element = document.getElementById(`${chp.id}-chapter-circle`);
        const elementtx = document.getElementById(`${(chp.id)}-chapter-group-txt`);
        

        d3.select(elementtx)
        .transition()
        .duration(100)
        .attr("display", "block")
        .attr("font-weight", 700);

        d3.select(element)
        .transition()
        .duration(100)
        .attr("fill", d3.color(chp.color)?.brighter(1)?.toString() || chp.color) // Lighten the color
        .attr("r", this.getDiameter(c));
        })

      // if(!isGroup){
      //   return
      // }

      d3.select(elementtx)
      .transition()
      .duration(100)
      .attr("display", "block")
      .attr("font-weight", 700)


    }

  }
  chapterMouseLeave ( c: Chapter, isGroup:boolean)  {
    if (this.selectedChapter) {
      return
    }
    if (c?.focus) {


      c.focus = false;
      this.wd.updateChapter(c); // Update the state

      
      const element = document.getElementById(`${c.id}-chapter-circle`);
      const elementtx = document.getElementById(`${(c.id)}-chapter-group-txt`);

      d3.select(element)
        .transition()
        .duration(100)
        .attr("fill", this.getFillColor(c)) // Restore the original color based on state
        .attr("r", this.getDiameter(c));


        const connections = this.connections.filter((cnn) => cnn.sourceChapterID == c.id || cnn.targetChapterID == c.id)
        connections.forEach((cnn) => {
          const el = document.getElementById(cnn.id + "-connections-group" )
           d3.select(el)
          .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT)
        })
        const uniqueChapterIDs = Array.from(
          new Set(connections.map(cnn => [cnn.sourceChapterID, cnn.targetChapterID]).flat())
        );
        uniqueChapterIDs.forEach((id) => {
          const chp = this.chapters.filter((c) => c.id == id)[0]
          this.chapterMouseLeave(chp, false)
        })

        
        d3.select(elementtx)
        .transition()
        .duration(100)
        .attr("display", this.textDisplay)
        .attr("font-weight", 500)
    }

  }
  chapterMenu(event: MouseEvent, c: Chapter) {
    event.preventDefault();


    // this.trigger.menuData ={ xPosition: ev.clientX, yPosition: ev.clientY }

    this.chapterMenuTrigger.openMenu();
    const menu = document.querySelector("#" + this.chapterMenuTrigger.menu?.panelId)
    const menuElement = document.querySelector("#" + this.chapterMenuTrigger.menu?.panelId) as HTMLElement;

    if (menuElement) {
      // Defina o estilo de posicionamento
      menuElement.style.position = 'absolute';
      menuElement.style.left = `${event.x + 5}px`;
      menuElement.style.top = `${event.y + 5}px`;
    }
    this.selectedChapter = c

  }
  timeLineMenu(event: MouseEvent, tl: Timeline) {
    event.preventDefault();


    // this.trigger.menuData ={ xPosition: ev.clientX, yPosition: ev.clientY }

    this.menuTimelineTrigger.openMenu();
    const menu = document.querySelector("#" + this.menuTimelineTrigger.menu?.panelId)
    const menuElement = document.querySelector("#" + this.menuTimelineTrigger.menu?.panelId) as HTMLElement;

    if (menuElement) {
      // Defina o estilo de posicionamento
      menuElement.style.position = 'absolute';
      menuElement.style.left = `${event.x + 5}px`;
      menuElement.style.top = `${event.y + 5}px`;
    }
    this.selectedTimeline = tl

  }
  private renderEvents(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    events: Event[], chapters: Chapter[], height: number) {

    const gridHeight = (height * this.gridHeight);
    this.totalGridHeight = gridHeight;

    // Seleciona os grupos existentes e associa os dados
    let el: d3.Selection<SVGGElement, Event, SVGGElement, Event> = svg
      .selectAll<SVGGElement, Event>("g.event-group")
      .lower()
      .data(events, (ev: Event) => ev.id);

    // Remove os grupos que não estão mais nos dados
    el.exit().remove();

    // Cria novos grupos para novos dados
    const enter = el.enter()
      .append<SVGGElement>("g")
      .attr("class", "event-group")
      .attr("id", (ev: Event) => `${CSS.escape(ev.id)}-event-group`);

    // Atualiza grupos existentes e novos grupos
    el = enter.merge(el);

    // Criação do corpo da timeline
    this.createEventBody(el, gridHeight);

    // Criação do header da timeline
    // this.createEventHeader(el, gridHeight);

    // Criação dos controles de movimento
    this.createEventControls(el, svg, gridHeight);
}

private createEventBody(el: d3.Selection<SVGGElement, Event, SVGGElement, Event>, gridHeight: number) {
    el.append("rect")
      .attr("id", (ev: Event) => `${CSS.escape(ev.id)}-event-body`)
      .attr("x", (ev: Event) => (ev.startRange * RANGE_GAP) + 100)
      .attr("y", this.gridHeight)
      .attr("width", (ev: Event) => (ev.range * RANGE_GAP) - 5)
      .attr("height", gridHeight)
      .style("fill", "rgba(250, 20, 20, 0.2)");
}

private createEventHeader(el: d3.Selection<SVGGElement, Event, SVGGElement, Event>, gridHeight: number) {
    const bottomEvent = el.append<SVGGElement>("g");

    // Adiciona o background do header usando 'rect'
    bottomEvent.append("rect")
    .attr("id", (ev: Event) => `${CSS.escape(ev.id)}-event-bottom`)
    .attr("class",'event-bottom')
    .attr("pointer-events", 'none')
    .attr("x", (ev: Event) => (ev.startRange * RANGE_GAP) + 100)
    .attr("y", gridHeight + this.gridHeight) // Posiciona no topo
    .attr("width", (ev: Event) => (ev.range * RANGE_GAP) - 5)
    .attr("height", 45) // Altura do header
    .style("fill", "rgba(250, 100, 100, 0.25)")  // Define a cor do header
    .style("stroke", "#000")  // Adiciona uma borda se necessário
    .style("stroke-width", "1px")


      bottomEvent
      .append("text")
      .attr("id", (ev: Event) => `${CSS.escape(ev.id)}-event-resize-left`)
      .attr("class", `event-resize-left`)
      .attr("x", (ev: Event) => (ev.startRange * RANGE_GAP) + 105)
      .attr("y", gridHeight + 75) // Posiciona no topo
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("font-weight", '700')
      .attr("cursor", "pointer")
      .text("<")
      .call(
        d3.drag<SVGTextElement, Event>()
          .on("start", (event, e) => this.eventDragResizeStart(event, e, "left"))
          .on("drag", (event, e) => this.eventResizeDragged(event, e))
          .on("end", () => this.eventResizeDragEnd(el))
      )

      bottomEvent
      .append("text")
      .attr("id", (ev: Event) => `${CSS.escape(ev.id)}-event-resize-right`)
      .attr("class", `event-resize-right`)
      .attr("font-weight", '700')
      .attr("x", (ev: Event) => ((ev.startRange + ev.range) * RANGE_GAP) + 80)
      .attr("y", gridHeight + 75) // Posiciona no topo
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("cursor", "pointer")
      .text(">")
      .call(
        d3.drag<SVGTextElement, Event>()
          .on("start", (event, e) => this.eventDragResizeStart(event, e, "right"))
          .on("drag", (event, e) => this.eventResizeDragged(event, e))
          .on("end", () => this.eventResizeDragEnd(el))
      )
      .on("mousemove", (nativeEvent, event:Event) => {
        if((((nativeEvent.x - 100) - event.startRange * RANGE_GAP)) <= 15) {
          d3.select("body").style("cursor", "w-resize"); // seta para a esquerda

        }else if(((((event.startRange + event.range) * RANGE_GAP) + 100) -  nativeEvent.x) <= 15) {
          d3.select("body").style("cursor", "e-resize"); // seta para a direita
        }  else {
          d3.select("body").style("cursor", "default");
        }
      })
      .on("mouseleave", () => {
        d3.select("body").style("cursor", "default");
      })
      
}

eventDragResizeStart(nativeEvent:any, e:Event, direction:"" | "left" | "right" ){
    this.resizeDirection = direction
  }

eventResizeDragged(nativeEvent: MouseEvent, e: Event) {
  // Calcular o novo valor de range com base na posição do mouse
  const newMouseX = nativeEvent.x - 100;
  const gridUnit = RANGE_GAP;

  // Limite do startRange para não ser menor que zero
  if (newMouseX <= 0) return;

  if (this.resizeDirection === "left") {
    // Se o movimento for para a esquerda, diminui o startRange e aumenta o range
    const newStartRange = Math.floor(newMouseX / gridUnit);
    if(newStartRange < 0){
      return
    }
    const rangeChange = e.startRange - newStartRange;
    if (newStartRange >= 0) {
      if((e.range + rangeChange) <= 5){
        return
      }
      e.startRange = newStartRange;  // Atualiza o início do range
      e.range = e.range + rangeChange;            // Atualiza o comprimento do range


    }
  } else if (this.resizeDirection === "right") {
    // Se o movimento for para a direita, aumenta o range e mantém o startRange
    const newRange = Math.floor(newMouseX / gridUnit) - e.startRange;
    if (newRange >= 1) { // Mantém o range maior ou igual a 1
      if(newRange < 5){
        return
      }
      e.range = newRange;
    }
  }

  
  this.selectedEvent = e
  this.updateEventDisplay(e);

  // Atualiza a visualização com os novos valores de range e startRange
}

eventResizeDragEnd(svg:any){
  this.resizeDirection = ""

  if(this.selectedEvent){

    // this.resizeEvent(this.selectedEvent)
    this.api.updateEvent(this.selectedEvent)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (e) =>  this.wd.updateEvent(e),
      error: (e) => this.errorHandler.errHandler(e)
    })

  }
}

private createEventControls(el: d3.Selection<SVGGElement, Event, SVGGElement, Event>, svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,gridHeight:number) {
  const bottomEvent = el.append<SVGGElement>("g");

  bottomEvent.append("text")
    .attr("id", (ev: Event) => `${CSS.escape(ev.id)}-event-txt`)
    .attr("x", (ev: Event) => (ev.startRange * RANGE_GAP) + (ev.range * (RANGE_GAP / 2)) + 100) // Posição proporcional
    .attr("y", this.totalGridHeight + 75) // Posiciona no topo
    .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
    .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
    .attr("text-anchor", "middle")
    .text((ev: Event) => ev.name)
    .attr("cursor", "pointer")
    .call(
      d3.drag<SVGTextElement, Event>()
        .on("start", (event, e) => this.eventDragStart(event, e))
        .on("drag", (event, e) => this.eventDragged(event, e))
        .on("end", (_, e) => this.eventDragEnd(svg, e))
    )
    .on("contextmenu", (e, event:Event) => {
      e.preventDefault();
      console.log(e)
      this.evtMenuTrigger.openMenu();
      const menuElement = document.querySelector("#" + this.evtMenuTrigger.menu?.panelId) as HTMLElement;
      if (menuElement) {
        menuElement.style.position = "absolute";
        menuElement.style.left = `${e.x + 5}px`;
        menuElement.style.top = `${e.y + 5}px`;
      }
      this.selectedEvent = event
    })
    

     // Adiciona o background do header usando 'rect'
     bottomEvent
     .append("rect")
     .attr("class",'event-bottom')
     .attr("id", (ev: Event) => `${CSS.escape(ev.id)}-event-bottom`)
     .attr("cursor", "pointer")
     .attr("x", (ev: Event) => (ev.startRange * RANGE_GAP) + 100)
     .attr("y", gridHeight + this.gridHeight) // Posiciona no topo
     .attr("width", (ev: Event) => (ev.range * RANGE_GAP) - 5)
     .attr("height", 45) // Altura do header
     .style("fill", "rgba(250, 100, 100, 0.25)")  // Define a cor do header
     .style("stroke", "#000")  // Adiciona uma borda se necessário
     .style("stroke-width", "1px")
      .call(
      d3.drag<SVGRectElement, Event>()
        .on("start", (event, e) => this.eventDragStart(event, e))
        .on("drag", (event, e) => this.eventDragged(event, e))
        .on("end", (_, e) => this.eventDragEnd(svg, e))
    ).on("contextmenu", (e, event:Event) => {
      e.preventDefault();
      console.log(e)
      this.evtMenuTrigger.openMenu();
      const menuElement = document.querySelector("#" + this.evtMenuTrigger.menu?.panelId) as HTMLElement;
      if (menuElement) {
        menuElement.style.position = "absolute";
        menuElement.style.left = `${e.x + 5}px`;
        menuElement.style.top = `${e.y + 5}px`;
      }
      this.selectedEvent = event
    })
    
 
       bottomEvent
       .append("text")
       .attr("id", (ev: Event) => `${CSS.escape(ev.id)}-event-resize-left`)
       .attr("class", `event-resize-left`)
       .attr("x", (ev: Event) => (ev.startRange * RANGE_GAP) + 105)
       .attr("y", gridHeight + 75) // Posiciona no topo
       .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
       .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
       .attr("font-weight", '700')
       .attr("cursor", "pointer")
       .text("<")
       .call(
         d3.drag<SVGTextElement, Event>()
           .on("start", (event, e) => this.eventDragResizeStart(event, e, "left"))
           .on("drag", (event, e) => this.eventResizeDragged(event, e))
           .on("end", () => this.eventResizeDragEnd(el))
       )
 
       bottomEvent
       .append("text")
       .attr("id", (ev: Event) => `${CSS.escape(ev.id)}-event-resize-right`)
       .attr("class", `event-resize-right`)
       .attr("font-weight", '700')
       .attr("x", (ev: Event) => ((ev.startRange + ev.range) * RANGE_GAP) + 80)
       .attr("y", gridHeight + 75) // Posiciona no topo
       .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
       .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
       .attr("cursor", "pointer")
       .text(">")
       .call(
         d3.drag<SVGTextElement, Event>()
           .on("start", (event, e) => this.eventDragResizeStart(event, e, "right"))
           .on("drag", (event, e) => this.eventResizeDragged(event, e))
           .on("end", () => this.eventResizeDragEnd(el))
       )
       .on("mousemove", (nativeEvent, event:Event) => {
         if((((nativeEvent.x - 100) - event.startRange * RANGE_GAP)) <= 15) {
           d3.select("body").style("cursor", "w-resize"); // seta para a esquerda
 
         }else if(((((event.startRange + event.range) * RANGE_GAP) + 100) -  nativeEvent.x) <= 15) {
           d3.select("body").style("cursor", "e-resize"); // seta para a direita
         }  else {
           d3.select("body").style("cursor", "default");
         }
       })
       .on("mouseleave", () => {
         d3.select("body").style("cursor", "default");
       })

}


getEventDescription(){
  if(this.selectedEvent){
    const params: description= {
      id: this.selectedEvent.id,
      resource_type: "event",
      name: this.selectedEvent.name
    }
    this.dialog.openChapterDescription(params, '150ms','150ms')
  }
}
removeEvent(){
  if(this.selectedEvent){
    const id = this.selectedEvent.id
    this.api.deleteEvent(id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (e) => {
        this.wd.removeEvent(id)
        this.selectedEvent = undefined
      },
      error: (e) => this.errorHandler.errHandler(e)
    })

  }
}
updateEvent(){
  if(this.selectedEvent){
    const event:Event = this.selectedEvent
    this.dialog.openUpdateEventDialog(event, "150ms","150ms")
  }
}

private resizeEvent(event: Event) {

  const chaptersRelated = this.chapters.filter((c) => {
    const range = (c.width - 100) / RANGE_GAP
    if(range >= event.startRange && range <= (event.startRange + event.range )){
      if(c.event_Id == event.id){
        return false
      }else {
        c.event_Id = event.id
        this.wd.updateChapter(c)
      }
      return c
    }else {
      if(c.event_Id == event.id){
        c.event_Id = ""
        return c
      }
      return false
    }
  })


  if(chaptersRelated.length > 0){

    this.api.updateChapterList(chaptersRelated)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (c) => {
        return c
      },
      error: (e) => this.errorHandler.errHandler(e)
    })

  }
}

// Função para atualizar a visualização do evento
private updateEventDisplay(event: Event) {
  // Seleciona o retângulo correspondente ao evento e atualiza a largura
  d3.select(document.getElementById(`${CSS.escape(event.id)}-event-body`))
    .attr("width", (event.range * RANGE_GAP) - 5)
    .attr("x", (event.startRange * RANGE_GAP) + 100)


  d3.select(document.getElementById(`${CSS.escape(event.id)}-event-bottom`))
    .attr("width", (event.range * RANGE_GAP) - 5)
    .attr("x", (event.startRange * RANGE_GAP) + 100)


  // Atualiza a posição do texto de nome e do botão de arrasto
  d3.select(document.getElementById(`${CSS.escape(event.id)}-event-txt`))
    .attr("x", (event.startRange * RANGE_GAP) + (event.range * (RANGE_GAP / 2)) + 100);

  d3.select(document.getElementById(`${CSS.escape(event.id)}-event-drag`))
    .attr("x", (event.startRange * RANGE_GAP) + (event.range * (RANGE_GAP / 2)) + 100);


    
  d3.select(document.getElementById(`${CSS.escape(event.id)}-event-resize-right`))
    .attr("x", (event.startRange * RANGE_GAP) + (event.range * RANGE_GAP) + 80);
    
  d3.select(document.getElementById(`${CSS.escape(event.id)}-event-resize-left`))
    .attr("x", (event.startRange * RANGE_GAP) + 105);

}



  createConnection() {
    if (this.selectedChapter) {

      this.selectedChapter.selected = true
      this.selectedChapter.color = "white"
      this.isCreateConnectionSet = true

      this.wd.updateChapter(this.selectedChapter)
      const info :infoDialog= {
        status: 'warning',
        action: "create connection",
        message:"chose a chapter to create a connection!",
        header: "connection"
      }
      this.dialog.openInfoDialog(info)

    }

  }

  removeStoryline() {
    this.storylineSelected.world_id = this.wd.worldId
    this.wd.setLoading(true)

    this.api.deleteStoryline(this.storylineSelected.id, this.storylineSelected)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (chapters) => {
        const storylines = this.storylines.filter(c => c.id !== this.storylineSelected.id);

        const data :StoryLine[]= storylines.sort((a, b) => a.order - b.order);
        data.forEach((elemento, index) => {
          elemento.order = index + 1;
        });

            
        this.api.updateStoryLineList(data)
        .pipe(takeUntil(this.destroy$))
        .subscribe((list) => {
          this.wd.setStorylines(list)
        })

        this.wd.setChapters(chapters)
        this.wd.removeStoryLine(this.storylineSelected.id)
        this.wd.setLoading(false)
      },
      error: (err) => this.errorHandler.errHandler(err)
    })
  }
  removeConnection() {
    if (this.selectedConnection != undefined) {

      const target = this.chapters.filter((chp) => chp.id == this.selectedConnection?.targetChapterID)[0]
      target.color = "white"
      target.selected = true
      const source = this.chapters.filter((chp) => chp.id == this.selectedConnection?.sourceChapterID)[0]
      source.color = "white"
      source.selected = true
      this.wd.updateChapter(target)
      this.wd.updateChapter(source)


      this.api.removeConnection(this.selectedConnection)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {

    
          this.wd.removeConnection(this.selectedConnection?.id || "")
          this.selectedConnection = undefined
          setTimeout(() => {
  
            source.selected = false
            target.selected = false
            this.wd.updateChapter(target)
            this.wd.updateChapter(source)
          }, 1000);
        },
        error: (e) => this.errorHandler.errHandler(e)

      })
    }

  }

  setGroupConnection(){
    if(!this.selectedConnection) return
    this.dialog.openGroupConnectionDialog(this.selectedConnection, `150ms`, `150ms`)
  }

  private dragStarted(event: any, d: Chapter) {
    if (this.isCreateConnectionSet && this.selectedChapter) {
      if (this.selectedChapter.id == d.id) {

        const info :infoDialog= {
          status: 'warning',
          action: "create connection",
          message:"you cannot create connection with the same chapter",
          header: "fail tocreate connection"
        }
        this.dialog.openInfoDialog(info)
  

        return
      }
      const body: Connection =
      {
        "id": "",
        "targetChapterID": d.id,
        "sourceChapterID": this.selectedChapter.id,
        "world_id": this.wd.worldId,
        'color': 'black',
        "group_id": null
      }


      this.api.createConnection(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(cnn) => {
          const selected = this.chapters.filter((c) => {
            if (this.selectedChapter != undefined && c.id == this.selectedChapter.id) {
              c.color = c.color
              c.selected = false
              return c
            }else {
              return false
            }
          })
          this.isCreateConnectionSet =false
          this.wd.updateChapter(selected[0])
          this.wd.addConnection(cnn)
        },
        error: (e) => this.errorHandler.errHandler(e)

      })

      return
    }
    this.selectedChapter = d

    const elementCircleId = `#${CSS.escape(d.id)}-chapter-group circle`;
    const elementtextId = `#${CSS.escape(d.id)}-chapter-group text`;
    d3.select(elementtextId).raise().attr("stroke", "black");
    d3.select(elementCircleId).raise().attr("stroke", "black");
  }

  private dragged(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, event: any, d: Chapter, connections: Connection[], chapters: Chapter[], isGroup:boolean) {
    const elementCircleId = `#${CSS.escape(d.id)}-chapter-group circle`;
    const elementtextId = `#${CSS.escape(d.id)}-chapter-group text`;

    // const el = d3.select(document.getElementById(D3_ROOT_ELEMENT_ID))
    // const boundingBox = el.node()?.getBoundingClientRect(); // Pega o bounding box do elemento
    // const transform = d3.zoomTransform(el.node()!);
    // const relativeX = (event.sourceEvent.clientX - (boundingBox?.left || 0) - transform.x) / transform.k;
    // const relativeY = (event.sourceEvent.clientY - (boundingBox?.top || 0) - transform.y) / transform.k;
    const relativeY = event.y
    const relativeX = event.x;


    

    if (relativeX < 100 || relativeY < this.gridHeight || relativeY > this.graphHeigh) {
      return
    }

    d.width = relativeX
    d.height = relativeY
    if(isGroup){
      d3.select(document.getElementById(`${d.id}-chapter-circle`))
      .attr("cx", relativeX)
      .attr("cy", relativeY);
  
  
      d3.select(document.getElementById(`${d.id}-chapter-group-txt`))
      .attr("display", this.textDisplay)
        .attr("dx", d.width)
        .attr("dy", d.height + 15)
        .attr("cx", d.width)
        .attr("cy", d.height)
        .attr("stroke", d.color)
        
  
    }else {

      d3.select(elementCircleId)
      .attr("cx", relativeX)
      .attr("cy", relativeY);
  
  
      d3.select(elementtextId)
        .attr("dx", d.width)
        .attr("dy", d.height + 15)
        .attr("cx", d.width)
        .attr("cy", d.height)
        .attr("stroke", d.color)
  
  
  
      }
      this.updateConnectionDrag(svg, connections, chapters, d)

  }

  updateConnectionDrag(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, cnns: Connection[], chp: Chapter[], chapterSelected: Chapter) {
    const connectionRelated = cnns?.filter((c) => c.sourceChapterID === chapterSelected.id || c.targetChapterID === chapterSelected.id);

    if (!connectionRelated || connectionRelated.length === 0) {
      return; // Se não houver conexões relacionadas, não há necessidade de continuar.
    }
    
    // Criar um mapa com capítulos para acesso rápido
    const chapterMap = new Map(chp.map(chp => [chp.id, chp]));

    let relatedChaptersSet = new Set<Chapter>();

    connectionRelated.forEach((cnn) => {
      const id = `${cnn.id}-connections-group`;
      const element = document.getElementById(id);

      if (element) {
        element.remove(); // Remover diretamente se o elemento existir
      }
      // Adicionar os capítulos relacionados ao conjunto (Set) sem duplicatas
      const sourceChapter = chapterMap.get(cnn.sourceChapterID);
      const targetChapter = chapterMap.get(cnn.targetChapterID);
      
      if (sourceChapter) relatedChaptersSet.add(sourceChapter);
      if (targetChapter) relatedChaptersSet.add(targetChapter);
    });

    // Converter o Set de capítulos relacionados em um array
    const relatedChapters = Array.from(relatedChaptersSet);

    if (relatedChapters.length > 0) {
      this.renderConnections(svg, relatedChapters, connectionRelated);
    }

  }

  private dragEnded(s: StoryLine[], t: Timeline[], event: any, d: Chapter) {
    if(this.isCreateConnectionSet ){
      return
    }
  

    const elementCircleId = `#${CSS.escape(d.id)}-chapter-group circle`;
    const elementtextId = `#${CSS.escape(d.id)}-chapter-group text`;
    // erro ao criar connection, programa esta jogando o chapter point para o ultimo storyline.
    d3.select(elementCircleId).attr("stroke", d.color);
    d3.select(elementtextId).attr("stroke", 'black');

    // const el = d3.select(document.getElementById(D3_ROOT_ELEMENT_ID))

    // const boundingBox = el.node()?.getBoundingClientRect(); // Pega o bounding box do elemento

    // const relativeX = ((event.sourceEvent.clientX - (boundingBox?.left || 0)) - this.tiltX) / this.zoom
    // const relativeY = ((event.sourceEvent.clientY - (boundingBox?.top || 0)) - this.tiltY) / this.zoom;
    const relativeX = event.x
    const relativeY = event.y



    // Após o movimento, você pode capturar a nova posição do chapter, timeline e storyline

    const newTimeline = this.findTimelineForChapter(t, relativeX);
    const newStoryline = this.findStorylineForChapter(s, relativeY);
    let newStorylineId
    if (newStoryline) {
      newStorylineId = newStoryline.id
    } else {
      newStorylineId = d.storyline_id

    }
    const body: Chapter = {
      ...d,
      range: newTimeline.range,
      storyline_id: newStorylineId,
      timeline_id: newTimeline.timeline?.id
    }

    this.api.updateChapter(d.id, body)
    .pipe(takeUntil(this.destroy$))
    .subscribe(

      {
        next: (data) => this.addNewChapter(data),
        error: (err) => this.errorHandler.errHandler(err)
      }
    )
    this.selectedChapter = undefined

  }

  addNewChapter(newChapter: Chapter) {
    this.wd.updateChapter(newChapter)
  }

  // Funções para encontrar o timeline e storyline
  private findTimelineForChapter(t: Timeline[], x: number): { timeline: Timeline, range: number } {

    let range = Math.round((x - 100) / RANGE_GAP) + 1

    // const totalTimeLineRange = t.reduce((a, b) => a + b.range, 0)
    if (range <= 0) {
      range = 0
    }
    let tl = 0
    for (let i = 0; i < t.length - 1; i++) {
      if ((range - t[i].range) <= 0) {
        break
      } else {
        tl += 1
        range -= t[i].range
      }
    }

    if (range <= 0) {
      range = 1
    }

    const result = {
      timeline: t[tl],
      range: range
    }
    return result;
  }
  private findStorylineForChapter(s: StoryLine[], y: number): StoryLine {
    let range = Math.round((y - this.gridHeight) / this.gridHeight)
    if (range >= s.length - 1) {
      range = s.length - 1
    }
    const str = s.filter((s) => s.order == (range + 1))
    return str[0];
  }



  openChapter() {
    const id = this.selectedChapter?.id || ''
    const url = `/world/${this.wd.worldId}/chapter/${id}`;
    window.open(url, '_blank');
  }

  removeFromSubway() {
    if (this.selectedChapter != undefined) {
      this.selectedChapter.timeline_id = ""
      this.selectedChapter.storyline_id = ""
      this.selectedChapter.event_Id = ""
      this.selectedChapter.range = 0
      this.selectedChapter.width = -100
      this.selectedChapter.height = -100
      this.selectedChapter.color = 'transparent'
      this.selectedChapter.focus = false



      const elementId = `${CSS.escape(this.selectedChapter.id)}-chapter-circle`;
      const elementTxtId = `${CSS.escape(this.selectedChapter.id)}-chapter-group-txt`;

      const chp = d3.select(elementId).remove()
      d3.select(elementTxtId).remove()

      this.api.updateChapter(this.selectedChapter.id, this.selectedChapter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (c) => {
          this.wd.updateChapter(c)
          this.removeConnection()
          this.selectedChapter = undefined
        },
        error: (e) => this.errorHandler.errHandler(e) 
      })
    }

  }


  private renderConnections(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    c: Chapter[],
    cnn: Connection[]
  ) {
    if (cnn.length <= 0) {
      return;
    }

    const txtDisplay :String= this.textDisplay
    // Cria um grupo específico para as conexões
    const connectionsGroup = svg.append("g").attr("class", "connections");

    const connectionPaths = connectionsGroup
      .selectAll("path")
      .data(cnn)
      .enter()
      .append("path")
      .attr("id", (edge: Connection) => edge.id + "-connections-group")
      .attr("d", (edge: Connection) => {
        let source = c.find((data: Chapter) => data.id === edge.sourceChapterID);
        let target = c.find((data: Chapter) => data.id === edge.targetChapterID);
    
        let y0 = source ? source.height : 0;
        let x0 = source ? source.width : 0;
        let x1 = target ? target.width : 0;
        let y1 = target ? target.height : 0;
    
        const CONSTANT_CONTROL_POINT = 5;
        const HORIZONTAL_THRESHOLD = 3;
    
        // Checa por capítulos interferentes no caminho
        const interferingChapters = c.filter(chp => {
          if (source != undefined && target != undefined && chp.id !== source?.id && chp.id !== target?.id) {
              // Verifica se a posição horizontal (width) de `chp` está entre o `source` e o `target`
              const withinXRange = (chp.width >= Math.min(source.width, target.width)) &&
                                   (chp.width <= Math.max(source.width, target.width));
      
              // Verifica se a posição vertical (height) de `chp` está entre o `source` e o `target`
              const withinYRange = (chp.height >= Math.min(source.height, target.height)) &&
                                   (chp.height <= Math.max(source.height, target.height));
    
              return withinXRange && withinYRange;
          }
          return false;
      });
      
    
        let isHorizontal = Math.abs(y0 - y1) < HORIZONTAL_THRESHOLD;
        let isVertical = Math.abs(x0 - x1) < HORIZONTAL_THRESHOLD;
    
        let controlPointX = isHorizontal ? x1 : x1 + CONSTANT_CONTROL_POINT * ((x1 - x0) / (y1 - y0));
        let controlPointY = isVertical ? y1 : y1 - CONSTANT_CONTROL_POINT * ((y1 - y0) / (x1 - x0));
    
        // Usa `createEdge` para construir o caminho com ajuste para interferentes
        const isCurve = interferingChapters.length > 0
        const sourceKey: any = `${source?.height}-${source?.width}`;
        const targetKey: any = `${target?.height}-${target?.width}`;

        if((x0 == x1) && y0 == y1){
          const sourcePos = ((this.duplucateChaptersPosition[sourceKey].findIndex((e) => e.id == source?.id)) + 1);
          const targetPos = ((this.duplucateChaptersPosition[targetKey].findIndex((e) => e.id == target?.id)) + 1);
          
          if(this.ChapterGroup[targetKey]){
            const sourceHeight = (source?.height ?? 0) - (sourcePos * 15)
            const targetHeight = (target?.height ?? 0) - (targetPos * 15)
            return this.createEdge((x0 + (RANGE_GAP / 2)), sourceHeight, (x0 + (RANGE_GAP / 2)), targetHeight, (controlPointX * 1.1), (y0 * 0.6), false, false);
          }else {
           
            const sourceHeight = (source?.height ?? 0) - (sourcePos * 8) + (RANGE_GAP / 2)
            const targetHeight = (target?.height ?? 0) - (targetPos* 8)  + (RANGE_GAP / 2)
            return this.createEdge((x0 + (RANGE_GAP / 2)), sourceHeight, (x0 + (RANGE_GAP / 2)), targetHeight, (controlPointX * 1.1), (y0 * 0.9), false, false);
          }
          
        } 
        if((x0 !== x1) && y0 == y1){
          if(this.ChapterGroup[targetKey]){
            const sourcePos = ((this.duplucateChaptersPosition[sourceKey]?.findIndex((e) => e.id == source?.id)) + 1);
            const targetPos = ((this.duplucateChaptersPosition[targetKey]?.findIndex((e) => e.id == target?.id)) + 1);
            const sourceHeight = (source?.height ?? 0) - (sourcePos * 15) + 10
            const targetHeight = (target?.height ?? 0) - (targetPos* 15) - 5
            return this.createEdge(x0, sourceHeight, x1, targetHeight, controlPointX, controlPointY, isHorizontal, isCurve);

          }
          else{
            const sourcePos = ((this.duplucateChaptersPosition[sourceKey]?.findIndex((e) => e.id == source?.id)) + 1)  || 1;
            const targetPos = ((this.duplucateChaptersPosition[targetKey]?.findIndex((e) => e.id == target?.id)) + 1) || 1;
            const sourceHeight = (source?.height != undefined? source.height :  0) - (sourcePos * 8) + 10
            const targetHeight = (target?.height != undefined? target?.height : 0) - (targetPos* 8)  + 10
            return this.createEdge(x0, sourceHeight, x1, targetHeight, controlPointX, controlPointY, isHorizontal, isCurve);
          }
          

        }
        else {

          if(this.ChapterGroup[targetKey]){
            const sourcePos = ((this.duplucateChaptersPosition[sourceKey]?.findIndex((e) => e.id == source?.id)) + 1);
            const targetPos = ((this.duplucateChaptersPosition[targetKey]?.findIndex((e) => e.id == target?.id)) + 1);
            const sourceHeight = (source?.height ?? 0) - (sourcePos * 15) + 10
            const targetHeight = (target?.height ?? 0) - (targetPos* 15) - 5
            return this.createEdge(x0, sourceHeight, x1, targetHeight, controlPointX, controlPointY, isHorizontal, isCurve);

          }
          else{
            const sourcePos = ((this.duplucateChaptersPosition[sourceKey]?.findIndex((e) => e.id == source?.id)) + 1)  || 1;
            const targetPos = ((this.duplucateChaptersPosition[targetKey]?.findIndex((e) => e.id == target?.id)) + 1) || 1;
            const sourceHeight = (source?.height != undefined? source.height :  0) - (sourcePos * 8) + 10
            const targetHeight = (target?.height != undefined? target?.height : 0) - (targetPos* 8)  + 10
            return this.createEdge(x0, sourceHeight, x1, targetHeight, controlPointX, controlPointY, isHorizontal, isCurve);
          }

        }
    })
    
      .attr("fill", "none")
      .attr("stroke", (a:any) => a.color)
      .attr("stroke-width", (a) => a.focus?EDGE_BORDER_WIDTH_DEFAULT * 2: EDGE_BORDER_WIDTH_DEFAULT)
      .attr("cursor", "pointer")
      .attr("cursor", "pointer")
      .on("contextmenu", (event: MouseEvent, connection: Connection) => {
        event.preventDefault();
        this.trggerConnectionMenu.openMenu();
        const menuElement = document.querySelector("#" + this.trggerConnectionMenu.menu?.panelId) as HTMLElement;
        if (menuElement) {
          menuElement.style.position = "absolute";
          menuElement.style.left = `${event.x + 5}px`;
          menuElement.style.top = `${event.y + 5}px`;
        }
        this.selectedConnection = connection;

        // Atualiza a cor dos capítulos conectados
        const target = this.chapters.find(chp => chp.id === connection.targetChapterID);
        const source = this.chapters.find(chp => chp.id === connection.sourceChapterID);

        if (target) {
          target.color = "black";
          this.wd.updateChapter(target);
        }
        if (source) {
          source.color = "black";
          this.wd.updateChapter(source);
        }
      })
      .on("mouseover", function (_: MouseEvent, connection: Connection) {
        d3.select(this)
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT * 2);

        d3.select(document.getElementById( `${connection.sourceChapterID}-chapter-circle`))
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT * 1.3);

          d3.select(document.getElementById( `${connection.targetChapterID}-chapter-circle`))
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT * 1.3);
          
        d3.select(document.getElementById( `${connection.sourceChapterID}-chapter-group-txt`))
        .transition()
        .duration(100)
        .attr("font-weight", 700)
        .attr("display", "block")

          d3.select(document.getElementById( `${connection.targetChapterID}-chapter-group-txt`))
          .transition()
          .duration(100)
          .attr("font-weight", 700)
          .attr("display", "block")
        
          
      })
      .on("mouseout", function (_: MouseEvent, connection: Connection) {
        d3.select(this)
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT);

          d3.select(document.getElementById( `${connection.sourceChapterID}-chapter-circle`))
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT);
          d3.select(document.getElementById( `${connection.targetChapterID}-chapter-circle`))
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT);

          d3.select(document.getElementById( `${connection.sourceChapterID}-chapter-group-txt`))
          .transition()
          .duration(100)
          .attr("font-weight", 500)
          .attr("display", "" + txtDisplay)
  
          d3.select(document.getElementById( `${connection.targetChapterID}-chapter-group-txt`))
          .transition()
          .duration(100)
          .attr("font-weight", 500)
          .attr("display", "" + txtDisplay)
            
      });

    // Garante que as conexões estejam no topo
    connectionPaths.raise();
  }


  callPreviewDialog() {
    if (this.selectedChapter) {
      this.dialog.openPreview(this.selectedChapter, `150ms`, `150ms`)
    }
  }

  renderStoryLines(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    strs: StoryLine[]
  ) {
    const widthTimelines = (this.timelines.reduce((a, b) => a + b.range, 5) * RANGE_GAP) + (this.timelines.length * RANGE_GAP)


    const widthChapter = this.chapters
      .sort((a, b) => b.width - a.width)[0]?.width ?? 1535
    let width = widthTimelines > widthChapter ? widthTimelines : widthChapter

    let el = svg.selectAll("g.storyline-group")
      .data(strs)
      .enter()
      .append("g")
      .attr("class", "storyline-group")
      .attr("id", (t: StoryLine) => `${CSS.escape(t.id)}-storyline-group`);


    el.append("path")
      .attr("d", (st: StoryLine) => {
        const strHeight = (st.order * this.gridHeight);
        this.graphHeigh += this.gridHeight
        return this.createEdge(MARGIN + this.gridHeight, strHeight, width, strHeight, width, strHeight, true, false);
      })
      .attr("fill", "none")
      .style("stroke-dasharray", ("5,3"))  // Faz o traço ser pontilhado
      .style("stroke", "rgba(0, 0, 0, 0.25)")  // Define a cor da linha

    el.append("text")
      .attr("dx", () => MARGIN)
      .attr("y", (node: any) => (node.order * this.gridHeight) + 2)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("text-anchor", "middle")
      .attr("cursor", "pointer")
      .text((node: any) => node.name)
      .call(
        d3.drag<SVGTextElement, StoryLine>()
          .on("start", (event, str) => this.storyLineSwapDragStart(event, str, strs))
          .on("drag", (event, str) => this.storyLineSwapDragged(event, strs))
          .on("end", (event, str) => this.storyLineSwapDragEnded(event, svg, strs))
      )
      .on('contextmenu', (event: MouseEvent, str: StoryLine) => {
        event.preventDefault();

        // this.trigger.menuData ={ xPosition: ev.clientX, yPosition: ev.clientY }

        this.storylineMenuTrigger.openMenu();
        const menu = document.querySelector("#" + this.storylineMenuTrigger.menu?.panelId)
        const menuElement = document.querySelector("#" + this.storylineMenuTrigger.menu?.panelId) as HTMLElement;

        if (menuElement) {
          // Defina o estilo de posicionamento
          menuElement.style.position = 'absolute';
          menuElement.style.left = `${event.x + 10}px`;
          menuElement.style.top = `${event.y + 5}px`;
        }
        this.storylineSelected = str

      })
  }

  storyLineSwapDragStart(event: MouseEvent,str: StoryLine, strs: StoryLine[]) {
    if (strs.length <= 1) {
      return
    }
    this.storylineY = event.y
    this.storylineOrderToUpdate = str.order

    this.storylineSelected = str
    const elementId = `${CSS.escape(str.id)}-storyline-group`;
    d3.select(document.getElementById(elementId)).select("text").attr("font-size", "20");

  }

  openStrDetails() {
    if (this.storylineSelected) {
      const params: description= {
        id: this.storylineSelected.id,
        resource_type: "storyline",
        name: this.storylineSelected.name
      }
      this.dialog.openChapterDescription(params, '150ms', '150ms')
    }
  }
  openStrEdit() {
    if (this.storylineSelected) {
      this.dialog.openStorylineEditDialog(this.storylineSelected, '150ms', '150ms')
    }
  }
  // aqui aqui de novo
  //  aqui . 
  storyLineSwapDragged(event: MouseEvent, strs: StoryLine[]) {
    if (strs.length <= 1) return;

    const y = (event.y / this.zoom) - this.tiltY;
    this.reset = false;

    let mousePos = Math.max(0, Math.round((y - 0.2) / this.gridHeight) - 1);
    mousePos = Math.min(mousePos, strs.length - 1);
    this.nextStorylineSelected = Math.min(mousePos + 1, strs.length - 2);

    let newStrl: StoryLine = strs[mousePos];
    if (!newStrl.order) return;

    const selectedElementText = d3.select(document.getElementById(`${CSS.escape(this.storylineSelected.id)}-storyline-group`)).select("text");
    const isSame = this.storylineSelected.id === newStrl.id;
    const selectedNewElementID = `${CSS.escape(newStrl.id)}-storyline-group`;
    const newstrlElement: any = d3.select(document.getElementById(selectedNewElementID)).select("text");

    let toWalk = newStrl.order - (this.prevStoryline?.order || 0);
    toWalk = Math.max(toWalk, 1);

    

    if (!isSame) {
        const tempOrder = this.storylineSelected.order;
        this.storylineSelected.order = newStrl.order;
        newStrl.order = tempOrder;
        strs.sort((a, b) => a.order - b.order);
    }

    const selectedChapters = this.getChapterByStoryline(this.storylineSelected)
    const newstorylineChapters = this.getChapterByStoryline(newStrl)
    selectedElementText.interrupt();
    newstrlElement.interrupt();

    if (!isSame && this.storylineSelected.order > newStrl.order) {
        selectedElementText
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', (newStrl.order * this.gridHeight) + 2);

            this.updateChapterHeight(selectedChapters, (newStrl.order * this.gridHeight) + 2)
            
            
            if (this.prevStoryline && this.prevStoryline.order < newStrl.order) {
              const prevElementID = `${CSS.escape(this.prevStoryline.id)}-storyline-group`;
              const prevElementText = d3.select(document.getElementById(prevElementID)).select("text");
              const prevstorylineChapters = this.getChapterByStoryline(this.prevStoryline)
              
              prevElementText.interrupt().transition()
              .duration(100)
              .ease(d3.easeCubic)
              .attr('y', (this.prevStoryline.order * this.gridHeight));
              this.updateChapterHeight(prevstorylineChapters, (this.prevStoryline.order * this.gridHeight))
        } else {
            newstrlElement.transition()
                .duration(100)
                .ease(d3.easeCubic)
                .attr('y', ((this.prevStoryline.order + 1) * this.gridHeight) - 2);
                this.updateChapterHeight(newstorylineChapters, ((this.prevStoryline.order + 1) * this.gridHeight) - 2)

        }
    } else if (!isSame && this.storylineSelected.order < newStrl.order) {
        selectedElementText
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', (newStrl.order * this.gridHeight) + 2);
            this.updateChapterHeight(selectedChapters, (newStrl.order * this.gridHeight) + 2)


        if (this.prevStoryline && this.prevStoryline.order > newStrl.order) {
            const prevElementID = `${CSS.escape(this.prevStoryline.id)}-storyline-group`;
            const prevElementText = d3.select(document.getElementById(prevElementID)).select("text");
            const prevstorylineChapters = this.getChapterByStoryline(this.prevStoryline)

            prevElementText.interrupt().transition()
                .duration(100)
                .ease(d3.easeCubic)
                .attr('y', (this.prevStoryline.order * this.gridHeight));
                this.updateChapterHeight(prevstorylineChapters, (this.prevStoryline.order * this.gridHeight))

        } else {
            newstrlElement.transition()
                .duration(100)
                .ease(d3.easeCubic)
                .attr('y', ((this.prevStoryline.order - 1) * this.gridHeight) - 2);
                this.updateChapterHeight(newstorylineChapters, ((this.prevStoryline.order - 1) * this.gridHeight) - 2)

        }
    }

    if (isSame && this.storylineSelected.order === newStrl.order) {
        const prevElementID = this.prevStoryline ? `${CSS.escape(this.prevStoryline.id)}-storyline-group` : '';
        const prevElementText = prevElementID ? d3.select(document.getElementById(prevElementID)).select("text") : null;
        
        if (prevElementText) {
          const prevstorylineChapters = this.getChapterByStoryline(this.prevStoryline)
            prevElementText.interrupt().transition()
                .duration(100)
                .ease(d3.easeCubic)
                .attr('y', (this.prevStoryline.order * this.gridHeight));
                this.updateChapterHeight(prevstorylineChapters, (this.prevStoryline.order * this.gridHeight))

        }

        selectedElementText.transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', (this.storylineSelected.order * this.gridHeight));
            this.updateChapterHeight(selectedChapters, this.storylineSelected.order * this.gridHeight)

    }

    this.storylineOrderToUpdate = newStrl.order;
    this.prevStoryline = newStrl;
}





getChapterByStoryline(str:StoryLine): Chapter[]{
  return this.chapters.filter((chp) => chp.storyline_id == str.id )
}

updateChapterHeight(chapters: Chapter[], height: number){
  if(!this.ss?.storyline_update_chapter){
    return
  }
  chapters.forEach((c) => {
    const id = document.getElementById(`${c.id}-chapter-circle`);
    d3.select(id)
    .transition()
    .duration(100)
    .attr("cy", height);
    
    
    if(this.ss?.chapter_names){
      const idTxt = document.getElementById( `${c.id}-chapter-group-txt`);
      d3.select(idTxt)
      .transition()
      .duration(100)
      .attr("dy", height + 15)
    }

    

    this.updateConnectionByChapter(c, height, true)
  })
}
updateChapterWidth(chapters: Chapter[], width: number){
  if(!this.ss?.timeline_update_chapter){
    return
  }
  chapters.forEach((c) => {
    const base = document.getElementById(`${c.id}-chapter-group`);
    const el = d3.select(base).select('circle')

    el
    .transition()
    .duration(100)
    .attr("cx", width + (c.range * RANGE_GAP));
    
    
    if(this.ss?.chapter_names){
      d3.select(base).select('text')
      .transition()
      .duration(100)
      .attr("dx", width + (c.range * RANGE_GAP))
    }

    

    this.updateConnectionByChapter(c, width + (c.range * RANGE_GAP), false)
  })
}
updateConnectionByChapter(chapter: Chapter, newNumber: number, isHeight:boolean) {
  if(isHeight){
    chapter.height = newNumber;
  }else {
    chapter.width = newNumber
  }
  const connections = this.connections.filter((cnn) => cnn.sourceChapterID == chapter.id || cnn.targetChapterID == chapter.id);

  connections.forEach((cnn) => {
    const el = d3.select(document.getElementById(cnn.id + "-connections-group"))
      .transition() // Inicia a transição
      .duration(100) // Define a duração para 100ms
      .attr("d", () => {
        let source = this.chapters.find((data: Chapter) => data.id === cnn.sourceChapterID);
        let target = this.chapters.find((data: Chapter) => data.id === cnn.targetChapterID);

        source = source?.id == chapter.id ? chapter : source;
        target = target?.id == chapter.id ? chapter : target;

        let y0 = source ? source.height : 0;
        let x0 = source ? source.width : 0;
        let x1 = target ? target.width : 0;
        let y1 = target ? target.height : 0;

        const CONSTANT_CONTROL_POINT = 5;
        const HORIZONTAL_THRESHOLD = 3;

        const interferingChapters = this.chapters.filter(chp => {
          if (source && target && chp.id !== source.id && chp.id !== target.id) {
            const withinXRange = (chp.width >= Math.min(source.width, target.width)) &&
                                 (chp.width <= Math.max(source.width, target.width));

            const withinYRange = (chp.height >= Math.min(source.height, target.height)) &&
                                 (chp.height <= Math.max(source.height, target.height));

            return withinXRange && withinYRange;
          }
          return false;
        });

        let isHorizontal = Math.abs(y0 - y1) < HORIZONTAL_THRESHOLD;
        let isVertical = Math.abs(x0 - x1) < HORIZONTAL_THRESHOLD;

        let controlPointX = isHorizontal ? x1 : x1 + CONSTANT_CONTROL_POINT * ((x1 - x0) / (y1 - y0));
        let controlPointY = isVertical ? y1 : y1 - CONSTANT_CONTROL_POINT * ((y1 - y0) / (x1 - x0));

        const isCurve = interferingChapters.length > 0;
        const sourceKey: any = `${source?.height}-${source?.width}`;
        const targetKey: any = `${target?.height}-${target?.width}`;

        if ((x0 == x1) && y0 == y1) {
          const sourcePos = ((this.duplucateChaptersPosition[sourceKey].findIndex((e) => e.id == source?.id)) + 1);
          const targetPos = ((this.duplucateChaptersPosition[targetKey].findIndex((e) => e.id == target?.id)) + 1);

          if (this.ChapterGroup[targetKey]) {
            const sourceHeight = (source?.height ?? 0) - (sourcePos * 15);
            const targetHeight = (target?.height ?? 0) - (targetPos * 15);
            return this.createEdge((x0 + 10), sourceHeight, (x0 + 10), targetHeight, (controlPointX * 1.1), (y0 * 0.6), false, false);
          } else {
            const sourceHeight = (source?.height ?? 0) - (sourcePos * 8) + 10;
            const targetHeight = (target?.height ?? 0) - (targetPos * 8) + 10;
            return this.createEdge((x0 + 10), sourceHeight, (x0 + 10), targetHeight, (controlPointX * 1.1), (y0 * 0.9), false, false);
          }
        }

        if ((x0 !== x1) && y0 == y1) {
          if (this.ChapterGroup[targetKey]) {
            const sourcePos = ((this.duplucateChaptersPosition[sourceKey]?.findIndex((e) => e.id == source?.id)) + 1);
            const targetPos = ((this.duplucateChaptersPosition[targetKey]?.findIndex((e) => e.id == target?.id)) + 1);
            const sourceHeight = (source?.height ?? 0) - (sourcePos * 15) + 10;
            const targetHeight = (target?.height ?? 0) - (targetPos * 15) - 5;
            return this.createEdge(x0, sourceHeight, x1, targetHeight, controlPointX, controlPointY, isHorizontal, isCurve);
          } else {
            const sourcePos = ((this.duplucateChaptersPosition[sourceKey]?.findIndex((e) => e.id == source?.id)) + 1) || 1;
            const targetPos = ((this.duplucateChaptersPosition[targetKey]?.findIndex((e) => e.id == target?.id)) + 1) || 1;
            const sourceHeight = (source?.height != undefined ? source.height : 0) - (sourcePos * 8) + 10;
            const targetHeight = (target?.height != undefined ? target?.height : 0) - (targetPos * 8) + 10;
            return this.createEdge(x0, sourceHeight, x1, targetHeight, controlPointX, controlPointY, isHorizontal, isCurve);
          }
        } else {
          if (this.ChapterGroup[targetKey]) {
            const sourcePos = ((this.duplucateChaptersPosition[sourceKey]?.findIndex((e) => e.id == source?.id)) + 1);
            const targetPos = ((this.duplucateChaptersPosition[targetKey]?.findIndex((e) => e.id == target?.id)) + 1);
            const sourceHeight = (source?.height ?? 0) - (sourcePos * 15) + 10;
            const targetHeight = (target?.height ?? 0) - (targetPos * 15) - 5;
            return this.createEdge(x0, sourceHeight, x1, targetHeight, controlPointX, controlPointY, isHorizontal, isCurve);
          } else {
            const sourcePos = ((this.duplucateChaptersPosition[sourceKey]?.findIndex((e) => e.id == source?.id)) + 1) || 1;
            const targetPos = ((this.duplucateChaptersPosition[targetKey]?.findIndex((e) => e.id == target?.id)) + 1) || 1;
            const sourceHeight = (source?.height != undefined ? source.height : 0) - (sourcePos * 8) + 10;
            const targetHeight = (target?.height != undefined ? target?.height : 0) - (targetPos * 8) + 10;
            return this.createEdge(x0, sourceHeight, x1, targetHeight, controlPointX, controlPointY, isHorizontal, isCurve);
          }
        }
      });
  });
}


storyLineSwapDragEnded(event: MouseEvent, svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, strs: StoryLine[]) {
    const elementId = `${CSS.escape(this.storylineSelected.id)}-storyline-group`;
    d3.select(document.getElementById(elementId)).select("text").attr("font-size", "12");
    if (!this.storylineSelected) {
      return
    }

    const diff = Math.abs(this.storylineY - event.y); // Calcula a diferença absoluta

    if (diff < 25) {
      this.storylineSelected = {
        Created_at: "" ,
        description: "",
        id: "",
        order: 0,
        world_id: "",
        name: ""
      }
      return; // Retorna se a diferença for menor que 25
    }
    this.storylineSelected.order = this.storylineOrderToUpdate;

    const reordenadas: StoryLine[] = [];

    let currentOrder = 1;
    strs
      .sort((a, b) => a.order - b.order)
      .forEach((t) => {
        if (t.id === this.storylineSelected.id) {
          t.order = this.storylineSelected.order;
        } else {
          if (currentOrder === this.storylineSelected.order) {
            currentOrder++;
          }
          t.order = currentOrder;
          currentOrder++;
        }
        reordenadas.push(t);
      });

      const storylinesToUpdate = this.reset ? strs : reordenadas;

      this.api.updateStoryLineList(storylinesToUpdate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          data.forEach(str => {
            this.wd.updateStoryline(str)
          });
        },
        error: (e)=>this.errorHandler.errHandler(e)
      })
   
      if(!this.ss?.storyline_update_chapter){
        const chps = this.chapters.map((c) => {
          const pos = Math.round(c.height / this.gridHeight) <=1? 1 : Math.round(c.height / this.gridHeight)
          const storyline = strs.find((s) => s.order == pos)
          c.storyline_id = storyline?.id || c.storyline_id
          return c
        })
      this.api.updateChapterList(chps)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chpList) => {
          chpList.forEach((c) => {
            this.wd.updateChapter(c)
          })
        },
        error: (e) => this.errorHandler.errHandler(e)
      })
    }
    this.prevTimeline = undefined;

  }
  calculateXPosition(tl: Timeline, data: Timeline[]) {
    let range = 100;
    const currentOrder = data.filter((t: Timeline) => t.order <= tl.order);
    const anteriorRange = currentOrder.reduce((a: any, b: any) => a + b.range, 0);
    return ((anteriorRange - tl.range) * RANGE_GAP) + range + ((tl.range / 2) * RANGE_GAP);
  };


  buttonPositions(tl: Timeline, timelines: Timeline[], index: number) {
    const width = (tl.range * RANGE_GAP);
    return this.calculateEditIconPosition(tl, timelines) + (tl.range * (RANGE_GAP / 2)) - (RANGE_GAP / 2) + this.buttonsSpacing[index]; // Calcula a posição proporcional
  };

  renderTimeLines(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    data: Timeline[],
    height: number
  ) {
    const gridHeight = (height * this.gridHeight);
    this.totalGridHeight = gridHeight;

    // Seleciona os grupos existentes e associa os dados
    let el: d3.Selection<SVGGElement, Timeline, SVGGElement, unknown> = svg
      .selectAll<SVGGElement, Timeline>("g.timeline-group")
      .lower()
      .data(data, (d: Timeline) => d.id);

    // Remove os grupos que não estão mais nos dados
    el.exit().remove();

    // Cria novos grupos para novos dados
    const enter = el.enter()
      .append<SVGGElement>("g")
      .attr("class", "timeline-group")
      .attr("id", (t: Timeline) => `${CSS.escape(t.id)}-timeline-group`);

    // Atualiza grupos existentes e novos grupos
    el = enter.merge(el);

    // Adiciona ou atualiza os retângulos (o corpo da timeline)
    el.append("rect")
      .attr("class", "timeline-body")
      .attr("id", (t) => t.id+"-timeline-body")
      .attr("x", (tl: Timeline) => this.calculateEditIconPosition(tl, data))
      .attr("y", this.gridHeight)
      .attr("width", (tl: Timeline) => (tl.range * RANGE_GAP) - 5)
      .attr("height", gridHeight)
      .style("fill", "rgba(100, 10, 0, 0.1)");


    // Criação do header da timeline
    const headerTimeline = el
      .lower()
      .append<SVGGElement>("g")

    // Adiciona o background do header usando 'rect'
    headerTimeline
      .append("rect")
      .attr("class", "timeline-header")
      .attr("x", (tl: Timeline) => this.calculateEditIconPosition(tl, data))
      .attr("y", 0) // Posiciona no topo
      .attr("width", (tl: Timeline) => (tl.range * RANGE_GAP) - 5)
      .attr("height", 45) // Altura do header
      .style("fill", "rgba(100, 100, 0, 0.25)")  // Define a cor do header
      .style("stroke", "#000")  // Adiciona uma borda se necessário
      .style("stroke-width", "1px")
      .attr("cursor", "pointer")
      .call(
        d3.drag<SVGRectElement, Timeline>()
          .on("start", (event, t) => this.timelineSwapDragStart(event, t, data))
          .on("drag", (event, t) => this.timelineSwapDragged(event, data))
          .on("end", (event, t) => this.timelineSwapDragEnded(event, svg, data))
      )
      .on('contextmenu', (e: MouseEvent, tl: Timeline) => this.timeLineMenu(e, tl))


    // Nome da timeline no header, centralizado abaixo dos botões
    headerTimeline.append("text")
      .attr("class", "timeline-txt")
      .attr("x", (tl: Timeline) => this.calculateXPosition(tl, data)) // Centralizado
      .attr("y", this.timeLineTxtHeight + 5) // Abaixo dos botões
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("text-anchor", "middle")
      .attr("cursor", "pointer")
      .text((tl: Timeline) => tl.name)
      .call(
        d3.drag<SVGTextElement, Timeline>()
          .on("start", (event, t) => this.timelineSwapDragStart(event, t, data))
          .on("drag", (event, t) => this.timelineSwapDragged(event, data))
          .on("end", (event, t) => this.timelineSwapDragEnded(event, svg, data))
      )
      .on('contextmenu', (e: MouseEvent, tl: Timeline) => this.timeLineMenu(e, tl))

  }


  updateTimeline(){  
    this.dialog.openUpdateTimelineDialog(this.selectedTimeline, "150ms", "150ms")
  }
  deleteTimeline(){ 
    this.dialog.openDeleteTimelineDialog({ timeline: this.selectedTimeline, timelines: this.timelines, chapters: this.chapters }, "150ms", "150ms") 
  }


  getElementCenter(element: any) {
    return (element.node().getBoundingClientRect().width / this.zoom) / 2
  }

  private calculateEditIconPosition(tl: Timeline, data: Timeline[]): number {
    let range = 100;
    const currentOrder = data.filter((t: Timeline) => t.order <= tl.order);
    const anteriorRange = currentOrder.reduce((a: any, b: any) => a + b.range, 0);
    return ((anteriorRange - tl.range) * RANGE_GAP) + range;
  }



  timelineSwapDragStart(event:MouseEvent ,t: Timeline, timelines: Timeline[]) {
    if (timelines.length <= 1) {
      return
    }
    this.timelineX = event.x

    this.selectedTimeline = t
    const elementId = `${CSS.escape(this.selectedTimeline.id)}-timeline-group`;
    d3.select(document.getElementById(elementId)).attr("stroke", "black");

  }

  private dragOffsetX = 0;
  eventDragStart(nativeEvent: any, e: Event) {
    
    this.selectedEvent = e
    const elementId = `${CSS.escape(e.id)}-event-group`;
    d3.select(document.getElementById(elementId)).attr("stroke", "black");
    // Calcula a posição do clique dentro do retângulo no início do drag
    const eventElement = document.getElementById(`${CSS.escape(e.id)}-event-body`);
    if (eventElement) {
      const rect = eventElement.getBoundingClientRect();
      this.dragOffsetX = nativeEvent.sourceEvent.clientX - rect.x; // Posição do clique relativa ao retângulo
    }
  }
  
  eventDragged(nativeEvent: any, e: Event) {
    if (!this.selectedEvent) return;
  
    // Largura total das timelines
    const widthTimelines = (this.timelines.reduce((a, b) => a + b.range, 5) * RANGE_GAP) + (this.timelines.length * RANGE_GAP);
  
    // Posição relativa corrigida com o offset de drag
    const relativeX = (((nativeEvent.sourceEvent.clientX - this.dragOffsetX) - this.tiltX) / this.zoom);
  
    // Impede que o evento seja arrastado para fora dos limites definidos
    if (relativeX < 100 || relativeX > widthTimelines) return;
  
    // Cálculo do range start com ajuste para RANGE_GAP
    const rangeStart = Math.round((relativeX - 100) / RANGE_GAP);
  
    // Atualiza as posições dos elementos
    const eventBodyElement = d3.select(document.getElementById(`${CSS.escape(e.id)}-event-body`));
    const eventBottomElement = d3.select(document.getElementById(`${CSS.escape(e.id)}-event-bottom`));
    const eventTxtElement = d3.select(document.getElementById(`${CSS.escape(e.id)}-event-txt`));
  
    eventBodyElement.attr("x", relativeX);
    eventBottomElement.attr("x", relativeX);
    eventTxtElement.attr("x", relativeX + (e.range * (RANGE_GAP / 2)));
  
    this.selectedEvent.startRange = rangeStart;
    
    d3.select(document.getElementById(`${CSS.escape(e.id)}-event-resize-right`))
      .attr("x", relativeX + (e.range * RANGE_GAP) - 20);
  
    d3.select(document.getElementById(`${CSS.escape(e.id)}-event-resize-left`))
      .attr("x", relativeX + 5);
  }
  
  
  eventDragEnd(el: any, e: Event) {
    if (this.selectedEvent) {
      this.api.updateEvent(this.selectedEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (e) => {
          this.wd.updateEvent(e)
        },
        error: (e) => this.errorHandler.errHandler(e)
      })

      
      const chaptersRelated = this.chapters.filter((c) => {
        const range = (c.width - 100) / RANGE_GAP
        if(this.selectedEvent && range >= this.selectedEvent.startRange && range <= (this.selectedEvent.startRange + this.selectedEvent.range)){
          c.event_Id = this.selectedEvent.id
          this.wd.updateChapter(c)
          return c
        }else {
          if(c.event_Id == this.selectedEvent?.id){
            c.event_Id = ""
            return c
          }

          return false
        }
      })
      if(chaptersRelated.length > 0){
        this.api.updateChapterList(chaptersRelated)
        .pipe(takeUntil(this.destroy$))
        .subscribe((c) => {

          return c
        })
      }

      this.selectedEvent = undefined
    } else {
      return
    }
  }


  getChapterByTimeline(tl:Timeline): Chapter[]{
    return this.chapters.filter((c) => c.timeline_id == tl.id)
  }




  timelineSwapDragged(event: any, timelines: Timeline[]) {
    if (timelines.length <= 1) {
      return
    }
    const selectedElementiD = `${CSS.escape(this.selectedTimeline.id)}-timeline-group`;
    const CurrentSelectedTimelineElement: any = d3.select(document.getElementById(selectedElementiD));
    const rectElement = CurrentSelectedTimelineElement.select(".timeline-body");
    const rectElementHeader = CurrentSelectedTimelineElement.select(".timeline-header");
    const textElement = CurrentSelectedTimelineElement.selectAll("text");


    const x = (event.x / this.zoom) - this.tiltX

    const newTimeline = this.findTimelineForChapter(timelines, x).timeline

    const isSame = this.selectedTimeline.id == newTimeline.id


    const beforeSelected = timelines.filter((t) => t.order <= newTimeline.order)

    const selectedNewElementiD = `${CSS.escape(newTimeline.id)}-timeline-group`;
    const newTimelineElement: any = d3.select(document.getElementById(selectedNewElementiD));
    const newRectElement = newTimelineElement.select(".timeline-body");
    const newRectheaderElement = newTimelineElement.select(".timeline-header");
    const newTextElement = newTimelineElement.selectAll("text");

    const currentElementLocation = this.calculateEditIconPosition(newTimeline, beforeSelected)
    const otherElementLocation = this.calculateEditIconPosition(newTimeline, timelines)

    const newTimelineChapters = this.getChapterByTimeline(newTimeline)
    const selectedTimelineChapters = this.getChapterByTimeline(this.selectedTimeline)


    if (!isSame && this.selectedTimeline.order > newTimeline.order) {
      const diff = ((this.selectedTimeline.range - newTimeline.range) / 2) * RANGE_GAP

      rectElement
        .transition()
        .duration(100)
        .ease(d3.easeCubic)
        .attr('x', otherElementLocation)

      rectElementHeader
        .transition()
        .duration(100)
        .ease(d3.easeCubic)
        .attr('x', otherElementLocation)


      textElement._groups[0].forEach((element: any, i: number) => {
        const pos = i >= 3 ? 1 : i
        d3.select(element)
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("x", () => 30 + this.buttonPositions(newTimeline, timelines, pos) + diff)
      });

      this.updateChapterWidth(selectedTimelineChapters, otherElementLocation -RANGE_GAP)

      //  aqui ---------------------------
      if (this.prevTimeline != undefined && this.prevTimeline.order < newTimeline.order) {

        const prevNewElementiD = `${CSS.escape(this.prevTimeline?.id)}-timeline-group`;
        const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD));
        const prevRectElement = prevTimelineElement.select(".timeline-body");
        const prevRectheaderElement = prevTimelineElement.select(".timeline-header");
        const prevtextElement = prevTimelineElement.selectAll("text");

        prevRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation - (this.prevTimeline?.range * RANGE_GAP));
        prevRectheaderElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation - (this.prevTimeline?.range * RANGE_GAP));

        prevtextElement._groups[0].forEach((element: any, i: number) => {
          const pos = i >= 3 ? 1 : i
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => 30 + this.buttonPositions(timelines[newTimeline.order - 2], timelines, pos))
        });
        const prevTimelineChapters = this.getChapterByTimeline(this.prevTimeline)
        this.updateChapterWidth(prevTimelineChapters, otherElementLocation - (this.prevTimeline?.range * RANGE_GAP))

      } else {
        const elPos = otherElementLocation + (this.selectedTimeline.range * RANGE_GAP)
        newRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', elPos);

        newRectheaderElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', elPos);


        let diff = ((this.selectedTimeline.range - newTimeline.range) / 2) * RANGE_GAP

        newTextElement._groups[0].forEach((element: any, i: number) => {
          const pos = i >= 3 ? 1 : i
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => (elPos + (newTimeline.range * (RANGE_GAP / 2)) - 7 + this.buttonsSpacing[pos]))

        });
        this.updateChapterWidth(newTimelineChapters, elPos - RANGE_GAP)

      }

    } else if (!isSame && this.selectedTimeline.order < newTimeline.order) {

      const elPosition = currentElementLocation + (newTimeline.range - this.selectedTimeline.range) * RANGE_GAP
      rectElement
        .transition()
        .duration(100)
        .ease(d3.easeCubic)
        .attr('x', elPosition);
      rectElementHeader
        .transition()
        .duration(100)
        .ease(d3.easeCubic)
        .attr('x', elPosition);

      textElement._groups[0].forEach((element: any, i: number) => {
        const pos = i >= 3 ? 1 : i

        const tl = timelines[newTimeline.order] ? timelines[newTimeline.order] : timelines[newTimeline.order - 1]

        d3.select(element)
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("x", () => (elPosition + (this.selectedTimeline.range * (RANGE_GAP / 2)) - 7 + this.buttonsSpacing[pos]))
          
          // .attr('x', (currentElementLocation + (newTimeline.range - this.selectedTimeline.range) * RANGE_GAP+ this.getElementCenter(rectElement)));
        });
        this.updateChapterWidth(selectedTimelineChapters, elPosition - RANGE_GAP)


      if (this.prevTimeline != undefined && this.prevTimeline?.order > newTimeline.order) {

        const Location = this.calculateEditIconPosition(this.prevTimeline, timelines)
        const range = this.prevTimeline?.range
        const prevNewElementiD = `${CSS.escape(this.prevTimeline?.id)}-timeline-group`;
        const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD));
        const prevRectElement = prevTimelineElement.select(".timeline-body");
        const prevRectheaderElement = prevTimelineElement.select(".timeline-header");
        const prevtextElement = prevTimelineElement.selectAll("text");

        prevRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', Location);

        prevRectheaderElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', Location);

        prevtextElement._groups[0].forEach((element: any, i: number) => {
          const pos = i >= 3 ? 1 : i
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => (Location + (range * (RANGE_GAP / 2)) - 7 + this.buttonsSpacing[pos]))
            
            // .attr('x', Location + this.getElementCenter(prevRectElement));
          });


      } else {
        const elPosition = otherElementLocation - (this.selectedTimeline.range * RANGE_GAP)


        newRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', elPosition);

        newRectheaderElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', elPosition);

        newTextElement._groups[0].forEach((element: any, i: any) => {

          const pos = i >= 3 ? 1 : i

          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => (elPosition + (newTimeline.range * (RANGE_GAP / 2)) - 7 + this.buttonsSpacing[pos]))

        });
        this.updateChapterWidth(newTimelineChapters, elPosition - RANGE_GAP )
      }


    } else if (isSame && this.selectedTimeline.order == newTimeline.order) {

      if (this.prevTimeline != undefined && this.prevTimeline?.order > newTimeline.order) {

        const Location = this.calculateEditIconPosition(this.prevTimeline, timelines)

        const prevNewElementiD = `${CSS.escape(this.prevTimeline?.id)}-timeline-group`;
        const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD));
        const prevRectElement = prevTimelineElement.select(".timeline-body");
        const prevRectheaderElement = prevTimelineElement.select(".timeline-header");
        const prevtextElement = prevTimelineElement.selectAll("text");
        const prevTimelineChapters = this.getChapterByTimeline(this.prevTimeline)

        prevRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', Location);

        prevRectheaderElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', Location);


        prevtextElement._groups[0].forEach((element: any, i: number) => {
          const pos = i >= 3 ? 1 : i

          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => 30 + this.buttonPositions(this.prevTimeline ?? this.selectedTimeline, timelines, pos))
            
          });
          this.updateChapterWidth(prevTimelineChapters, Location - RANGE_GAP)




      } else {

        if (this.prevTimeline != undefined) {
          const Location = this.calculateEditIconPosition(this.prevTimeline, timelines)

          const prevNewElementiD = `${CSS.escape(this.prevTimeline?.id)}-timeline-group`;
          const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD));
          const prevRectElement = prevTimelineElement.select(".timeline-body");
          const prevRectheaderElement = prevTimelineElement.select(".timeline-header");
          const prevtextElement = prevTimelineElement.selectAll("text");
          const prevTimelineChapters = this.getChapterByTimeline(this.prevTimeline)

          prevRectElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', Location);

          prevRectheaderElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', Location);

          prevtextElement._groups[0].forEach((element: any, i: number) => {
            const pos = i >= 3 ? 1 : i

            d3.select(element)
              .transition()
              .duration(100)
              .ease(d3.easeCubic)
              .attr('x', () => 30 + this.buttonPositions(this.prevTimeline ?? this.selectedTimeline, timelines, pos));

          });

          let toWalk = this.calculateEditIconPosition(this.selectedTimeline, timelines)
          rectElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', toWalk);

          textElement._groups[0].forEach((element: any, i: number) => {
            const pos = i >= 3 ? 1 : i

            d3.select(element)
              .transition()
              .duration(100)
              .ease(d3.easeCubic)
              .attr('x', () => 30 + this.buttonPositions(this.selectedTimeline, timelines, pos));
          });
          this.updateChapterWidth(prevTimelineChapters, Location -RANGE_GAP)
          this.updateChapterWidth(selectedTimelineChapters, toWalk -RANGE_GAP)
        }



      }

    }

    // newTimeline.order = this.selectedTimeline.order
    if (this.timelineOrderToUpdate == 0) {

      this.timelineOrderToUpdate = this.selectedTimeline.order
    }

    if (this.timelineOrderToUpdate != 0) {
      this.timelineOrderToUpdate = newTimeline.order
    }
    this.prevTimeline = newTimeline

  }


  timelineSwapDragEnded(event:MouseEvent ,element: any, timelines: Timeline[]) {
    d3.select(element._groups[0][0]).attr("stroke", "none");
    if (timelines.length <= 1) {
      return
    }

    const diff = Math.abs(this.timelineX - event.x); // Calcula a diferença absoluta

    if (diff < 25) {
      const elementId = `${CSS.escape(this.selectedTimeline.id)}-timeline-group`;
      d3.select(document.getElementById(elementId)).attr("stroke", "none");

      this.selectedTimeline = {
        world_id: '',
        created_at: '',
        description: '',
        id: '',
        name: '',
        order: 0,
        range: 0,

      }
      this.prevTimeline = undefined;

      return; // Retorna se a diferença for menor que 25
    }
    this.selectedTimeline.order = this.timelineOrderToUpdate;

    const reordenadas: Timeline[] = [];

    let currentOrder = 1;
    timelines
      .sort((a, b) => a.order - b.order)
      .forEach((t) => {
        if (t.id === this.selectedTimeline.id) {
          t.order = this.selectedTimeline.order;
        } else {
          if (currentOrder === this.selectedTimeline.order) {
            currentOrder++;
          }
          t.order = currentOrder;
          currentOrder++;
        }
        reordenadas.push(t);
      });



    this.api.updateTimelineList(reordenadas)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (e) =>this.wd.updateTimeline(e),
      error: (e) => this.errorHandler.errHandler(e)
    })
    
    if(!this.ss?.timeline_update_chapter){

      
      const chps = this.chapters.map((c) => {
        const tl = this.getTimelineAndAdjustedRange(c.width)
        c.timeline_id = tl?.timeline?.id || c.timeline_id
        c.range = (tl?.adjustedRange || c.range) - 4
        return c
      })
    this.api.updateChapterList(chps)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next:(chpList) => {
        chpList.forEach((c) => {
          this.wd.updateChapter(c)
        })
      },
      error: (e) => this.errorHandler.errHandler(e)
    })

  }
    

  

    // updateTimelinesApi.forEach(element => {
    //   element.unsubscribe()
    // });




    // Resetar prevTimeline
    this.prevTimeline = undefined;
  }



  // Método para obter o timeline com base na posição x
// Método para obter o timeline e o range ajustado para manter o chapter na mesma posição
getTimelineAndAdjustedRange(xPosition: number): { timeline: Timeline, adjustedRange: number } | undefined {
  const RANGE_MULTIPLIER = RANGE_GAP;
  let accumulatedX = 0;

  for (const timeline of this.timelines.sort((a, b) => a.order - b.order)) {
      // Calcula a largura do timeline atual
      const timelineWidth =  (timeline.range ) * RANGE_MULTIPLIER;

      // Checa se xPosition está dentro do intervalo acumulado para o timeline atual
      if (xPosition >= accumulatedX && xPosition < accumulatedX + timelineWidth) {
          // Calcular o range ajustado necessário para manter o capítulo na mesma posição
          const offsetWithinTimeline = xPosition - accumulatedX;
          const adjustedRange = Math.ceil((offsetWithinTimeline) / RANGE_MULTIPLIER);
          
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





  private createEdge(x0: number, y0: number, x1: number, y1: number, controlPointX: number, controlPointY: number, isHorizontal: boolean, curve: boolean) {

    let path = d3.path();

    path.moveTo(
      isHorizontal ? x0 : x0,
      isHorizontal ? y0 : y0
    );

    path.bezierCurveTo(
      x0,
      controlPointY + ((curve && x0 !== x1 )? 35 : 0),
      controlPointX + ((curve && x0 !== x1 )? 35 : 0),
      controlPointY + ((curve && x0 !== x1 )? 35 : 0),
      x1,
      y1
    );
    return path.toString();
  }

  private initZoom() {
    const minZoom = 0.5;  // Zoom mínimo
    const maxZoom = 3;    // Zoom máximo

    const zoom = d3.zoom()
      .scaleExtent([minZoom, maxZoom])  // Define os limites de zoom
      .on('zoom', this.handleRootZoomEvent.bind(this));

    d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .call(zoom as any);

  }

  private handleRootZoomEvent(e: any) {
    const transform = e.transform;
    if (transform.x > 0) {
      transform.x = 0
    }
    if (transform.y > 60) {
      transform.y = 60
    }


    // Limita o movimento ao longo do eixo X, fixa o eixo Y em 0 e impede o movimento para a direita além de 0
    const restrictedX = Math.min(transform.x, 0); // Limita para não ir além de 0 (esquerda)
    const restrictedY = Math.min(transform.y,60); // Limita para não ir além de 0 (top)




    const restrictedTransform = d3.zoomIdentity
      .translate(restrictedX, restrictedY)  // Permite movimento apenas no eixo X, limitado a 0 no máximo
      .scale(transform.k)  // Aplica o nível de zoom (respeitando o limite)

    var g = d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .select('svg g')
      .attr('transform', restrictedTransform.toString())
      .node()

    this.tiltX = restrictedTransform.x
    this.tiltY = restrictedTransform.y

    if (g && g instanceof SVGGraphicsElement) {
      const bbox = g.getBBox();  // Obtém as dimensões do <g> usando getBBox
      const gWidth = bbox.width * transform.k;  // Largura do elemento <g> com zoom
      const gheight = bbox.height * transform.k;  // Largura do elemento <g> com zoom

      if (transform.x < gWidth * -1) {
        transform.x = (gWidth * -1) + (gWidth / 3)
      }
      if (transform.y < gheight * -1) {
        transform.y = (gheight * -1) + (gheight / 3)
      }
    }

    this.zoom = transform.k

  }





  private cleanItemsOnSvg() {
    this.graphHeigh = 0
    d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .selectAll("g > *").remove();
  }

  private handleGraphEvents(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    data: { "chapters": Chapter[], "storyLines": StoryLine[], "connections": Connection[], "timelines": Timeline[], "events": Event[] }) {

      
    const { timelines, storyLines, connections, chapters, events } = data
    this.renderTimeLines(svg, timelines, storyLines.length);
    this.renderStoryLines(svg, storyLines);
    this.renderConnections(svg, chapters, connections);
    this.renderEvents(svg, events, chapters, storyLines.length);
    this.renderUniqueChapters(svg, chapters, storyLines, timelines, connections);
    this.renderGroupChapters(svg, storyLines, timelines, connections);

    this.initZoom();
  }

  createStoryline(){
    this.dialog.openCreateStoryline('150ms', '150ms')
  }
  createTimeline(){
    this.dialog.openCreateTimelineDialog('150ms', '150ms')
  }
  openSubwaySettings(){
    this.dialog.openSubwaySettingsDialog('150ms', '150ms')
  }
  openCreateGroup(){
    this.dialog.openCreateGroupConnectionDialog('150ms', '150ms')
  }
  createEvents(){
    this.dialog.opencreateEventsDialog( this.wd.worldId , '150ms', '150ms')
  }
  
}
