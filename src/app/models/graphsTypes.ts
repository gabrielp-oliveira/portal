export type TopoNode = TopoIndividualNode | TopoAddregatedNode;

export type TopoIndividualNode = {
  label: string;
  x?: number;
  y?: number;
  id?: string;
  group?: number;

  type: TopologyNodeType.Individual;
  rowIndex?: number;
}

export type TopoAddregatedNode = {
  label: string;
  x?: number;
  y?: number;
  id?: string;
  type: TopologyNodeType.Agggregated;
  group: number;

  aggregatedNodesCount: number;
}

export class TopoEdge {
  source: TopoNode ;
  target: TopoNode;
  id?: string;
}

export enum TopologyGeometryType {
  NODE = 'NODE',
  EDGE = 'EDGE'
}

export class TopoLegend {
  geometryType: TopologyGeometryType;
  legendTitle: string;
  legendIconBorderColor: string;
  onClick: () => void;
  isHighlighted: boolean;
}

export enum TopologyNodeType {
  Individual = 'Individual',
  Agggregated = 'Agggregated'
}

export const groupColorMap = new Map<number, string>([
  [1, "#597b8b"],
  [3, "#534710"],
  [4, "#6e4b1c"],
  [5, "#d28b5f"],
  [6, "#8c4a03"],
  [7, "#cbb583"],
  [8, "#ad73c4"],
  [9, "#b8a1cc"],
  [2, "#603059"]
]);

export enum TopologyControlType {
  agregration = 'aggregation',
  contolPoint = 'contolPoint'
}

export const PATH_ROOT_MARGIN_TOP = 50;
export const PATH_ROOT_MARGIN_LEFT = 150;
export const PATH_ROOT_MARGIN_RIGHT = 10;
export const PATH_ROOT_MARGIN_BOTTOM = 10;
export const MARGIN = 50;

//legend
export const LEGEND_LEFT = -50;
export const LEGEND_TOP = -30;
export const LEGEND_TITLE_LENGTH = 220;
export const LEGEND_TITLE_FONT_WEIGHT_DEFAULT = 300;
export const LEGEND_TITLE_FONT_WEIGHT_HIGHLIGHTED = 800;
export const LEGEND_ICON_RADIUS = 7;
export const LEGEND_LINE_LENGTH = 15;
export const LEGEND_FONT_SIZE = "18px";

//node
export const NODE_RADIUS = 8;
export const NODE_ICON_LENGTH = 10;
export const NODE_BACKGROUND_DEFAULT = "#fff";
export const NODE_BORDER_COLOR_DEFAULT = "#000";
export const NODE_BORDER_WIDTH_DEFAULT = 1;
export const NODE_BORDER_WIDTH_HIGHLIGHTED = 2;

//edge
export const EDGE_BORDER_WIDTH_DEFAULT = 3;
export const EDGE_BORDER_COLOR_DEFAULT = "black";
export const LABEL_FONT_SIZE_DEFAULT = "14px";
export const LABEL_FONT_SIZE_GROUP = 12;
export const TIMELINE_MARGIN = 12;
export const SUBWAY_LEFT_MARGIN = 100;
export const RANGE_GAP = 20;
export const TIMELINE_TOP_MARGIN = 20;


//label
export const LABEL_FONT_FAMILY_DEFAULT = "Arial ";


export const LOADING_DELAY = 300;