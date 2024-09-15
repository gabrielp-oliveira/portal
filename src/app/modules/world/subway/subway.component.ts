import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { SubwayService } from '../subway.service';
import { EDGE_BORDER_COLOR_DEFAULT, EDGE_BORDER_WIDTH_DEFAULT, LABEL_FONT_FAMILY_DEFAULT, LABEL_FONT_SIZE_DEFAULT, LABEL_FONT_SIZE_GROUP, LOADING_DELAY, NODE_BORDER_WIDTH_DEFAULT, NODE_RADIUS, PATH_ROOT_MARGIN_BOTTOM, PATH_ROOT_MARGIN_LEFT, MARGIN, PATH_ROOT_MARGIN_RIGHT, PATH_ROOT_MARGIN_TOP, TopoAddregatedNode, TopoEdge, TopoLegend, TopoNode, TopologyControlType, TopologyGeometryType, TopologyNodeType, groupColorMap } from '../../../models/graphsTypes';
import { BehaviorSubject, Subject, delay, filter, switchMap, takeUntil, tap, combineLatest, map } from 'rxjs';
import { LoadingService } from '../../loading.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Chapter, Connection, StoryLine, Timeline } from '../../../models/papperTrailTypes';
import { ApiService } from '../../api.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { DialogService } from '../../../dialog/dialog.service';

const D3_ROOT_ELEMENT_ID = "subway";


@Component({
  selector: 'app-subway',
  templateUrl: './subway.component.html',
  styleUrls: ['./subway.component.scss']
})
export class SubwayComponent {

  width: number;
  height: number;
  timeLineTxtHeight: number = 20

  selectedChapter: Chapter | undefined;
  selectedConnection: Connection | undefined;
  selectedTimeline: Timeline;
  NextSelectedTimeline: number;
  currentSelectTimelineLeftGap: number;

  isCreateConnectionSet: boolean;
  timelineEdit: boolean = true
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
  pappers$ = this.wd.pappers$;
  connections$ = this.wd.connections$;

  graphHeigh: number = 0

