import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { SubwayService } from '../subway.service';
import { EDGE_BORDER_COLOR_DEFAULT, EDGE_BORDER_WIDTH_DEFAULT, LABEL_FONT_FAMILY_DEFAULT, LABEL_FONT_SIZE_DEFAULT, LABEL_FONT_SIZE_GROUP, LOADING_DELAY, NODE_BORDER_WIDTH_DEFAULT, NODE_RADIUS, PATH_ROOT_MARGIN_BOTTOM, PATH_ROOT_MARGIN_LEFT, MARGIN, PATH_ROOT_MARGIN_RIGHT, PATH_ROOT_MARGIN_TOP, TopoAddregatedNode, TopoEdge, TopoLegend, TopoNode, TopologyControlType, TopologyGeometryType, TopologyNodeType, groupColorMap } from '../../../models/graphsTypes';
import { BehaviorSubject, Subject, delay, filter, switchMap, takeUntil, tap, combineLatest, map } from 'rxjs';
import { LoadingService } from '../../loading.service';
import { MOCK_AXES, MOCK_TIME_LINES } from '../../../models/topology.mock';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Chapter, StoryLine, Timeline } from '../../../models/papperTrailTypes';

const D3_ROOT_ELEMENT_ID = "subway";


@Component({
  selector: 'app-subway',
  templateUrl: './subway.component.html',
  styleUrls: ['./subway.component.scss']
})
export class SubwayComponent {

  width: number;
  height: number;
  edges: TopoEdge[];
  nodes: TopoNode[];
  gridWidth = 100
  gridHeight = 50

  @ViewChild(`${D3_ROOT_ELEMENT_ID}`, { read: ElementRef }) root: ElementRef | undefined;
  fetchEventSubject = new BehaviorSubject<TopologyNodeType | null>(null);
  fetchEvent$ = this.fetchEventSubject.asObservable();

  private renderGraphEventSubject = new BehaviorSubject<boolean>(false);
  private destroyedSubject = new Subject<void>();

  private currentFetchType = TopologyNodeType.Individual;
  private shouldDisplayControlPoints = false;
  displayControlPointsSubject = new BehaviorSubject<boolean>(this.shouldDisplayControlPoints);
  displayControlPoints$ = this.displayControlPointsSubject.asObservable();

  typeCastMap = new Map<TopologyNodeType, (node: TopoNode) => string>([
    [TopologyNodeType.Individual, (node) => {
      return ""
    }],
    [TopologyNodeType.Agggregated, (node) => {
      return node.type === TopologyNodeType.Agggregated ? node.aggregatedNodesCount!.toString() : "";
    }]
  ])

  controlMap = new Map<TopologyControlType, () => void>([
    [
      TopologyControlType.agregration,
      () => {
        this.currentFetchType = this.currentFetchType === TopologyNodeType.Individual ? TopologyNodeType.Agggregated : TopologyNodeType.Individual;
        this.fetchEventSubject.next(this.currentFetchType);
      }
    ],
    [
      TopologyControlType.contolPoint,
      () => {
        this.displayControlPointsSubject.next(true);
      }
    ]
  ]);



  storylines$ = this.wd.storylines$;
  timelines$ = this.wd.timelines$;
  chapters$ = this.wd.chapters$;

  constructor(
    private topologyService: SubwayService,
    private loadingService: LoadingService,
    private cd: ChangeDetectorRef,
    private wd: WorldDataService
  ) {

    this.fetchEvent$.pipe(
      filter(type => !!type),
      takeUntil(this.destroyedSubject),
      tap(() => this.loadingService.loadingOn()),
      switchMap(type => this.topologyService.list(type!)),
      delay(LOADING_DELAY),
      tap(() => this.loadingService.loadingOff()),
    ).subscribe(data => {
      // Clean items on svg

      this.cleanItemsOnSvg();
      this.edges = data;
      this.renderGraphEventSubject.next(this.shouldDisplayControlPoints);
    })

    this.displayControlPoints$.subscribe((val) => {
      if (val) {
        this.shouldDisplayControlPoints = !this.shouldDisplayControlPoints;
        this.fetchEventSubject.next(this.currentFetchType);
      }
    });
  }

  ngAfterViewInit(): void {
    this.width = this.root?.nativeElement.offsetWidth;
    this.height = this.root?.nativeElement.offsetHeight;

    this.fetchEventSubject.next(this.currentFetchType);

    // Initialize the SVG
    let svg = this.initSvg();
    combineLatest({ "timelines": this.timelines$, "storyLines": this.storylines$, "chapters": this.chapters$
  }).subscribe((data) => {
      data.chapters.map((c) => {
        const str = data.storyLines.filter((s) => s.id == c.storyline_id)[0]
        c.height = str?.order * this.gridHeight
        
        const tl = data.timelines.filter((s) => s.id == c.timeline_id)[0]
        const tlRanges = data.timelines.reduce((a, b) => {
          if(b.order <= tl.order){
            return a + b.range
          }else {
            return a
          }
        }, 0)
        c.width = (tlRanges*20) + ((c.range -1) * 20)
        return c
      })
      this.cleanItemsOnSvg();
      this.handleGraphEvents(svg, data);
    })


    // Subscribe events for graph

    this.cd.detectChanges();
  }


