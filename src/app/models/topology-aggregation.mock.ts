import { TopoEdge, TopoNode, TopologyNodeType } from "./graphsTypes";

const TOPO_MOCK_NODE: TopoNode[] = [
  //0
  {
    label: "Node 1",
    x: 50,
    y: 100,
    group: 1,
    type: TopologyNodeType.Individual
  },
  //1
  {
    label: "Node 2",
    x: 250,
    y: 100,
    group: 1,
    type: TopologyNodeType.Agggregated,
    aggregatedNodesCount: 3
  },
  //2
  {
    label: "Node 3",
    x: 400,
    y: 100,
    group: 1,
    type: TopologyNodeType.Individual
  },
  //3
  {
    label: "Node 4",
    x: 600,
    y: 100,
    type: TopologyNodeType.Individual
  },
  //4
  {
    label: "Node 5",
    x: 850,
    y: 100,
    group: 2,
    type: TopologyNodeType.Individual
  },
  //5
  {
    label: "Node 6",
    x: 750,
    y: 300,
    group: 3,
    type: TopologyNodeType.Agggregated,
    aggregatedNodesCount: 2
  },
  //6
  {
    label: "Node 7",
    x: 850,
    y: 300,
    group: 3,
    type: TopologyNodeType.Individual
  },
  //7
  {
    label: "Node 8",
    x: 1050,
    y: 100,
    group: 2,
    type: TopologyNodeType.Agggregated,
    aggregatedNodesCount: 2
  },
  //8
  {
    label: "Node 9",
    x: 1200,
    y: 100,
    type: TopologyNodeType.Individual
  },
  
  //9
  {
    label: "Node 10",
    x: 100,
    y: 400,
    group: 4,
    type: TopologyNodeType.Agggregated,
    aggregatedNodesCount: 2
  },
  //10
  {
    label: "Node 11",
    x: 250,
    y: 400,
    group: 4,
    type: TopologyNodeType.Individual
  },
  //11
  {
    label: "Node 12",
    x: 400,
    y: 400,
    type: TopologyNodeType.Individual
  },
  //12
  {
    label: "Node 13",
    x: 650,
    y: 400,
    group: 5,
    type: TopologyNodeType.Agggregated,
    aggregatedNodesCount: 2
  },
  //13
  {
    label: "Node 14",
    x: 850,
    y: 400,
    group: 5,
    type: TopologyNodeType.Individual
  },
  //14
  {
    label: "Node 15",
    x: 1100,
    y: 400,
    group: 6,
    type: TopologyNodeType.Agggregated,
    aggregatedNodesCount: 2
  },
  //15
  {
    label: "Node 16",
    x: 1200,
    y: 400,
    group:6,
    type: TopologyNodeType.Individual
  },
  //16
  {
    label: "Node 17",
    x: 1350,
    y: 500,
    type: TopologyNodeType.Individual
  },
  //17
  {
    label: "Node 18",
    x: 500,
    y: 600,
    group: 7,
    type: TopologyNodeType.Agggregated,
    aggregatedNodesCount: 2
  },
  //18
  {
    label: "Node 19",
    x: 600,
    y: 600,
    group: 7,
    type: TopologyNodeType.Individual
  },
  //19
  {
    label: "Node 20",
    x: 850,
    y: 600,
    group: 8,
    type: TopologyNodeType.Individual
  },
  //20
  {
    label: "Node 21",
    x: 1050,
    y: 600,
    group: 8,
    type: TopologyNodeType.Agggregated,
    aggregatedNodesCount: 3
  },
  //21
  {
    label: "Node 22",
    x: 1200,
    y: 600,
    group: 8,
    type: TopologyNodeType.Individual
  },
  //22
  {
    label: "Node 23",
    x: 1350,
    y: 700,
    type: TopologyNodeType.Individual
  },
]

export const TOPO_AGGREGATED_MOCK_EDGE: TopoEdge[] = [
  //1st path
  {
    source: TOPO_MOCK_NODE[1],
    target: TOPO_MOCK_NODE[3],
  },
  {
    source: TOPO_MOCK_NODE[3],
    target: TOPO_MOCK_NODE[7],
  },
  {
    source: TOPO_MOCK_NODE[3],
    target: TOPO_MOCK_NODE[5],
  },
  // {
  //   source: TOPO_MOCK_NODE[5],
  //   target: TOPO_MOCK_NODE[6],
  // },
  {
    source: TOPO_MOCK_NODE[5],
    target: TOPO_MOCK_NODE[7],
  },
  {
    source: TOPO_MOCK_NODE[7],
    target: TOPO_MOCK_NODE[8],
  },
  // {
  //   source: TOPO_MOCK_NODE[4],
  //   target: TOPO_MOCK_NODE[7],
  // },
  // {
  //   source: TOPO_MOCK_NODE[9],
  //   target: TOPO_MOCK_NODE[10],
  // },
  {
    source: TOPO_MOCK_NODE[9],
    target: TOPO_MOCK_NODE[11],
  },
  {
    source: TOPO_MOCK_NODE[11],
    target: TOPO_MOCK_NODE[12],
  },
  // {
  //   source: TOPO_MOCK_NODE[12],
  //   target: TOPO_MOCK_NODE[13],
  // },
  {
    source: TOPO_MOCK_NODE[12],
    target: TOPO_MOCK_NODE[14],
  },
  // {
  //   source: TOPO_MOCK_NODE[14],
  //   target: TOPO_MOCK_NODE[15],
  // },
  {
    source: TOPO_MOCK_NODE[8],
    target: TOPO_MOCK_NODE[16],
  },
  {
    source: TOPO_MOCK_NODE[14],
    target: TOPO_MOCK_NODE[16],
  },
  {
    source: TOPO_MOCK_NODE[11],
    target: TOPO_MOCK_NODE[17],
  },
  // {
  //   source: TOPO_MOCK_NODE[17],
  //   target: TOPO_MOCK_NODE[18],
  // },
  {
    source: TOPO_MOCK_NODE[17],
    target: TOPO_MOCK_NODE[20],
  },
  // {
  //   source: TOPO_MOCK_NODE[19],
  //   target: TOPO_MOCK_NODE[20],
  // },
  // {
  //   source: TOPO_MOCK_NODE[20],
  //   target: TOPO_MOCK_NODE[21],
  // },
  {
    source: TOPO_MOCK_NODE[20],
    target: TOPO_MOCK_NODE[16],
  },
  {
    source: TOPO_MOCK_NODE[20],
    target: TOPO_MOCK_NODE[22],
  }
]