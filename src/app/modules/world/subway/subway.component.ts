import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { SubwayService } from '../subway.service';
import { EDGE_BORDER_COLOR_DEFAULT, EDGE_BORDER_WIDTH_DEFAULT, LABEL_FONT_FAMILY_DEFAULT, LABEL_FONT_SIZE_DEFAULT, LABEL_FONT_SIZE_GROUP, LOADING_DELAY, NODE_BORDER_WIDTH_DEFAULT, NODE_RADIUS, PATH_ROOT_MARGIN_BOTTOM, PATH_ROOT_MARGIN_LEFT, MARGIN, PATH_ROOT_MARGIN_RIGHT, PATH_ROOT_MARGIN_TOP, TopoAddregatedNode, TopoEdge, TopoLegend, TopoNode, TopologyControlType, TopologyGeometryType, TopologyNodeType, groupColorMap } from '../../../models/graphsTypes';
import { BehaviorSubject, Subject, delay, filter, switchMap, takeUntil, tap, combineLatest, map, concatMap, from, forkJoin } from 'rxjs';
import { LoadingService } from '../../loading.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Chapter, Connection, StoryLine, Timeline } from '../../../models/paperTrailTypes';
import { ApiService } from '../../api.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { DialogService } from '../../../dialog/dialog.service';
import { NumberInput } from '@angular/cdk/coercion';

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

  @ViewChild('chapterMenuTrigger') chapterMenuTrigger!: MatMenuTrigger;
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
  svgHeight:number = 1
  timelines: Timeline[] = [];
  timelineOrderToUpdate: number
  storylineOrderToUpdate: number
  prevTimeline: Timeline | undefined

  constructor(
    private dialog: DialogService,
    private wd: WorldDataService,
    private api: ApiService
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
      this.connections = connections
      data.timelines = timelines.sort((a, b) => a.order - b.order);

      data.chapters = chapters.map((c) => {
        c.width = 0
        const str = storyLines.filter((s) => s.id == c.storyline_id)[0]
        const tl = timelines.filter((t) => t.id == c.timeline_id)[0]
        const pp = papers.filter((p) => p.id == c.paper_id)[0]

        this.svgHeight = storyLines.length
        if (!c.selected) {
          c.color = this.numberToRGB(pp.order)
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
    const width = this.width < 1000? this.width : 1000
    return d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .append("svg")
      .attr("width", width)
      .attr("height", 300)
      .append("g") // Retorna o grupo <g> que vai conter outros elementos

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
      .raise()
      .attr("cx", (chp: Chapter) => chp.width)
      .attr("cy", (chp: Chapter) => chp.height)
      .attr("r", () => NODE_RADIUS)
      .attr("fill", (chp: Chapter) => chp.color)
      .attr("stroke", (chp: Chapter) => chp.color)
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
      .attr("cursor", "pointer")
      .call(
        d3.drag<SVGCircleElement, Chapter>()
          .on("start", (event, d) => this.dragStarted(event, d))
          .on("drag", (event, d) => this.dragged(svg, event, d, c, chapters))
          .on("end", (event, d) => this.dragEnded(s, t, event, d))
      )
      .on('contextmenu', (ev: MouseEvent, c: Chapter) => {
        ev.preventDefault();


        // this.trigger.menuData ={ xPosition: ev.clientX, yPosition: ev.clientY }

        this.chapterMenuTrigger.openMenu();
        const menu = document.querySelector("#" + this.chapterMenuTrigger.menu?.panelId)
        const menuElement = document.querySelector("#" + this.chapterMenuTrigger.menu?.panelId) as HTMLElement;

        if (menuElement) {
          // Defina o estilo de posicionamento
          menuElement.style.position = 'absolute';
          menuElement.style.left = `${ev.x + 5}px`;
          menuElement.style.top = `${ev.y + 5}px`;
        }
        this.selectedChapter = c

      })

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

    const elementCircleId = `#${CSS.escape(d.id)}-chapter-group circle`;
    const elementtextId = `#${CSS.escape(d.id)}-chapter-group text`;
    d3.select(elementtextId).raise().attr("stroke", "black");
    d3.select(elementCircleId).raise().attr("stroke", "black");
  }

  private dragged(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, event: any, d: Chapter, connections: Connection[], chapters: Chapter[]) {
    const elementCircleId = `#${CSS.escape(d.id)}-chapter-group circle`;
    const elementtextId = `#${CSS.escape(d.id)}-chapter-group text`;

    if (event.x < 100 || event.y < 50 || event.y > this.graphHeigh) {
      return
    }

    d3.select(elementCircleId)
      .attr("cx", d.width = event.x)
      .attr("cy", d.height = event.y);

    d3.select(elementtextId)
      .attr("dx", d.width)
      .attr("dy", d.height + 15)
      .attr("cx", d.width = event.x)
      .attr("cy", d.height = event.y)
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

    // Após o movimento, você pode capturar a nova posição do chapter, timeline e storyline

    const newTimeline = this.findTimelineForChapter(t, event.x);
    const newStoryline = this.findStorylineForChapter(s, event.y);

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
  private findStorylineForChapter(s: StoryLine[], y: number): StoryLine {
    let range = Math.round((y - 50) / this.gridHeight)
    if (range >= s.length - 1) {
      range = s.length - 1
    }
    return s[range];
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
      .on("contextmenu", (ev: MouseEvent, connection: Connection) => {
        ev.preventDefault();
        this.trggerConnectionMenu.openMenu();
        const menuElement = document.querySelector("#" + this.trggerConnectionMenu.menu?.panelId) as HTMLElement;
        if (menuElement) {
          menuElement.style.position = "absolute";
          menuElement.style.left = `${ev.x + 5}px`;
          menuElement.style.top = `${ev.y + 5}px`;
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
          .on("start", (event, str) => this.storyLineSwapDragStart(str, strs))
          .on("drag", (event, str) => this.storyLineSwapDragged(event, strs))
          .on("end", (event, str) => this.storyLineSwapDragEnded(svg, strs))
      );
  }

  storyLineSwapDragStart(str: StoryLine, strs: StoryLine[]){
    if(strs.length <= 1){
      return
    }
    this.storylineSelected = str
    const elementId = `${CSS.escape(str.id)}-storyline-group`;
    d3.select(document.getElementById(elementId)).select("text").attr("font-size", "20");

  }  
  
  storyLineSwapDragged(ev: MouseEvent, strs: StoryLine[]) {
    if(strs.length <= 1){
      return
    }

    this.reset = false
        // Cálculo da posição do mouse em relação aos StoryLines
        let mousePos = (Math.round((ev.y - 0.2) / 50) - 1) < 0 ? 0 : Math.round((ev.y - 0.2) / 50) - 1;
        mousePos = mousePos > strs.length - 1 ? strs.length - 1 : mousePos;
        this.nextStorylineSelected = mousePos <= 0? 1 : mousePos +1
        this.nextStorylineSelected = this.nextStorylineSelected == strs.length ? strs.length - 2 : this.nextStorylineSelected
        let newStrl :StoryLine= strs[mousePos];
        // console.log(newStrl)
      
        const selectedElementText = d3.select(document.getElementById(`${CSS.escape(this.storylineSelected.id)}-storyline-group`)).select("text");
        const isSame = this.storylineSelected.id == newStrl.id



        const selectedNewElementiD = `${CSS.escape(newStrl.id)}-storyline-group`;
        const newstrlElement: any = d3.select(document.getElementById(selectedNewElementiD)).select("text");

        let toWalk = newStrl.order - this.prevStoryline?.order
        toWalk = toWalk <= 0 ? 1 : toWalk
        if (!isSame && this.storylineSelected.order > newStrl.order) {
          // 1
          // console.log('1')

          selectedElementText
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('y', () => (( newStrl.order ) * this.gridHeight) + 2)
          // mover str e chapters seleciondo para as posicoes corretas
          
          if (this.prevStoryline != undefined && this.prevStoryline.order < newStrl.order) {
            // 2
            console.log('2')
            const prevNewElementiD = `${CSS.escape(this.prevStoryline?.id)}-storyline-group`;
            const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD)).select("text");
            prevTimelineElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', ((this.prevStoryline.order ) * this.gridHeight)) 
            // mover prevs linhas e chapters para as posicoes corretas.
            
          }else {
            // 3
            // console.log('3')
            newstrlElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', () => ((this.prevStoryline.order +1 ) * this.gridHeight) - 2)
            // mover o storyline afetado, linhas e chapters para as posicoes corretas.
          }
        } else if (!isSame &&this.storylineSelected.order < newStrl.order) {
            // 4
            console.log('4') 
          selectedElementText
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('y', (newStrl.order * this.gridHeight) + 2)
          // .attr('y', currentElementLocation + (newTimeline.range - this.selectedTimeline.range) * 20);
          // mover str e chapters seleciondo para as posicoes corretas
        
          if (this.prevStoryline != undefined && this.prevStoryline?.order > newStrl.order) {
            // 5
            console.log('5')

            const prevNewElementiD = `${CSS.escape(this.prevStoryline?.id)}-storyline-group`;
            const prevStorylineElement: any = d3.select(document.getElementById(prevNewElementiD)).select("text");
           
            prevStorylineElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', ((this.prevStoryline.order ) * this.gridHeight)) 

          }else{
            // 6
            console.log('6')
            newstrlElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('y', () => ((this.prevStoryline.order - 1) * this.gridHeight) - 2)
            // mover o storyline afetado, linhas e chapters para as posicoes corretas.


          }
        }
       else if (isSame && this.storylineSelected.order == newStrl.order) {
         // 7
        //  console.log('7')
         if (this.prevStoryline != undefined && this.prevStoryline?.order > newStrl.order) {
          // 8
          console.log('8')
          const prevNewElementiD = `${CSS.escape(this.prevStoryline?.id)}-storyline-group`;
          const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD)).select("text");
          prevTimelineElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          // .attr('y', otherElementLocation - (this.prevTimeline?.range * 20));
          // mover prevs linhas e chapters para as posicoes corretas.
          
        }else {
          // 9
          // console.log('9')
          if (this.prevStoryline != undefined) {
          // 10

          // let newStorylineToChange :StoryLine = newStrl
          if(newStrl.id == this.storylineSelected.id){
            newStrl = strs[this.nextStorylineSelected]
          }
          
          console.log('10', newStrl.name)
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
        this.storylineOrderToUpdate = this.storylineSelected.order
    }
  
    if (this.storylineOrderToUpdate != 0) {
        this.storylineOrderToUpdate = newStrl.order
    }
      this.prevStoryline = newStrl
  
        // Verificar se o Story

        console.log('---')
  }
  


  storyLineSwapDragEnded(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, strs: StoryLine[]){
    const elementId = `${CSS.escape(this.storylineSelected.id)}-storyline-group`;
    d3.select(document.getElementById(elementId)).select("text").attr("font-size", "12");
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

          strs.forEach(timeline => {
            this.wd.updateStoryline(timeline)
          });
        }else {
          reordenadas.forEach(timeline => {
            this.wd.updateStoryline(timeline)
          });

        }
      const updateTimelinesApi = reordenadas.map((t) => {
        // return this.api.updateTimeline(t).subscribe((e) => {
        //   this.wd.updateTimeline(e)
        // })
    })

    // updateTimelinesApi.forEach(element => {
    //   element.unsubscribe()
    // });




    // Resetar prevTimeline
    this.prevTimeline = undefined;

  }
  calculateXPosition(tl: Timeline, data: Timeline[]) {
    let range = 100;
    const currentOrder = data.filter((t: Timeline) => t.order <= tl.order);
    const anteriorRange = currentOrder.reduce((a: any, b: any) => a + b.range, 0);
    return ((anteriorRange - tl.range) * 20) + range + ((tl.range / 2) * 20);
  };


  buttonPositions (tl: Timeline, timelines: Timeline[], index: number) {
    const width = (tl.range * 20) - 5;
    const spacing = width / (3 + 1); // Espaçamento proporcional entre os botões
    return this.calculateEditIconPosition(tl, timelines) + spacing * (index + 1); // Calcula a posição proporcional
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
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("cursor", "pointer")
      .text("grb")
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
      .attr("font-size", "12px")
      .attr("cursor", "pointer")
      .text("del")
      .on("click", (e, tl) => this.dialog.openDeleteTimelineDialog({ timeline: tl, timelines: data, chapters: this.chapters }, "150ms", "150ms"));
  
    // Botão de atualizar no header
    headerTimeline.append("text")
      .attr("class", "timeline-update")
      .attr("x", (tl: Timeline) => this.buttonPositions(tl,data, 2)) // Posição proporcional
      .attr("y", this.timeLineTxtHeight)
      .attr("font-family", "Arial")
      .attr("font-size", "12px")
      .attr("cursor", "pointer")
      .text("upd")
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


    const newTimeline = this.findTimelineForChapter(timelines, event.x).timeline

    const isSame = this.selectedTimeline.id == newTimeline.id

    
    const beforeSelected = timelines.filter((t) => t.order <= newTimeline.order)

    const selectedNewElementiD = `${CSS.escape(newTimeline.id)}-timeline-group`;
    const newTimelineElement: any = d3.select(document.getElementById(selectedNewElementiD));
    const newRectElement = newTimelineElement.select(".timeline-body");
    const newRectheaderElement = newTimelineElement.select(".timeline-header");
    const newTextElement = newTimelineElement.selectAll("text");

    const currentElementLocation = this.calculateEditIconPosition(newTimeline, beforeSelected)
    const otherElementLocation = this.calculateEditIconPosition(newTimeline, timelines)

    // console.log(rectElement.node().getBoundingClientRect().width) / 2
    if (!isSame && this.selectedTimeline.order > newTimeline.order) {
      // 1
      console.log(1)
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
        .attr("x", () => this.buttonPositions(newTimeline, timelines, pos)) 
      });


      //  aqui ---------------------------
      if (this.prevTimeline != undefined && this.prevTimeline.order < newTimeline.order) {
        // 2
        console.log(2)

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
            .attr("x", () => this.buttonPositions(newTimeline, timelines, pos)) 
        });


      } else {
// 3
console.log(3)

        newRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation + (this.selectedTimeline.range * 20));

        newRectheaderElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation + (this.selectedTimeline.range * 20));


        newTextElement._groups[0].forEach((element: any, i:number) => {
          const pos = i >= 3 ? 1 : i
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => this.buttonPositions(newTimeline, timelines, pos)) 
        });

      }

    } else if (!isSame &&this.selectedTimeline.order < newTimeline.order) {
// 4
console.log(4)

      rectElement
        .transition()
        .duration(100)
        .ease(d3.easeCubic)
        .attr('x', currentElementLocation + (newTimeline.range - this.selectedTimeline.range) * 20);
      rectElementHeader
        .transition()
        .duration(100)
        .ease(d3.easeCubic)
        .attr('x', currentElementLocation + (newTimeline.range - this.selectedTimeline.range) * 20);


      textElement._groups[0].forEach((element: any, i:number) => {
        const pos = i >= 3 ? 1 : i

        d3.select(element)
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr("x", () => this.buttonPositions(newTimeline, timelines, pos)) 

          // .attr('x', (currentElementLocation + (newTimeline.range - this.selectedTimeline.range) * 20+ this.getElementCenter(rectElement)));
      });


      if (this.prevTimeline != undefined && this.prevTimeline?.order > newTimeline.order) {
// 5
console.log(5)

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
            .attr("x", () => this.buttonPositions(this.prevTimeline??this.selectedTimeline , timelines, pos)) 

            // .attr('x', Location + this.getElementCenter(prevRectElement));
        });


      } else {
    // 6
    console.log(6)

        newRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation - (this.selectedTimeline.range * 20));

        newRectheaderElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation - (this.selectedTimeline.range * 20));

        newTextElement._groups[0].forEach((element: any, i: any) => {
          
          const pos = i >= 3 ? 1 : i
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr("x", () => this.buttonPositions(this.selectedTimeline, timelines, pos)) // Posição proporcional

            // .attr('x',otherElementLocation - (this.selectedTimeline.range * 20) + this.getElementCenter(newRectElement));
        });
      }


    } else if (isSame && this.selectedTimeline.order == newTimeline.order) {
// 7
console.log(7)

      if (this.prevTimeline != undefined && this.prevTimeline?.order > newTimeline.order) {
    // 8
    console.log(8)

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
// 9
console.log(9)

        if (this.prevTimeline != undefined) {
          // 10
console.log(10)
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
              .attr("x", () => this.buttonPositions(this.prevTimeline??this.selectedTimeline, timelines, pos)) 

              // .attr('x', Location + this.getElementCenter(prevRectElement) )
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
              .attr('x', () => {
                if (this.prevTimeline) {
                  return this.buttonPositions(this.prevTimeline, timelines, pos)
                } else {
                  return this.buttonPositions(this.selectedTimeline, timelines, pos)
                }
              });
          });
        }


      }

    }
    console.log('-----------')

    // newTimeline.order = this.selectedTimeline.order
    if (this.timelineOrderToUpdate == 0) {
      this.timelineOrderToUpdate = this.selectedTimeline.order
  }

  if (this.timelineOrderToUpdate != 0) {
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


  numberToRGB(num: number): string {
    // Função hash simples para garantir que cores sejam geradas consistentemente
    const hash = num * 2654435761 % 2 ** 32;

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
