import { ChangeDetectorRef, Component, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import * as d3 from 'd3';
import { SubwayService } from '../subway.service';
import { EDGE_BORDER_COLOR_DEFAULT, EDGE_BORDER_WIDTH_DEFAULT, LABEL_FONT_FAMILY_DEFAULT, LABEL_FONT_SIZE_DEFAULT, LABEL_FONT_SIZE_GROUP, LOADING_DELAY, NODE_BORDER_WIDTH_DEFAULT, NODE_RADIUS, PATH_ROOT_MARGIN_BOTTOM, PATH_ROOT_MARGIN_LEFT, MARGIN, PATH_ROOT_MARGIN_RIGHT, PATH_ROOT_MARGIN_TOP, TopoAddregatedNode, TopoEdge, TopoLegend, TopoNode, TopologyControlType, TopologyGeometryType, TopologyNodeType, groupColorMap } from '../../../models/graphsTypes';
import { BehaviorSubject, Subject, delay, filter, switchMap, takeUntil, tap, combineLatest, map, concatMap, from, forkJoin } from 'rxjs';
import { LoadingService } from '../../loading.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Chapter, Connection, paper, StoryLine, Timeline } from '../../../models/paperTrailTypes';
import { ApiService } from '../../api.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { DialogService } from '../../../dialog/dialog.service';
import { NumberInput } from '@angular/cdk/coercion';
import { Router } from '@angular/router';

const D3_ROOT_ELEMENT_ID = "subway";


@Component({
  selector: 'app-subway',
  templateUrl: './subway.component.html',
  styleUrls: ['./subway.component.scss']
})
export class SubwayComponent {

  width: number;
  height: number;
  zoom: number = 1;
  tiltX:number = 1
  tiltY:number = 1
  timeLineTxtHeight: number = 20

  selectedChapter: Chapter | undefined;
  selectedConnection: Connection | undefined;
  storylineSelected: StoryLine
  prevStoryline: StoryLine
  storylinesMoved: StoryLine[] = []
  lastStorylineChanged: StoryLine
  selectedTimeline: Timeline;
  nextStorylineSelected: number;
  reset:boolean
  currentSelectTimelineLeftGap: number;

  isCreateConnectionSet: boolean;
  timelineEdit: boolean = false
  gridWidth = 100
  gridHeight = 50
  totalGridHeight = 0

  buttonsSpacing :any={

   0: -25,
   1: 0,
   2:25

  }
  @ViewChild('chapterMenuTrigger') chapterMenuTrigger!: MatMenuTrigger;
  @ViewChild('storylineMenuTrigger') storylineMenuTrigger!: MatMenuTrigger;
  @ViewChild("connectionMenuTrigger") trggerConnectionMenu!: MatMenuTrigger;

  bodyElement: HTMLElement = document.body;
  @ViewChild(`${D3_ROOT_ELEMENT_ID}`, { read: ElementRef }) root: ElementRef | undefined;

  storylines$ = this.wd.storylines$;
  timelines$ = this.wd.timelines$;
  chapters$ = this.wd.chapters$;
  papers$ = this.wd.papers$;
  connections$ = this.wd.connections$;

  graphHeigh: number = 0

  chapters: Chapter[] = [];
  connections: Connection[] = [];
  papers: paper[]
  svgHeight:number = 1
  timelines: Timeline[] = [];
  timelineOrderToUpdate: number
  storylineOrderToUpdate: number
  prevTimeline: Timeline | undefined

  constructor(
    private dialog: DialogService,
    private wd: WorldDataService,
    private api: ApiService,
    private renderer: Renderer2,
    private router: Router,

  ) {
    this.cleanItemsOnSvg();
  }

  ngAfterViewInit(): void {
    this.width = this.root?.nativeElement.offsetWidth;
    this.height = this.root?.nativeElement.offsetHeight;

    let svg = this.initSvg();
    this.wd.timelines$.subscribe((t) => {
      this.timelines = t
    })
    combineLatest({
      "timelines": this.timelines$, "storyLines": this.storylines$,
      "chapters": this.chapters$, "papers": this.papers$, "connections": this.connections$
    }).subscribe((data) => {
      data.chapters = data.chapters.filter((c) => c.timeline_id != null && c.storyline_id != null)

      let { chapters, papers, storyLines, timelines, connections } = data
      this.papers = papers
      this.connections = connections
      data.timelines = timelines.sort((a, b) => a.order - b.order);
      data.chapters = chapters.map((c) => {
        c.width = 0
        const str = storyLines.filter((s) => s.id == c.storyline_id)[0]
        const tl = timelines.filter((t) => t.id == c.timeline_id)[0]
        const pp = papers.filter((p) => p.id == c.paper_id)[0]

        this.svgHeight = storyLines.length
        if (!c.selected) {
          c.color = this.numberToRGB(pp?.id)
        }
        c.height = (str?.order * this.gridHeight) || 0


        const tlRanges = data.timelines.reduce((a, b) => {
          if (b.order < tl?.order) {
            return a + b.range
          } else {
            return a
          }
        }, 0)
        const width = (tlRanges * 20) + ((c.range - 1) * 20)
        c.width = width + 100
        return c
      })
      this.chapters = data.chapters

      this.cleanItemsOnSvg();
      this.handleGraphEvents(svg, data);
    })


    // Subscribe events for graph

  }


  ngOnDestroy() {
    console.log('remove all subscriptions')
  }

  private initSvg(): d3.Selection<SVGGElement, unknown, HTMLElement, any> {
    const width = this.width < 1500? this.width : 1500
    return d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .append("svg")
      .attr("width", width)
      .attr("height", 300)
      .append("g") // Retorna o grupo <g> que vai conter outros elementos

  }

  getFillColor(chp: Chapter): string {
    const pps = this.papers
    const papper= pps.filter((p) => p.id == chp.paper_id)[0]
    if (chp?.focus) {
      return d3.color(chp.color)?.brighter(0.5)?.toString() || chp.color; // Aumenta a claridade da cor
    }else if(papper?.focus){
      const result = this.chapters.filter((chp) => chp.paper_id == papper.id)

      result.forEach((c) => {
        const element = document.getElementById(`${c.id}-chapter-circle`);
        d3.select(element)
        .transition()
        .duration(200)
        .attr("fill", d3.color(c.color)?.brighter(1)?.toString() || c.color)
        .attr("r", this.getDiameter(chp))

      })
    }
    return chp.color;
  }

  onMenuClosed(){
    if(this.selectedChapter){
      this.selectedChapter.focus = false
      this.wd.updateChapter(this.selectedChapter)
      this.selectedChapter = undefined
    }

  }
  getDiameter(chp: Chapter): number {
    if (chp?.focus) {
      return 10
    }else{
      return 8 
    }
  }

  focusChapter ( c: Chapter, focus:boolean)  {
    if(this.selectedChapter){
      return
    }
      c.focus = focus
      this.wd.updateChapter(c)  
      return 
  }
  private renderChapters(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    chapters: Chapter[],
    s: StoryLine[],
    t: Timeline[],
    c: Connection[]
  ) {
    // Cria um grupo (g) para cada capítulo
    let eleEnter = svg.selectAll("g.chapter-group")
      .data(chapters)
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
          .on("drag", (event, d) => this.dragged(svg, event, d, c, chapters))
          .on("end", (event, d) => this.dragEnded(s, t, event, d))
      )
      .on('contextmenu', (event: MouseEvent, c: Chapter) => {
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

      })
      .on("mouseover", (_: MouseEvent, c: Chapter) => {
        if( this.selectedChapter ){
          return
        }
        if(!c?.focus){

          c.focus = true;
          this.wd.updateChapter(c); // Update the state
          
          const element = document.getElementById(`${c.id}-chapter-circle`);
          d3.select(element)
          .transition()
          .duration(200)
          .attr("fill", d3.color(c.color)?.brighter(1)?.toString() || c.color) // Lighten the color
          .attr("r", this.getDiameter(c))

        }
      })
      .on("mouseout", (_: MouseEvent, c: Chapter) => {
        if( this.selectedChapter ){
          return
        }
        if(c?.focus){
        
        c.focus = false;
        this.wd.updateChapter(c); // Update the state
    
        const element = document.getElementById(`${c.id}-chapter-circle`);

        d3.select(element)
          .transition()
          .duration(200)
          .attr("fill", this.getFillColor(c)) // Restore the original color based on state
          .attr("r", this.getDiameter(c))
        }
      });
    // Labels (Texto)
    eleEnter
      .append("text")
      .raise()

      .attr("dx", (node: Chapter) => node.width)
      .attr("dy", (node: Chapter) => node.height + 15)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_GROUP)
      .attr("text-anchor", "middle")
      .attr("fill", "black")  // Cor inicial do texto
      .attr("id", (c: Chapter) => `${c.id}-chapter-group-txt`)  // Adiciona um ID único para cada grupo de capítulos
      .text((node: Chapter) => node.name);
  }


  createConnection() {
    if (this.selectedChapter) {

      this.selectedChapter.selected = true
      this.selectedChapter.color = "blue"
      this.isCreateConnectionSet = true

      this.wd.updateChapter(this.selectedChapter)
      alert("chose a chapter to connect.")
    }

  }

  removeStoryline(){

  }
  removeConnection() {
    if (this.selectedConnection != undefined) {
      const target = this.chapters.filter((chp) => chp.id == this.selectedConnection?.targetChapterID)[0]
      target.color = "red"
      target.selected = true
      const source = this.chapters.filter((chp) => chp.id == this.selectedConnection?.sourceChapterID)[0]
      source.color = "red"
      source.selected = true
      this.wd.updateChapter(target)
      this.wd.updateChapter(source)
      alert("remove connection")
      this.api.removeConnection(this.selectedConnection).subscribe(() => {
        this.wd.removeConnection(this.selectedConnection?.id || "")
        this.selectedConnection = undefined
        setTimeout(() => {

          source.selected = false
          target.selected = false
          this.wd.updateChapter(target)
          this.wd.updateChapter(source)
        }, 1000);
      })
    }

  }

  private dragStarted(event: any, d: Chapter) {
    if (this.isCreateConnectionSet && this.selectedChapter) {
      if (this.selectedChapter.id == d.id) {
        alert("you cannot create connection with the same chapter")
        return
      }
      const body: Connection =
      {
        "id": "",
        "targetChapterID": d.id,
        "sourceChapterID": this.selectedChapter.id,
        "world_id": this.wd.worldId
      }

      this.api.createConnection(body).subscribe((cnn) => {
        this.isCreateConnectionSet = false
        this.chapters = this.chapters.map((c) => {
          if (this.selectedChapter != undefined && c.id == this.selectedChapter.id) {
            c.color = c.color
            c.selected = false
          }
          return c
        })
        this.wd.setChapters(this.chapters)
        this.wd.addConnection(cnn)
      })

      return
    }
    this.selectedChapter = d

    const elementCircleId = `#${CSS.escape(d.id)}-chapter-group circle`;
    const elementtextId = `#${CSS.escape(d.id)}-chapter-group text`;
    d3.select(elementtextId).raise().attr("stroke", "black");
    d3.select(elementCircleId).raise().attr("stroke", "black");
  }

  private dragged(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, event: any, d: Chapter, connections: Connection[], chapters: Chapter[]) {
    const elementCircleId = `#${CSS.escape(d.id)}-chapter-group circle`;
    const elementtextId = `#${CSS.escape(d.id)}-chapter-group text`;

    const el = d3.select(document.getElementById(D3_ROOT_ELEMENT_ID))

    const boundingBox = el.node()?.getBoundingClientRect(); // Pega o bounding box do elemento


    const relativeX = ((event.sourceEvent.clientX - (boundingBox?.left || 0)) / this.zoom - this.tiltX);
    const relativeY = ((event.sourceEvent.clientY - (boundingBox?.top || 0)) / this.zoom) - this.tiltY;

    
    if (relativeX < 100 || relativeY < 50 || relativeY > this.graphHeigh) {
      return
    }


    d.width = relativeX
    d.height = relativeY
    d3.select(elementCircleId)
      .attr("cx", relativeX)
      .attr("cy", relativeY);

    d3.select(elementtextId)
      .attr("dx", d.width)
      .attr("dy", d.height + 15)
      .attr("cx", d.width )
      .attr("cy", d.height)
      .attr("stroke", d.color)



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
      const className = `${cnn.id}-connections-group`;
      const element = document.getElementById(className);

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
    const elementCircleId = `#${CSS.escape(d.id)}-chapter-group circle`;
    const elementtextId = `#${CSS.escape(d.id)}-chapter-group text`;
    // erro ao criar connection, programa esta jogando o chapter point para o ultimo storyline.
    d3.select(elementCircleId).attr("stroke", d.color);
    d3.select(elementtextId).attr("stroke", 'black');

    const el = d3.select(document.getElementById(D3_ROOT_ELEMENT_ID))

    const boundingBox = el.node()?.getBoundingClientRect(); // Pega o bounding box do elemento

    const relativeX = ((event.sourceEvent.clientX - (boundingBox?.left || 0)) / this.zoom - this.tiltX);
    const relativeY = ((event.sourceEvent.clientY - (boundingBox?.top || 0)) / this.zoom) - this.tiltY;



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
    this.api.updateChapter(d.id, body).subscribe(

      {
        next: (data) => this.addNewChapter(data),
        error: (err) => console.error(err)
      }
    )
    this.selectedChapter = undefined

  }

  addNewChapter(newChapter: Chapter) {
    this.wd.updateChapter(newChapter)
  }

  // Funções para encontrar o timeline e storyline
  private findTimelineForChapter(t: Timeline[], x: number): { timeline: Timeline, range: number } {

    let range = Math.round((x - 100) / 20) + 1

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
  private  findStorylineForChapter(s: StoryLine[], y: number): StoryLine {
    let range = Math.round((y - 50) / this.gridHeight)
    if (range >= s.length - 1) {
      range = s.length - 1
    }
    return s[range];
  }



  openChapter(){
    const id = this.selectedChapter?.id || ''
    const url = `/world/${this.wd.worldId}/chapter/${id}`;
    window.open(url, '_blank');
   }

   removeFromSubway(){

     if(this.selectedChapter != undefined){
      this.selectedChapter.timeline_id = ""
      this.selectedChapter.storyline_id = ""
      this.selectedChapter.EventID = ""

      const elementId = `${CSS.escape(this.selectedChapter.id)}-chapter-circle`;
      const elementTxtId = `${CSS.escape(this.selectedChapter.id)}-chapter-group-txt`;

      const chp = d3.select(elementId).remove()
      d3.select(elementTxtId).remove()

      this.api.updateChapter(this.selectedChapter.id, this.selectedChapter).subscribe((c) => {
        this.wd.updateChapter(c)
        this.selectedChapter = undefined
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
  
        let isHorizontal = Math.abs(y0 - y1) < HORIZONTAL_THRESHOLD;
        let isVertical = Math.abs(x0 - x1) < HORIZONTAL_THRESHOLD;
  
        let controlPointX = (isHorizontal ? x1 : x1 + CONSTANT_CONTROL_POINT * ((x1 - x0) / (y1 - y0)) + MARGIN);
        let controlPointY = isVertical ? y1 : y1 - CONSTANT_CONTROL_POINT * ((y1 - y0) / (x1 - x0));
  
        let pathData = "";
  
        if (isVertical) {
          pathData = `M ${x0} ${y0} Q ${x0} ${y0} ${x1} ${y1}`;
        } else {
          pathData = this.createEdge(x0, y0, x1, y1, controlPointX, controlPointY, isHorizontal);
        }
        return pathData;
      })
      .attr("fill", "none")
      .attr("stroke", EDGE_BORDER_COLOR_DEFAULT)
      .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT)
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
          target.color = "red";
          this.wd.updateChapter(target);
        }
        if (source) {
          source.color = "red";
          this.wd.updateChapter(source);
        }
      })
      .on("mouseover", function () {
        d3.select(this)
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT + 2);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT);
      });
  
    // Garante que as conexões estejam no topo
    connectionPaths.raise();
  }


  callPreviewDialog(){
    if(this.selectedChapter){
      this.dialog.openPreview(this.selectedChapter,`150ms`,`150ms`)
    }
  }
  
  renderStoryLines(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    strs: StoryLine[]
  ) {
    const widthTimelines = (this.timelines.reduce((a, b) => a + b.range, 5) * 20) + (this.timelines.length * 20)
    
    
    const widthChapter =    this.chapters
    .sort((a, b) =>  b.width - a.width)[0]?.width
    const width = widthTimelines > widthChapter ? widthTimelines : widthChapter
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
        return this.createEdge(MARGIN + 50, strHeight, width, strHeight, width, strHeight, true);
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
          .on("start", (event, str) =>  this.storyLineSwapDragStart(str, strs))
          .on("drag", (event, str) => this.storyLineSwapDragged(event, strs))
          .on("end", (event, str) => this.storyLineSwapDragEnded(svg, strs))
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

  storyLineSwapDragStart(str: StoryLine, strs: StoryLine[]){
    if(strs.length <= 1){
      return
    }
    this.storylineOrderToUpdate = str.order

    this.storylineSelected = str
    const elementId = `${CSS.escape(str.id)}-storyline-group`;
    d3.select(document.getElementById(elementId)).select("text").attr("font-size", "20");

  }  
  
  openStrDetails(){
    console.log(this.storylineSelected)
    if(this.storylineSelected){
      this.dialog.openChapterDescription(this.storylineSelected, '150ms','150ms')
    }
  }
  openStrEdit(){
    console.log(this.storylineSelected)
    if(this.storylineSelected){
      this.dialog.openStorylineEditDialog(this.storylineSelected, '150ms','150ms')
    }
  }
  storyLineSwapDragged(event: MouseEvent, strs: StoryLine[]) {
    if(strs.length <= 1){
      return
    }

    
    const y =( event.y / this.zoom) - this.tiltY
    this.reset = false
        // Cálculo da posição do mouse em relação aos StoryLines
        let mousePos = (Math.round((y - 0.2) / 50) - 1) < 0 ? 0 : Math.round((y - 0.2) / 50) - 1;
        mousePos = mousePos > strs.length - 1 ? strs.length - 1 : mousePos;
        this.nextStorylineSelected = mousePos <= 0? 1 : mousePos +1
        this.nextStorylineSelected = this.nextStorylineSelected == strs.length ? strs.length - 2 : this.nextStorylineSelected
        let newStrl :StoryLine= strs[mousePos];
        if(!newStrl.order){
          return
        }
        console.log(newStrl.name)
        const selectedElementText = d3.select(document.getElementById(`${CSS.escape(this.storylineSelected.id)}-storyline-group`)).select("text");
        const isSame = this.storylineSelected.id == newStrl.id


        const selectedNewElementiD = `${CSS.escape(newStrl.id)}-storyline-group`;
        const newstrlElement: any = d3.select(document.getElementById(selectedNewElementiD)).select("text");
        let toWalk = newStrl.order - this.prevStoryline?.order
        toWalk = toWalk <= 0 ? 1 : toWalk
        if (!isSame && this.storylineSelected.order > newStrl.order) {

          selectedElementText
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('y', () => (( newStrl.order ) * this.gridHeight) + 2)
          
          if (this.prevStoryline != undefined && this.prevStoryline.order < newStrl.order) {
            const prevNewElementiD = `${CSS.escape(this.prevStoryline?.id)}-storyline-group`;
            const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD)).select("text");
            prevTimelineElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', ((this.prevStoryline.order ) * this.gridHeight)) 
            
          }else {
            newstrlElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', () => ((this.prevStoryline.order +1 ) * this.gridHeight) - 2)
          }
        } else if (!isSame &&this.storylineSelected.order < newStrl.order) {
          selectedElementText
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('y', (newStrl.order * this.gridHeight) + 2)
        
          if (this.prevStoryline != undefined && this.prevStoryline?.order > newStrl.order) {

            const prevNewElementiD = `${CSS.escape(this.prevStoryline?.id)}-storyline-group`;
            const prevStorylineElement: any = d3.select(document.getElementById(prevNewElementiD)).select("text");
           
            prevStorylineElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', ((this.prevStoryline.order ) * this.gridHeight)) 

          }else{
            newstrlElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', () => ((this.prevStoryline.order - 1) * this.gridHeight) - 2)


          }
        }
       else if (isSame && this.storylineSelected.order == newStrl.order) {
         if (this.prevStoryline != undefined && this.prevStoryline?.order > newStrl.order) {
          const prevNewElementiD = `${CSS.escape(this.prevStoryline?.id)}-storyline-group`;
          const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD)).select("text");
          prevTimelineElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          
        }else {
          if (this.prevStoryline != undefined) {
          if(newStrl.id == this.storylineSelected.id){
            newStrl = strs[this.nextStorylineSelected]
          }
          
            const prevNewElementiD = `${CSS.escape(newStrl?.id)}-storyline-group`;
            const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD)).select("text");
           
            selectedElementText
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', ((this.storylineSelected.order)* this.gridHeight) )


            prevTimelineElement
            .transition()
            .duration(50)
            .ease(d3.easeCubic)
            .attr('y', ((newStrl.order)* this.gridHeight))

            this.reset = true
          return

          }
        }
       }
       if (this.storylineOrderToUpdate == 0) {
        this.storylineOrderToUpdate = this.storylineSelected.order || this.storylineOrderToUpdate
    }
  
    if (this.storylineOrderToUpdate != 0) {
        this.storylineOrderToUpdate = newStrl.order
    }
      this.prevStoryline = newStrl
  
        // Verificar se o Story

  }
  


  storyLineSwapDragEnded(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, strs: StoryLine[]){
    const elementId = `${CSS.escape(this.storylineSelected.id)}-storyline-group`;
    d3.select(document.getElementById(elementId)).select("text").attr("font-size", "12");
    console.log(this.storylineOrderToUpdate)
    if(!this.storylineSelected){
      return
    }
    console.log(this.storylineSelected)
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


        if(this.reset){

          this.api.updateStoryLineList(strs).subscribe((data) => {
            data.forEach(str => {
              this.wd.updateStoryline(str)
            });

          })
        }else {
          this.api.updateStoryLineList(reordenadas).subscribe((data) => {
            data.forEach(str => {
              this.wd.updateStoryline(str)
            });
          })

        }
    this.prevTimeline = undefined;

  }
  calculateXPosition(tl: Timeline, data: Timeline[]) {
    let range = 100;
    const currentOrder = data.filter((t: Timeline) => t.order <= tl.order);
    const anteriorRange = currentOrder.reduce((a: any, b: any) => a + b.range, 0);
    return ((anteriorRange - tl.range) * 20) + range + ((tl.range / 2) * 20);
  };


  buttonPositions (tl: Timeline, timelines: Timeline[], index: number) {
    const width = (tl.range * 20) ;
    return this.calculateEditIconPosition(tl, timelines) + (tl.range * 10) - 10 + this.buttonsSpacing[index] ; // Calcula a posição proporcional
  };

  renderTimeLines(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    data: Timeline[],
    height: number
  ) {
    const gridHeight = (height * this.gridHeight) + 20;
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
      .attr("x", (tl: Timeline) => this.calculateEditIconPosition(tl, data))
      .attr("y", 50)
      .attr("width", (tl: Timeline) => (tl.range * 20) - 5)
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
      .attr("width", (tl: Timeline) => (tl.range * 20) - 5)
      .attr("height", 45) // Altura do header
      .style("fill", "rgba(100, 100, 0, 0.25)")  // Define a cor do header
      .style("stroke", "#000")  // Adiciona uma borda se necessário
      .style("stroke-width", "1px");
  
  
    // Botão de "grab" (movimentação)
    headerTimeline.append("text")
      .attr("class", `timeline-drag`)
      .attr("x", (tl: Timeline) => this.buttonPositions(tl,data,  0)) // Posição proporcional
      .attr("y", this.timeLineTxtHeight)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", (LABEL_FONT_SIZE_DEFAULT))
      .attr("cursor", "pointer")
      .text("↹")
      .call(
        d3.drag<SVGTextElement, Timeline>()
          .on("start", (event, t) => this.timelineSwapDragStart(t, data))
          .on("drag", (event, t) => this.timelineSwapDragged(event, data))
          .on("end", (event, t) => this.timelineSwapDragEnded(svg, data))
      );
  
    // Botão de deletar no header
    headerTimeline.append("text")
      .attr("class", "timeline-delete")
      .attr("x", (tl: Timeline) => this.buttonPositions(tl,data, 1)) // Posição proporcional
      .attr("y", this.timeLineTxtHeight)
      .attr("font-family", "Arial")
      .attr("font-size", ("20px"))
      .attr("cursor", "pointer")
      .text("🗑")
      .on("click", (e, tl) => this.dialog.openDeleteTimelineDialog({ timeline: tl, timelines: data, chapters: this.chapters }, "150ms", "150ms"));
  
    // Botão de atualizar no header
    headerTimeline.append("text")
      .attr("class", "timeline-update")
      .attr("x", (tl: Timeline) => this.buttonPositions(tl,data, 2)) // Posição proporcional
      .attr("y", this.timeLineTxtHeight)
      .attr("font-family", "Arial")
      .attr("font-size", ("20px"))
      .attr("cursor", "pointer")
      .text("🖉")
      .on("click", (e, tl) => this.dialog.openUpdateTimelineDialog(tl, "150ms", "150ms"));
  
    // Nome da timeline no header, centralizado abaixo dos botões
    headerTimeline.append("text")
      .attr("class", "timeline-txt")
      .attr("x", (tl: Timeline) => this.calculateXPosition(tl, data)) // Centralizado
      .attr("y", this.timeLineTxtHeight + 20) // Abaixo dos botões
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("text-anchor", "middle")
      .text((tl: Timeline) => tl.name);
  }
  
  
  

