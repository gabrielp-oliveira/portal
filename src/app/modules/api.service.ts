import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Chapter, ChapterDetails, Connection, Event, paper, StoryLine, Subway_Settings, Timeline, world } from '../models/paperTrailTypes';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private router: Router) {}

  selectedWorld: string = ""

  getWorldList() :Observable<world[]>{
    return this.http.get<world[]>('http://localhost:9090/getWorldsList')
  }
  getPaperList(worldId: string) :Observable<paper[]>{
    return this.http.get<paper[]>(`http://localhost:9090/getPaperList?id=${worldId}`)
  }
  getWorldData(worldId: string): Observable<world> {
    return this.http.get<world>(`http://localhost:9090/world?id=${worldId}`);
  }
  getChapterUrl(chapterId: string): Observable<ChapterDetails> {
    return this.http.get<ChapterDetails>(`http://localhost:9090/chapter?id=${chapterId}`);
  }
  getChapteData(chapterId: string): Observable<Chapter> {
    return this.http.get<Chapter>(`http://localhost:9090/chapter?id=${chapterId}`);
  }
  GetWorldChapters(worldId: string): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`http://localhost:9090/getWorldChapters?id=${worldId}`);
  }
  getPaperData(papperId: string): Observable<paper> {
    return this.http.get<paper>(`http://localhost:9090/paper?id=${papperId}`);
  }
  updatePaper(papperId: string, body:paper): Observable<paper> {
    return this.http.put<paper>(`http://localhost:9090/updatePaper?id=${papperId}`, body);
  }
  updateSettings(ssId: string, body:Subway_Settings): Observable<Subway_Settings> {
    return this.http.put<Subway_Settings>(`http://localhost:9090/updateSettings?id=${ssId}`, body);
  }
  updateEvent(body:Event): Observable<Event> {
    return this.http.put<Event>(`http://localhost:9090/updateEvent?id=${body.id}`, body);
  }
  updatePaperList(body:paper[]): Observable<paper> {
    return this.http.put<paper>(`http://localhost:9090/updatePaperList?id=${body[0].id}`, body);
  }
  updateChapter(chapterId: string, body:Chapter): Observable<Chapter> {
    return this.http.put<Chapter>(`http://localhost:9090/updateChapter?id=${chapterId}`, body);
  }
  updateChapterList( body:Chapter[]): Observable<Chapter[]> {
    return this.http.put<Chapter[]>(`http://localhost:9090/updateChapterList?id=${body[0].id}`, body);
  }
  updateTimelineList( body:Timeline[]): Observable<Timeline> {
    return this.http.put<Timeline>(`http://localhost:9090/updateTimelineList?id=${body[0].world_id}`, body);
  }
  updateStoryLineList( body:StoryLine[]): Observable<StoryLine[]> {
    return this.http.put<StoryLine[]>(`http://localhost:9090/updateStorylineList?id=${body[0].id}`, body);
  }
  updateStoryLine( body:StoryLine): Observable<StoryLine> {
    return this.http.put<StoryLine>(`http://localhost:9090/updateStoryline?id=${body.id}`, body);
  }
  Createworld(body: any):Observable<world>  {
   return this.http.post<world>('http://localhost:9090/createWorld', body)
  }
  createPaper(body: any):Observable<paper>  {
   return this.http.post<paper>('http://localhost:9090/createPaper', body)
  }
  createChapter(body: Chapter):Observable<Chapter>  {
   return this.http.post<Chapter>('http://localhost:9090/createChapter', body)
  }
  createConnection(body: Connection):Observable<Connection>  {
    return this.http.post<Connection>('http://localhost:9090/createConnection', body)
  }
  createEvent(body: Event):Observable<Event>  {
    return this.http.post<Event>('http://localhost:9090/createEvent', body)
  }
  removeConnection(body: Connection):Observable<Connection>  {
    return this.http.post<Connection>('http://localhost:9090/removeConnection', body)
  }
  deleteStoryline(id: string, body: StoryLine): Observable<world> {
    const options = {
      body: body
    };
    return this.http.delete<world>(`http://localhost:9090/deleteStoryline?id=${id}`, options);
  }
  deleteTimeline(id: string):Observable<Timeline>  {
    return this.http.delete<Timeline>(`http://localhost:9090/deleteTimeline?id=${id}`)
  }
  deleteEvent(id: string):Observable<Event>  {
    return this.http.delete<Event>(`http://localhost:9090/removeEvent?id=${id}`)
  }
  createStoryLine(body: StoryLine):Observable<StoryLine>  {
   return this.http.post<StoryLine>('http://localhost:9090/createStoryline', body)
  }
  updateTimeline(body: Timeline):Observable<Timeline>  {
    return this.http.put<Timeline>(`http://localhost:9090/updateTimeline?id=${body.id}`, body);
  }
  createTimeline(body: Timeline):Observable<Timeline>  {
    return this.http.post<Timeline>(`http://localhost:9090/createTimeline`, body);
  }


}
