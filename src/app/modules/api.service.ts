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
  getChapterUrl(chapterId: string): Observable<Chapter> {
    return this.http.get<Chapter>(`http://localhost:9090/chapterUrl?id=${chapterId}`);
  }
  getChapteData(chapterId: string): Observable<Chapter> {
    return this.http.get<Chapter>(`http://localhost:9090/chapter?id=${chapterId}`);
  }
  getPapperData(papperId: string): Observable<Papper> {
    return this.http.get<Papper>(`http://localhost:9090/papper?id=${papperId}`);
  }
  updatePapper(papperId: string, body:Papper): Observable<Papper> {
    return this.http.put<Papper>(`http://localhost:9090/updatePapper?id=${papperId}`, body);
  }
  updateChapter(chapterId: string, body:Chapter): Observable<Chapter> {
    return this.http.put<Chapter>(`http://localhost:9090/updateChapter?id=${chapterId}`, body);
  }
  Createworld(body: any):Observable<world>  {
   return this.http.post<world>('http://localhost:9090/createWorld', body)
  }
  createPapper(body: any):Observable<Papper>  {
   return this.http.post<Papper>('http://localhost:9090/createPapper', body)
  }
  createChapter(body: Chapter):Observable<Chapter>  {
   return this.http.post<Chapter>('http://localhost:9090/createChapter', body)
  }


}
