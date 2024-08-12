import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Chapter, Papper, world } from '../models/papperTrailTypes';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private router: Router) {}

  selectedWorld: string = ""

  getWorldList() :Observable<world[]>{
    return this.http.get<world[]>('http://localhost:9090/getWorldsList')
  }
  getPapperList(worldId: string) :Observable<Papper[]>{
    return this.http.get<Papper[]>(`http://localhost:9090/getPapperList?id=${worldId}`)
  }
  getWorldData(worldId: string): Observable<world> {
    return this.http.get<world>(`http://localhost:9090/world?id=${worldId}`);
  }
  Createworld(body: any):Observable<world>  {
   return this.http.post<world>('http://localhost:9090/createWorld', body)
  }
  createPapper(body: any):Observable<world>  {
   return this.http.post<world>('http://localhost:9090/createPapper', body)
  }
  createChapter(body: any):Observable<Chapter>  {
   return this.http.post<Chapter>('http://localhost:9090/createChapter', body)
  }


}