getElementCenter(element: any){
  return (element.node().getBoundingClientRect().width / this.zoom) / 2
}

  private calculateEditIconPosition(tl: Timeline, data: Timeline[]): number {
    let range = 100;
    const currentOrder = data.filter((t: Timeline) => t.order <= tl.order);
    const anteriorRange = currentOrder.reduce((a: any, b: any) => a + b.range, 0);
    return ((anteriorRange - tl.range) * 20) + range;
  }



  timelineSwapDragStart(t: Timeline, timelines: Timeline[]) {
    if(timelines.length <= 1){
      return
    }
    this.selectedTimeline = t
    const elementId = `${CSS.escape(this.selectedTimeline.id)}-timeline-group`;
    d3.select(document.getElementById(elementId)).attr("stroke", "black");

  }






  timelineSwapDragged(event: any, timelines: Timeline[]) {
    if(timelines.length <= 1){
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

    if (!isSame && this.selectedTimeline.order > newTimeline.order) {
      const diff = ((this.selectedTimeline.range - newTimeline.range) / 2) * 20

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


      textElement._groups[0].forEach((element: any, i:number) => {
        const pos = i >= 3 ? 1 : i
        d3.select(element)
        .transition()
        .duration(100)
        .ease(d3.easeCubic)
        .attr("x", () => this.buttonPositions(newTimeline, timelines, pos) + diff) 
      });


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
          .attr('x', otherElementLocation - (this.prevTimeline?.range * 20));
          prevRectheaderElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation - (this.prevTimeline?.range * 20));

        prevtextElement._groups[0].forEach((element: any, i:number) => {
          const pos = i >= 3 ? 1 : i
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => this.buttonPositions(timelines[newTimeline.order -2], timelines, pos)) 
        });


      } else {
        const elPos = otherElementLocation + (this.selectedTimeline.range * 20)
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


          let diff = ((this.selectedTimeline.range - newTimeline.range) / 2) * 20

          newTextElement._groups[0].forEach((element: any, i:number) => {
          const pos = i >= 3 ? 1 : i
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => (elPos + (newTimeline.range * 10) - 7 + this.buttonsSpacing[pos])) 

        });

      }

    } else if (!isSame &&this.selectedTimeline.order < newTimeline.order) {

      const elPosition = currentElementLocation + (newTimeline.range - this.selectedTimeline.range) * 20
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

        textElement._groups[0].forEach((element: any, i:number) => {
          const pos = i >= 3 ? 1 : i
          
          const tl = timelines[newTimeline.order]? timelines[newTimeline.order] : timelines[newTimeline.order-1]

          d3.select(element)
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("x", () => (elPosition + (this.selectedTimeline.range * 10) - 7 + this.buttonsSpacing[pos])) 

          // .attr('x', (currentElementLocation + (newTimeline.range - this.selectedTimeline.range) * 20+ this.getElementCenter(rectElement)));
      });


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

        prevtextElement._groups[0].forEach((element: any, i:number) => {
          const pos = i >= 3 ? 1 : i
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => (Location + (range * 10) - 7 + this.buttonsSpacing[pos])) 

            // .attr('x', Location + this.getElementCenter(prevRectElement));
        });


      } else {
    const elPosition = otherElementLocation - (this.selectedTimeline.range * 20)


        newRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', elPosition );

        newRectheaderElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', elPosition );

        newTextElement._groups[0].forEach((element: any, i: any) => {
          
          const pos = i >= 3 ? 1 : i

          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => (elPosition + (newTimeline.range * 10) - 7 + this.buttonsSpacing[pos])) 

        });
      }


    } else if (isSame && this.selectedTimeline.order == newTimeline.order) {

      if (this.prevTimeline != undefined && this.prevTimeline?.order > newTimeline.order) {

        const Location = this.calculateEditIconPosition(this.prevTimeline, timelines)

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


        prevtextElement._groups[0].forEach((element: any, i:number) => {
          const pos = i >= 3 ? 1 : i

          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => this.buttonPositions(this.prevTimeline??this.selectedTimeline, timelines, pos)) 

            // .attr('x', Location + this.getElementCenter(prevRectElement) );
        });




      } else {

        if (this.prevTimeline != undefined) {
          const Location = this.calculateEditIconPosition(this.prevTimeline, timelines)

          const prevNewElementiD = `${CSS.escape(this.prevTimeline?.id)}-timeline-group`;
          const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD));
          const prevRectElement = prevTimelineElement.select(".timeline-body");
          const prevRectheaderElement = prevTimelineElement.select(".timeline-header");
          const prevtextElement = prevTimelineElement.selectAll("text");
          const range = this.prevTimeline?.range

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

          prevtextElement._groups[0].forEach((element: any, i:number) => {
            const pos = i >= 3 ? 1 : i

            d3.select(element)
              .transition()
              .duration(100)
              .ease(d3.easeCubic)
              .attr('x', () => this.buttonPositions(this.prevTimeline?? this.selectedTimeline, timelines, pos));

          });

          let toWalk = this.calculateEditIconPosition(this.selectedTimeline, timelines)
          rectElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', toWalk);

          textElement._groups[0].forEach((element: any, i:number) => {
            const pos = i >= 3 ? 1 : i

            d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
              .attr('x', () => this.buttonPositions(this.selectedTimeline, timelines, pos));
          });
        }


      }

    }

    // newTimeline.order = this.selectedTimeline.order
    if (this.timelineOrderToUpdate == 0) {
      
      console.log(this.selectedTimeline)
      this.timelineOrderToUpdate = this.selectedTimeline.order
    }
    
    if (this.timelineOrderToUpdate != 0) {
    console.log(newTimeline)
      this.timelineOrderToUpdate = newTimeline.order
  }
    this.prevTimeline = newTimeline

  }


  timelineSwapDragEnded(element: any, timelines: Timeline[]) {
    d3.select(element._groups[0][0]).attr("stroke", "none");
    if(timelines.length <= 1){
      return
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


    reordenadas.forEach(timeline => {
        this.wd.updateTimeline(timeline)
      });
      const updateTimelinesApi = reordenadas.map((t) => {
        return this.api.updateTimeline(t).subscribe((e) => {
          this.wd.updateTimeline(e)
        })
    })

    // updateTimelinesApi.forEach(element => {
    //   element.unsubscribe()
    // });




    // Resetar prevTimeline
    this.prevTimeline = undefined;
}





  private createEdge(x0: number, y0: number, x1: number, y1: number, controlPointX: number, controlPointY: number, isHorizontal: boolean) {

    let path = d3.path();

    path.moveTo(
      isHorizontal ? x0 : x0,
      isHorizontal ? y0 : y0
    );

    path.bezierCurveTo(
      x0,
      controlPointY,
      controlPointX,
      controlPointY,
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
    if (transform.y > 0) {
      transform.y = 0
    }


    // Limita o movimento ao longo do eixo X, fixa o eixo Y em 0 e impede o movimento para a direita além de 0
    const restrictedX = Math.min(transform.x, 0); // Limita para não ir além de 0 (esquerda)
    const restrictedY = Math.min(transform.y, 0); // Limita para não ir além de 0 (top)




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
  
  

  private cleanItemsOnSvg() {
    this.graphHeigh = 0
    d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .selectAll("g > *").remove();
  }

  private handleGraphEvents(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    data: { "chapters": Chapter[], "storyLines": StoryLine[], "connections": Connection[], "timelines": Timeline[] }) {


    const { timelines, storyLines, connections, chapters } = data
    this.renderTimeLines(svg, timelines, storyLines.length);
    this.renderStoryLines(svg, storyLines);
    this.renderConnections(svg, chapters, connections);
    this.renderChapters(svg, chapters, storyLines, timelines, connections);




    this.initZoom();
  }


}