  ngOnDestroy() {
    this.destroyedSubject.next();
  }

  private initSvg() {
    return d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .append("svg")
      .attr("width", this.width)
      .attr("height", 300)
      .append("g")
  }

  private renderNodes(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    nodes: any[],
    edges: TopoEdge[],
  ) {
    //nodes
    let eleEnter = svg.selectAll("g")
      .data(nodes)
      .enter();

    //nodes
    eleEnter
      .append("circle")
      .attr("cx", (node: Chapter) => {
        console.log(node.width)
        return node.width
      })
      .attr("cy", (node: any) => node.height)
      .attr("r", () => NODE_RADIUS)
      .attr("fill", (node: TopoNode) => {
        if (node.type === TopologyNodeType.Agggregated) {
          return "#deebf3";
        }
        return groupColorMap.get(node.group!) ?? "#000";
      })
      .attr("stroke", (node: TopoNode) => {
        if (node.type === TopologyNodeType.Agggregated) {
          return "#deebf3";
        }
        return groupColorMap.get(node.group!) ?? "#000";
      })
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)

    //label
    eleEnter
      .append("text")
      .attr("dx", (node: Chapter) => node.width)
      .attr("dy", (node: Chapter) => (node.height + 15)+ "")
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_GROUP)
      .attr("text-anchor", "middle")
      .text((node:Chapter) => node.name)
  }

  private getNodes(edges: TopoEdge[]): TopoNode[] {
    let nodes: TopoNode[] = [];
    if (edges) {
      edges.forEach((edge: TopoEdge) => {
        if (!nodes.find(node => node.id === edge.source.id)) {
          nodes.push(edge.source);
        }
        if (!nodes.find(node => node.id === edge.target.id)) {
          nodes.push(edge.target);
        }
      })
    }
    return nodes;
  }

  private renderEdges(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    arrangedNodes: TopoNode[],
    edges: TopoEdge[],
    shouldDisplayControlPoints: boolean
  ) {
    svg.selectAll("g")
      .data(edges)
      .enter()
      .append("path")
      .attr("d", (edge: TopoEdge) => {
        let source = arrangedNodes.find((data: TopoNode) => data.id === edge.source.id);
        let target = arrangedNodes.find((data: TopoNode) => data.id === edge.target.id);

        let x0 = (source?.x ?? 0) + MARGIN;
        let y0 = source?.y ?? 0;
        let x1 = (target?.x ?? 0) + MARGIN;
        let y1 = target?.y ?? 0;

        const CONSTANT_CONTROL_POINT = 5;
        const HORIZONTAL_THRESHOLD = 3;

        let isHorizontal = Math.abs(y0 - y1) < HORIZONTAL_THRESHOLD;
        let isVertical = Math.abs(x0 - x1) < HORIZONTAL_THRESHOLD;

        let controlPointX = (isHorizontal ? x1 : x1 + CONSTANT_CONTROL_POINT * ((x1 - x0) / (y1 - y0)) + MARGIN);
        let controlPointY = isVertical ? y1 : y1 - CONSTANT_CONTROL_POINT * ((y1 - y0) / (x1 - x0));

        let pathData = ""
        if (isVertical == true && controlPointY > 50) {

          const distance = (controlPointY / 50) * 15
          pathData = `M ${x0} ${y0} Q ${x0 - distance} ${y0 + 50} ${x1} ${y1}`;

        } else {
          pathData = this.createEdge(x0, y0, x1, y1, controlPointX, controlPointY, isHorizontal);
        }
        return pathData
      })
      .attr("fill", "none")
      .attr("stroke", EDGE_BORDER_COLOR_DEFAULT)
      .attr("stroke-width", EDGE_BORDER_WIDTH_DEFAULT)
      .attr("cursor", "pointer")
      .lower()
  }

  renderStoryLines(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    str: any[]
  ) {


    let el = svg.selectAll("g")
      .data(str)
      .enter();

    el.append("path")
      .attr("d", (st: any) => {

        var g = d3.select(`#${D3_ROOT_ELEMENT_ID}`)
          .select('svg g')
          .node()
        const strHeight = st.order * this.gridHeight
        if (g && g instanceof SVGGraphicsElement) {
          const bbox = g.getBBox();  // Obtém as dimensões do <g> usando getBBox
          console.log(bbox.width + MARGIN)
          
          return this.createEdge(MARGIN + 50, strHeight, bbox.width + MARGIN, strHeight, bbox.width, strHeight, true);
        }
        return this.createEdge(MARGIN + 50, strHeight, this.width + MARGIN, strHeight, this.width, strHeight, true);

      })
      .attr("fill", "none")
      .style("stroke-dasharray", ("5,3")) // make the stroke dashed
      .style("stroke", "rgba(0, 0, 0, 0.25)")   // set the line colour
      .on("click", (data) => {
        console.log(data)
      })
      .attr("cursor", "pointer")
      .lower();

    //label
    el
      .append("text")
      .attr("dx", () => MARGIN)
      .attr("dy", (node: any) => (node.order * this.gridHeight) + 2)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("text-anchor", "middle")
      .text((node: any) => node.name)
  }
  renderTimeLines(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, data: any
  ) {
    const gridHeight = ((data.length -1)  * this.gridHeight) - 20;
    console.log(gridHeight)

    // Seleciona os elementos de timeline e adiciona os retângulos
    let el: any = svg
      .selectAll("g")
      .data(data)
      .enter();

    // Renderiza os retângulos que cobrem toda a altura do gráfico
    el.append("rect")
      .attr("x", (tl: Timeline) => {
        let range = 100;
        for (let o = 0; o < tl.order - 1; o++) {
          range += (data[o].range * 20);
        }
        return range;
      })
      .attr("y", MARGIN - 30)
      .attr("width", (tl: Timeline) => {
        return tl.range * 20;
      })
      .attr("height", gridHeight)
      .style("fill", "rgba(100, 10, 0, 0.1)")  // Define a cor de preenchimento do retângulo
      .style("stroke", "rgba(100, 10, 0, 0.3)")  // Define a cor da borda
      .style("stroke-dasharray", "5,3")  // Faz com que a borda seja pontilhada
      .on("click", (data: any) => {
        console.log(data.target.__data__);
      });

    // Adiciona os textos que servem de labels para cada timeline
    el.append("text")
      .attr("x", (tl: any) => {
        let range = 100;
        for (let o = 0; o < tl.order - 1; o++) {
          range += (data[o].range * 20);
        }
        return range + (tl.range * 10);  // Centraliza o texto no meio do retângulo
      })
      .attr("y", 35)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", LABEL_FONT_SIZE_DEFAULT)
      .attr("text-anchor", "middle")
      .text((tl: any) => tl.name);
  }



  private renderControlpoints(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    x0: number, y0: number, x1: number, y1: number, controlPointX: number, controlPointY: number, isHorizontal: boolean
  ) {

    svg.append("circle")
      .attr("cx", x0)
      .attr("cy", controlPointY)
      .attr("r", 2)
      .attr("fill", "red")
      .attr("stroke", "red")
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT);

    svg.append("text")
      .attr("dx", x0)
      .attr("dy", controlPointY + 15)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .text("cp1")
      .attr("cx", controlPointX);

      svg.append("circle")
      .attr("cx", controlPointX)
      .attr("cy", controlPointY)
      .attr("r", 2)
      .attr("fill", "red")
      .attr("stroke", "red")
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT);
      
    svg.append("text")
      .attr("dx", controlPointX)
      .attr("dy", controlPointY + 15)
      .attr("font-family", LABEL_FONT_FAMILY_DEFAULT)
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .text("cp2")

    svg.append("line")
      .attr("x1", x0)
      .attr("y1", y0)
      .attr("x2", x0)
      .attr("y2", controlPointY)
      .attr("stroke", "red")
      .attr("stroke-dasharray", "1,1")
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)

    svg.append("line")
      .attr("x1", x0)
      .attr("y1", controlPointY)
      .attr("x2", controlPointX)
      .attr("y2", controlPointY)
      .attr("stroke", "red")
      .attr("stroke-dasharray", "1,1")
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)

    svg.append("line")
      .attr("x1", controlPointX)
      .attr("y1", controlPointY)
      .attr("x2", x1)
      .attr("y2", y1)
      .attr("stroke", "red")
      .attr("stroke-dasharray", "1,1")
      .attr("stroke-width", NODE_BORDER_WIDTH_DEFAULT)
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




  private cleanItemsOnSvg() {
    
    d3.select(`#${D3_ROOT_ELEMENT_ID}`)
      .selectAll("g > *").remove();
  }

  private handleItemEvents(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
  }

  private handleGraphEvents(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, data: any) {
    // Render graph events
    this.renderGraphEventSubject.pipe(
      takeUntil(this.destroyedSubject)
    ).subscribe((shouldRender: boolean) => {
      //nodes
      
      this.nodes = this.getNodes(this.edges);
      // console.log(data.chapters)

      if (this.nodes.length !== 0) {
        this.renderNodes(svg, data.chapters, this.edges);

        this.renderTimeLines(svg, data.timelines);
        this.renderStoryLines(svg, data.storyLines);
        //edges
        // this.renderEdges(svg, this.nodes, this.edges, shouldRender);

      }

      this.initZoom();
    });
  }

  onNodeChanged(value: TopologyControlType) {
    this.controlMap.get(value)?.call(this);
  }
}
