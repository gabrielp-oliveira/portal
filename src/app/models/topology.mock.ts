import { TopoEdge, TopoNode, TopologyNodeType } from "./graphsTypes";

const TOPO_MOCK_NODE: TopoNode[] = [
  //0
  {
    label: "Chapter 1",
    x: 50,
    y: 50,
    group: 1,
    type: TopologyNodeType.Individual
  },
  //1
  {
    label: "Chapter 2",
    x: 250,
    y: 50,
    group: 1,
    type: TopologyNodeType.Individual
  },
  //2
  {
    label: "Chapter 3",
    x: 400,
    y: 50,
    group: 1,
    type: TopologyNodeType.Individual
  },
  //3
  {
    label: "Chapter 4",
    x: 600,
    y: 50,
    type: TopologyNodeType.Individual
  },
  //4
  {
    label: "Chapter 5",
    x: 850,
    y: 50,
    group: 2,
    type: TopologyNodeType.Individual
  },
  //5
  {
    label: "Chapter 6",
    x: 600,
    y: 100,
    group: 3,
    type: TopologyNodeType.Individual
  },
  //6
  {
    label: "Chapter 7",
    x: 850,
    y: 100,
    group: 3,
    type: TopologyNodeType.Individual
  },
  //7
  {
    label: "Chapter 8",
    x: 1050,
    y: 50,
    group: 2,
    type: TopologyNodeType.Individual
  },
  //8
  {
    label: "Chapter 9",
    x: 1300,
    y: 50,
    type: TopologyNodeType.Individual
  },
  
  //9
  {
    label: "Chapter 10",
    x: 50,
    y: 150,
    group: 4,
    type: TopologyNodeType.Individual
  },
  //10
  {
    label: "Chapter 11",
    x: 250,
    y: 150,
    group: 4,
    type: TopologyNodeType.Individual
  },
  //11
  {
    label: "Chapter 12",
    x: 400,
    y: 150,
    type: TopologyNodeType.Individual
  },
  //12
  {
    label: "Chapter 13",
    x: 600,
    y: 150,
    group: 5,
    type: TopologyNodeType.Individual
  },
  //13
  {
    label: "Chapter 14",
    x: 850,
    y: 150,
    group: 5,
    type: TopologyNodeType.Individual
  },
  //14
  {
    label: "Chapter 15",
    x: 1050,
    y: 150,
    group: 6,
    type: TopologyNodeType.Individual
  },
  //15
  {
    label: "Chapter 16",
    x: 1200,
    y: 150,
    group:6,
    type: TopologyNodeType.Individual
  },
  //16
  {
    label: "Chapter 17",
    x: 1350,
    y: 150,
    type: TopologyNodeType.Individual
  },
  //17
  {
    label: "Chapter 18",
    x: 500,
    y: 200,
    group: 7,
    type: TopologyNodeType.Individual
  },
  //18
  {
    label: "Chapter 19",
    x: 600,
    y: 200,
    group: 7,
    type: TopologyNodeType.Individual
  },
  //19
  {
    label: "Chapter 20",
    x: 850,
    y: 200,
    group: 8,
    type: TopologyNodeType.Individual
  },
  //20
  {
    label: "Chapter 21",
    x: 1050,
    y: 200,
    group: 8,
    type: TopologyNodeType.Individual
  },
  //21
  {
    label: "Chapter 22",
    x: 1200,
    y: 200,
    group: 8,
    type: TopologyNodeType.Individual
  },
  //22
  {
    label: "Chapter 23",
    x: 1350,
    y: 250,
    type: TopologyNodeType.Individual
  },
]