  chapters: Chapter[] = [];
  connections: Connection[] = [];
  timelines: Timeline[] = [];
  timelineOrderToUpdate: number
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
      "chapters": this.chapters$, "pappers": this.pappers$, "connections": this.connections$
    }).subscribe((data) => {
      data.chapters = data.chapters.filter((c) => c.timeline_id != null && c.storyline_id != null)


      let { chapters, pappers, storyLines, timelines, connections } = data
      this.connections = connections
      data.timelines = timelines.sort((a, b) => a.order - b.order);

      data.chapters = chapters.map((c) => {
        c.width = 0
        const str = storyLines.filter((s) => s.id == c.storyline_id)[0]
        const tl = timelines.filter((t) => t.id == c.timeline_id)[0]
        const pp = pappers.filter((p) => p.id == c.papper_id)[0]

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
    return d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .append("svg")
      .attr("width", this.width)
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
      .enter()
      .append("g")
      .attr("id", (c: Chapter) => `${c.id}-chapter-group`)  // Adiciona um ID único para cada grupo de capítulos
      .attr("class", "chapter-group");

    // Circles

    eleEnter
      .append("circle")
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
      timeline_id: newTimeline.timeline.id
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
      return
    }
    svg.selectAll("g")
      .data(cnn)
      .append("path")
      .attr("id", (c) => c.id + "-connections-group")
      .raise()
      .attr("d", (edge: Connection) => {

        let source = c.find((data: Chapter) => data.id === edge.sourceChapterID);
        let target = c.find((data: Chapter) => data.id === edge.targetChapterID);

        let y0 = source ? source?.height : 0;
        let x0 = source ? source?.width : 0;
        let x1 = target ? target.width : 0;
        let y1 = target ? target?.height : 0;


        const CONSTANT_CONTROL_POINT = 5;
        const HORIZONTAL_THRESHOLD = 3;


        let isHorizontal = Math.abs(y0 - y1) < HORIZONTAL_THRESHOLD;
        let isVertical = Math.abs(x0 - x1) < HORIZONTAL_THRESHOLD;

        let controlPointX = (isHorizontal ? x1 : x1 + CONSTANT_CONTROL_POINT * ((x1 - x0) / (y1 - y0)) + MARGIN);
        let controlPointY = isVertical ? y1 : y1 - CONSTANT_CONTROL_POINT * ((y1 - y0) / (x1 - x0));

        let pathData = ""

        if (isVertical == true) {

          // const distance = (controlPointY / 50) * 15
          pathData = `M ${x0} ${y0} Q ${x0} ${y0} ${x1} ${y1}`;

        } else {
          pathData = this.createEdge(x0, y0, x1, y1, controlPointX, controlPointY, isHorizontal);
        }
        return pathData
      })
      .attr("fill", "none")
      .attr("stroke", EDGE_BORDER_COLOR_DEFAULT)
      .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT)
      .attr("cursor", "pointer")
      .on('contextmenu', (ev: MouseEvent, connection: Connection) => {
        ev.preventDefault();

        // this.trigger.menuData ={ xPosition: ev.clientX, yPosition: ev.clientY }

        this.trggerConnectionMenu.openMenu();
        const menu = document.querySelector("#" + this.trggerConnectionMenu.menu?.panelId)
        const menuElement = document.querySelector("#" + this.trggerConnectionMenu.menu?.panelId) as HTMLElement;

        if (menuElement) {
          // Defina o estilo de posicionamento
          menuElement.style.position = 'absolute';
          menuElement.style.left = `${ev.x + 5}px`;
          menuElement.style.top = `${ev.y + 5}px`;
        }
        this.selectedConnection = connection
        const target = this.chapters.filter((chp) => chp.id == connection.targetChapterID)[0]
        target.color = "red"
        const source = this.chapters.filter((chp) => chp.id == connection.sourceChapterID)[0]
        source.color = "red"
        this.wd.updateChapter(target)
        this.wd.updateChapter(source)

      })
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT + 2)
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT)
      })


  }

  renderStoryLines(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    str: StoryLine[]
  ) {
    // Seleciona um grupo exclusivo para as storylines
    let el = svg.selectAll("g.storyline-group")
      .data(str)
      .enter()
      .append("g")
      .attr("class", "storyline-group");  // Adiciona uma classe específica

    el.append("path")
      .attr("d", (st: StoryLine) => {
        var g = d3.select(`#${D3_ROOT_ELEMENT_ID}`)
          .select('svg g')
          .node();
        const strHeight = st.order * this.gridHeight;
        this.graphHeigh += this.gridHeight
        if (g && g instanceof SVGGraphicsElement) {


          return this.createEdge(MARGIN + 50, strHeight, (g.parentElement?.clientWidth || this.width) + (MARGIN * 10), strHeight, (g.parentElement?.clientWidth || this.width), strHeight, true);
        }
        return this.createEdge(MARGIN + 50, strHeight, this.width + (MARGIN * 10), strHeight, this.width, strHeight, true);
      })
      .attr("fill", "none")
      .style("stroke-dasharray", ("5,3"))  // Faz o traço ser pontilhado
      .style("stroke", "rgba(0, 0, 0, 0.25)")  // Define a cor da linha
      .lower();

    el.append("text")
      .attr("dx", () => MARGIN)
      .attr("dy", (node: any) => (node.order * this.gridHeight) + 2)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("text-anchor", "middle")
      .text((node: any) => node.name);
  }


  calculateXPosition(tl: Timeline, data: Timeline[]) {
    let range = 100;
    const currentOrder = data.filter((t: Timeline) => t.order <= tl.order);
    const anteriorRange = currentOrder.reduce((a: any, b: any) => a + b.range, 0);
    return ((anteriorRange - tl.range) * 20) + range + ((tl.range / 2) * 20);
  };


  renderTimeLines(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    data: Timeline[]
  ) {
    const gridHeight = ((data.length - 1) * this.gridHeight) - 20;
    this.totalGridHeight = gridHeight;



    // Seleciona os grupos existentes e associa os dados
    let el: d3.Selection<SVGGElement, Timeline, SVGGElement, unknown> = svg
      .selectAll<SVGGElement, Timeline>("g.timeline-group")
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

    // Adiciona ou atualiza os retângulos
    el.append("rect")
      .attr("x", (tl: Timeline) => this.calculateEditIconPosition(tl, data))
      .attr("y", 0)
      .attr("width", (tl: Timeline) => (tl.range * 20) - 5)
      .attr("height", gridHeight)
      .style("fill", "rgba(100, 10, 0, 0.1)");

    // Adiciona ou atualiza os textos se o modo de edição estiver ativo
    if (this.timelineEdit) {
      el.append("text")
        .attr("class", "timeline-txt")
        .attr("x", (tl: Timeline) => this.calculateXPosition(tl, data))
        .attr("y", this.timeLineTxtHeight)
        .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
        .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
        .attr("text-anchor", "middle")
        .text((tl: Timeline) => tl.name);
    }

    // Adiciona ou atualiza os ícones de edição
    el.append("text")
      .attr("class", "timeline-edit")
      .attr("x", (tl: Timeline) => this.calculateXPosition(tl, data))
      .attr("y", this.timeLineTxtHeight * 2)
      .attr("font-family", "Arial")
      .attr("font-size", "12px")
      .attr("cursor", "pointer")
      .text("✎")
      .on("click", (ev: MouseEvent, tl: Timeline) => this.showEditButtons(el, tl, data, !this.timelineEdit));

    // Se o modo de edição estiver ativo e houver uma linha selecionada, mostra os botões de edição
    if (this.timelineEdit && this.selectedTimeline) {
      this.showEditButtons(el, this.selectedTimeline, data, this.timelineEdit);
    }
  }


  private showEditButtons(edit: any, timeline: Timeline, timelines: Timeline[], show: boolean) {
    if (this.selectedTimeline && this.selectedTimeline.id !== timeline.id) {

      const elementId = `${CSS.escape(this.selectedTimeline.id)}-timeline-group`;
      const lastElement = d3.select(document.getElementById(elementId));

      lastElement.append("text") // Reinsere o texto original do retângulo anterior
        .attr("class", `timeline-txt`)
        .attr("x", () => {
          let range = 100;
          const currentOrder = timelines.filter((t: Timeline) => t.order <= this.selectedTimeline.order);
          const anteriorRange = currentOrder.reduce((a: any, b: any) => a + b.range, 0);

          return ((anteriorRange - this.selectedTimeline.range) * 20) + range + ((this.selectedTimeline.range / 2) * 20);
        })
        .attr("y", this.timeLineTxtHeight)
        .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
        .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
        .attr("text-anchor", "middle")
        .text((tl: any) => this.selectedTimeline.name);
      lastElement.select(".timeline-drag").remove(); // Remove o botão de edição
    }
    if (this.selectedTimeline?.id != timeline.id) {
      this.timelineEdit = true;
    } else {
      this.timelineEdit = show;
    }


    const elementId = `${CSS.escape(timeline.id)}-timeline-group`;
    const element = d3.select(document.getElementById(elementId));


    if (this.timelineEdit) {
      edit._groups[0].forEach((element: any) => {
        if (element.__data__.id !== timeline.id) {
          d3.select(element).select(".timeline-drag").remove();
        }
      });
      element.select(".timeline-txt").remove(); // Remove o texto para abrir o modo de edição
    } else {
      element.append("text")
        .attr("class", `timeline-txt`)
        .attr("x", () => {
          let range = 100;
          const currentOrder = timelines.filter((t: Timeline) => t.order <= timeline.order);
          const anteriorRange = currentOrder.reduce((a: any, b: any) => a + b.range, 0);
          return ((anteriorRange - timeline.range) * 20) + range + ((timeline.range / 2) * 20);
        })
        .attr("y", this.timeLineTxtHeight)
        .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
        .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
        .attr("text-anchor", "middle")
        .text((tl: any) => timeline.name);
    }

    this.selectedTimeline = timeline;
    this.showGrabTimeline(element, timeline, timelines, this.timelineEdit);
  }

  private showGrabTimeline(element: any, timeline: Timeline, timelines: Timeline[], show: boolean) {
    if (show) {
      element.append("text")
        .attr("class", `timeline-drag`)
        .attr("x", () => {
          let range = 100;
          console.log('...')
          const currentOrder = timelines.filter((t: Timeline) => t.order <= timeline.order);
          const anteriorRange = currentOrder.reduce((a: any, b: any) => a + b.range, 0);

          return ((anteriorRange - timeline.range) * 20) + range + ((timeline.range / 2) * 20);
        })
        .attr("y", this.timeLineTxtHeight)
        .attr("font-family", "Arial")
        .attr("font-size", "12px")
        .attr("cursor", "pointer")
        .text("grab")
        .call(
          d3.drag<SVGCircleElement, Timeline>()
            .on("start", () => this.timelineSwapDragStart())
            .on("drag", (event, t) => this.timelineSwapDragged(event, timelines))
            .on("end", (event, t) => this.timelineSwapDragEnded(element, timelines, event, t))
        );

    } else {
      element.select(".timeline-drag").remove();
    }
  }





  private calculateEditIconPosition(tl: Timeline, data: Timeline[]): number {
    let range = 100;
    const currentOrder = data.filter((t: Timeline) => t.order <= tl.order);
    const anteriorRange = currentOrder.reduce((a: any, b: any) => a + b.range, 0);
    return ((anteriorRange - tl.range) * 20) + range;
  }



  timelineSwapDragStart() {

    const elementId = `${CSS.escape(this.selectedTimeline.id)}-timeline-group`;
    d3.select(document.getElementById(elementId)).raise().attr("stroke", "black");

  }






  timelineSwapDragged(event: any, timelines: Timeline[]) {
    const selectedElementiD = `${CSS.escape(this.selectedTimeline.id)}-timeline-group`;
    const CurrentSelectedTimelineElement: any = d3.select(document.getElementById(selectedElementiD));
    const rectElement = CurrentSelectedTimelineElement.select("rect");
    const textElement = CurrentSelectedTimelineElement.selectAll("text");


    const newTimeline = this.findTimelineForChapter(timelines, event.x).timeline


    const beforeSelected = timelines.filter((t) => t.order <= newTimeline.order)

    const selectedNewElementiD = `${CSS.escape(newTimeline.id)}-timeline-group`;
    const newTimelineElement: any = d3.select(document.getElementById(selectedNewElementiD));
    const newRectElement = newTimelineElement.select("rect");
    const newTextElement = newTimelineElement.selectAll("text");

    const currentElementLocation = this.calculateEditIconPosition(newTimeline, beforeSelected)
    const otherElementLocation = this.calculateEditIconPosition(newTimeline, timelines)


    if (this.selectedTimeline.order > newTimeline.order) {



      rectElement
        .transition()
        .duration(100)
        .ease(d3.easeCubic)
        .attr('x', otherElementLocation)


      textElement._groups[0].forEach((element: any) => {
        d3.select(element)
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation + (this.selectedTimeline.range * 10));
      });


      //  aqui ---------------------------
      if (this.prevTimeline != undefined && this.prevTimeline.order < newTimeline.order) {

        const prevNewElementiD = `${CSS.escape(this.prevTimeline?.id)}-timeline-group`;
        const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD));
        const prevRectElement = prevTimelineElement.select("rect");
        const prevtextElement = prevTimelineElement.selectAll("text");
        prevRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation - (this.prevTimeline?.range * 20));

        const range = this.prevTimeline?.range * 10
        prevtextElement._groups[0].forEach((element: any) => {
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', otherElementLocation - range);
        });


      } else {

        newRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation + (this.selectedTimeline.range * 20));


        newTextElement._groups[0].forEach((element: any) => {
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', this.calculateXPosition(newTimeline, timelines) + (this.selectedTimeline.range * 20)
            );
        });

      }

    } else if (this.selectedTimeline.order < newTimeline.order) {

      rectElement
        .transition()
        .duration(100)
        .ease(d3.easeCubic)
        .attr('x', currentElementLocation + (newTimeline.range - this.selectedTimeline.range) * 20);


      textElement._groups[0].forEach((element: any) => {
        d3.select(element)
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', currentElementLocation + (newTimeline.range - this.selectedTimeline.range) * 20);
      });


      if (this.prevTimeline != undefined && this.prevTimeline?.order > newTimeline.order) {

        const Location = this.calculateEditIconPosition(this.prevTimeline, timelines)
        const range = this.prevTimeline?.range
        const prevNewElementiD = `${CSS.escape(this.prevTimeline?.id)}-timeline-group`;
        const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD));
        const prevRectElement = prevTimelineElement.select("rect");
        const prevtextElement = prevTimelineElement.selectAll("text");
        prevRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', Location);

        prevtextElement._groups[0].forEach((element: any) => {
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', Location + (range * 10));
        });


      } else {
        newRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', otherElementLocation - (this.selectedTimeline.range * 20));

        newTextElement._groups[0].forEach((element: any) => {
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', this.calculateXPosition(newTimeline, timelines) - (this.selectedTimeline.range * 10));
        });

      }


    } else if (this.selectedTimeline.order == newTimeline.order) {

      if (this.prevTimeline != undefined && this.prevTimeline?.order > newTimeline.order) {
        const Location = this.calculateEditIconPosition(this.prevTimeline, timelines)

        const prevNewElementiD = `${CSS.escape(this.prevTimeline?.id)}-timeline-group`;
        const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD));
        const prevRectElement = prevTimelineElement.select("rect");
        const prevtextElement = prevTimelineElement.selectAll("text");
        const range = this.prevTimeline?.range

        prevRectElement
          .transition()
          .duration(100)
          .ease(d3.easeCubic)
          .attr('x', Location);


        prevtextElement._groups[0].forEach((element: any) => {
          d3.select(element)
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', Location + (range * 10));
        });




      } else {

        if (this.prevTimeline != undefined) {

          const Location = this.calculateEditIconPosition(this.prevTimeline, timelines)

          const prevNewElementiD = `${CSS.escape(this.prevTimeline?.id)}-timeline-group`;
          const prevTimelineElement: any = d3.select(document.getElementById(prevNewElementiD));
          const prevRectElement = prevTimelineElement.select("rect");
          const prevtextElement = prevTimelineElement.selectAll("text");
          const range = this.prevTimeline?.range

          prevRectElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', Location);

          prevtextElement._groups[0].forEach((element: any) => {
            d3.select(element)
              .transition()
              .duration(100)
              .ease(d3.easeCubic)
              .attr('x', Location + (range * 10));
          });

          let toWalk = this.calculateEditIconPosition(this.selectedTimeline, timelines)
          rectElement
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .attr('x', toWalk);

          textElement._groups[0].forEach((element: any) => {
            d3.select(element)
              .attr('x', () => {
                if (this.prevTimeline) {
                  return this.calculateXPosition(this.prevTimeline, timelines)
                } else {
                  return this.calculateXPosition(this.selectedTimeline, timelines)
                }
              });
          });
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


  timelineSwapDragEnded(element: any, timelines: Timeline[], event: MouseEvent, timeline: Timeline) {
    d3.select(element._groups[0][0]).raise().attr("stroke", "none");




    let tls = timelines
    
    for(let i = this.timelineOrderToUpdate; i != this.selectedTimeline.order;){
      console.log(timelines[i -1].order)
      console.log(this.timelineOrderToUpdate)
      console.log('------')
      if(this.timelineOrderToUpdate > this.selectedTimeline.order){
        tls[i -1].order -= 1 
        i--
        
      }else {
        tls[i -1].order += 1 
        i++
      }
    }
    console.log(tls)
    this.selectedTimeline.order = this.timelineOrderToUpdate
    this.compareTimelinesAndUpdate(this.timelines, tls);

    this.wd.setTimelines(tls)
    this.prevTimeline = undefined

  }

  compareTimelinesAndUpdate(timelinesOld: Timeline[], timelinesNew: Timeline[]) {
    timelinesOld.forEach((oldTimeline) => {
        const newTimeline = timelinesNew.find(t => t.id === oldTimeline.id);
        if (newTimeline && oldTimeline.order !== newTimeline.order) {
            this.updateTimelineOrder(newTimeline);
        }
    });
}

// Função que vai fazer o update do `order` da timeline
updateTimelineOrder(timeline: Timeline) {
    this.api.updateTimeline(timeline)

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
    this.renderTimeLines(svg, timelines);
    this.renderStoryLines(svg, storyLines);
    this.renderChapters(svg, chapters, storyLines, timelines, connections);
    this.renderConnections(svg, chapters, connections);




    this.initZoom();
  }


}
