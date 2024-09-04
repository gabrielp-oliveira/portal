import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import * as _ from 'lodash';
import { TopoAddregatedNode, TopoEdge, TopoIndividualNode, TopoNode, TopologyNodeType } from '../../models/graphsTypes';
import { TOPO_MOCK_EDGE, MOCK_AXES } from '../../models/topology.mock';
import { TOPO_AGGREGATED_MOCK_EDGE } from '../../models/topology-aggregation.mock';

@Injectable({
  providedIn: 'root'
})
export class SubwayService {
  apiMap = new Map<TopologyNodeType, () => Observable<TopoEdge[]>>([
    [TopologyNodeType.Individual, this.getEdges.bind(this)],
    [TopologyNodeType.Agggregated, this.getAggregatedEdges.bind(this)],
  ]);

  constructor() { }

  list(type: TopologyNodeType): Observable<TopoEdge[]> {
    let api = this.apiMap.get(type);
    return !_.isNil(api) ? api() : this.getEdges();
  }

  getEdges(): Observable<TopoEdge[]> {
    return of(TOPO_MOCK_EDGE)
    .pipe(
      map(data => this.convertData(data))
    );
  }
  getAxes(): Observable<any[]> {
    return of(MOCK_AXES)
    .pipe(
      map(data => this.convertData(data))
    );
  }

  getAggregatedEdges(): Observable<TopoEdge[]> {
    return of(TOPO_AGGREGATED_MOCK_EDGE)
    .pipe(
      map(data => this.convertData(data))
    );
  }

  private convertData(data: TopoEdge[]): TopoEdge[] {
    const newData = _.cloneDeep(data);

    newData.forEach((edge, index) => {
      edge.id = _.isNil(edge.id) ? `${index}-edge` : edge.id;
      edge.source.id = _.isNil(edge.source.id) ? `${index}-source-node` : edge.source.id;
      edge.target.id = _.isNil(edge.target.id) ? `${index}-target-node` : edge.target.id;
    });
    console.log(newData)
    return newData;
  }
}