export const TOPO_MOCK_EDGE: TopoEdge[] = [
  //1st path
  {
    source: TOPO_MOCK_NODE[0],
    target: TOPO_MOCK_NODE[1],
  },
  {
    source: TOPO_MOCK_NODE[1],
    target: TOPO_MOCK_NODE[2],
  },
  {
    source: TOPO_MOCK_NODE[2],
    target: TOPO_MOCK_NODE[3],
  },
  {
    source: TOPO_MOCK_NODE[3],
    target: TOPO_MOCK_NODE[4],
  },
  {
    source: TOPO_MOCK_NODE[3],
    target: TOPO_MOCK_NODE[12],
  },
  {
    source: TOPO_MOCK_NODE[3],
    target: TOPO_MOCK_NODE[18],
  },
  {
    source: TOPO_MOCK_NODE[5],
    target: TOPO_MOCK_NODE[6],
  },
  {
    source: TOPO_MOCK_NODE[6],
    target: TOPO_MOCK_NODE[7],
  },
  {
    source: TOPO_MOCK_NODE[6],
    target: TOPO_MOCK_NODE[14],
  },
  {
    source: TOPO_MOCK_NODE[7],
    target: TOPO_MOCK_NODE[8],
  },
  {
    source: TOPO_MOCK_NODE[4],
    target: TOPO_MOCK_NODE[7],
  },
  {
    source: TOPO_MOCK_NODE[9],
    target: TOPO_MOCK_NODE[10],
  },
  {
    source: TOPO_MOCK_NODE[10],
    target: TOPO_MOCK_NODE[11],
  },
  {
    source: TOPO_MOCK_NODE[11],
    target: TOPO_MOCK_NODE[12],
  },
  {
    source: TOPO_MOCK_NODE[12],
    target: TOPO_MOCK_NODE[13],
  },
  {
    source: TOPO_MOCK_NODE[13],
    target: TOPO_MOCK_NODE[14],
  },
  {
    source: TOPO_MOCK_NODE[14],
    target: TOPO_MOCK_NODE[15],
  },
  {
    source: TOPO_MOCK_NODE[8],
    target: TOPO_MOCK_NODE[16],
  },
  {
    source: TOPO_MOCK_NODE[15],
    target: TOPO_MOCK_NODE[16],
  },
  {
    source: TOPO_MOCK_NODE[11],
    target: TOPO_MOCK_NODE[17],
  },
  {
    source: TOPO_MOCK_NODE[17],
    target: TOPO_MOCK_NODE[18],
  },
  {
    source: TOPO_MOCK_NODE[18],
    target: TOPO_MOCK_NODE[19],
  },
  {
    source: TOPO_MOCK_NODE[19],
    target: TOPO_MOCK_NODE[20],
  },
  {
    source: TOPO_MOCK_NODE[20],
    target: TOPO_MOCK_NODE[21],
  },
  {
    source: TOPO_MOCK_NODE[21],
    target: TOPO_MOCK_NODE[16],
  },
  {
    source: TOPO_MOCK_NODE[21],
    target: TOPO_MOCK_NODE[22],
  }
]


export const MOCK_AXES: any = {
  storyLines: [
    {
    order: 1,
    Description: "",
    name: "hero",
  },
    {
    order: 2,
    Description: "",
    name: "villan",
  },
    {
    order: 3,
    Description: "",
    name: "group",
  },
    {
    order: 4,
    Description: "",
    name: "war",
  },
    {
    order: 5,
    Description: "",
    name: "extra",
  },
    {
    order: 6,
    Description: "",
    name: "other",
  },
    {
    order: 7,
    Description: "",
    name: "global",
  },
]
}


export const MOCK_TIME_LINES: any = {
  timeLines: [
    {
    order: 1,
    range: 8,
    Description: "",
    name: "start",
  },
    {
    order: 2,
    range: 5,
    Description: "",
    name: "seccondary",
  },
    {
    order: 3,
    range:5,
    Description: "",
    name: "third",
  },
    {
    order: 4,
    range: 7,
    Description: "",
    name: "fourth",
  },
    {
    order: 5,
    range: 5,
    Description: "",
    name: "fifth",
  },
    {
    order: 6,
    range: 10,
    Description: "",
    name: "sixth",
  },
    {
    order: 7,
    range: 5,
    Description: "",
    name: "global",
  },
]
}