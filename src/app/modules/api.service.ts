import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Chapter, ChapterAnnotation, ChapterConfiguration, ChapterDetails, Connection, createWorld, description, Event, GroupConnection, paper, StoryLine, Subway_Settings, Timeline, world } from '../models/paperTrailTypes';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private router: Router) { }

  selectedWorld: string = ""
  private baseUrl = 'http://localhost:9090';

  getWorldList(): Observable<world[]> {
    return this.http.get<world[]>('http://localhost:9090/getWorldsList')
  }
  getPaperList(worldId: string): Observable<paper[]> {
    return this.http.get<paper[]>(`http://localhost:9090/getPaperList?id=${worldId}`)
  }
  getWorldData(worldId: string): Observable<world> {
    return this.http.get<world>(`http://localhost:9090/world?id=${worldId}`);
  }
  getWorldDataByName(name: string): Observable<world> {
    return this.http.get<world>(
      `http://localhost:9090/worldByName?name=${encodeURIComponent(name)}`
    );
  }

  getChapterUrl(chapterId: string): Observable<ChapterDetails> {
    return this.http.get<ChapterDetails>(`http://localhost:9090/chapter?id=${chapterId}`);
  }

  getChapteData(chapterId: string): Observable<ChapterDetails> {
    return this.http.get<ChapterDetails>(`http://localhost:9090/chapter?id=${chapterId}`);
  }
  GetWorldChapters(worldId: string): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`http://localhost:9090/getWorldChapters?id=${worldId}`);
  }
  getPaperData(papperId: string): Observable<paper> {
    return this.http.get<paper>(`http://localhost:9090/paper?id=${papperId}`);
  }
  updatePaper(papperId: string, body: paper): Observable<paper> {
    return this.http.put<paper>(`http://localhost:9090/updatePaper?id=${papperId}`, body);
  }
  updateConnection(body: Connection): Observable<Connection> {
    return this.http.put<Connection>(`http://localhost:9090/updateConnection?id=${body.id}`, body);
  }
  updateSettings(ssId: string, body: Subway_Settings): Observable<Subway_Settings> {
    return this.http.put<Subway_Settings>(`http://localhost:9090/updateSettings?id=${ssId}`, body);
  }
  updateEvent(body: Event): Observable<Event> {
    return this.http.put<Event>(`http://localhost:9090/updateEvent?id=${body.id}`, body);
  }
  updatePaperList(body: paper[]): Observable<paper> {
    return this.http.put<paper>(`http://localhost:9090/updatePaperList?id=${body[0].id}`, body);
  }
  updateChapter(chapterId: string, body: Chapter): Observable<Chapter> {
    return this.http.put<Chapter>(`http://localhost:9090/updateChapter?id=${chapterId}`, body);
  }
  updateDescription(description: description): Observable<description> {
    return this.http.put<description>(`http://localhost:9090/updateDescription?id=${description.id}`, description);
  }
  getDescription(description: description): Observable<description> {
    return this.http.get<description>(`http://localhost:9090/description?resource_id=${description.resource_id}`);
  }
  updateChapterList(body: Chapter[]): Observable<Chapter[]> {
    return this.http.put<Chapter[]>(`http://localhost:9090/updateChapterList?id=${body[0].id}`, body);
  }
  updateTimelineList(body: Timeline[]): Observable<Timeline> {
    return this.http.put<Timeline>(`http://localhost:9090/updateTimelineList?id=${body[0].world_id}`, body);
  }
  updateStoryLineList(body: StoryLine[]): Observable<StoryLine[]> {
    return this.http.put<StoryLine[]>(`http://localhost:9090/updateStorylineList?id=${body[0].id}`, body);
  }
  updateStoryLine(body: StoryLine): Observable<StoryLine> {
    return this.http.put<StoryLine>(`http://localhost:9090/updateStoryline?id=${body.id}`, body);
  }
  updateGroupConnection(body: GroupConnection): Observable<GroupConnection> {
    return this.http.put<GroupConnection>(`http://localhost:9090/updateGroupConnection?id=${body.id}`, body);
  }
  Createworld(body: any): Observable<createWorld> {
    return this.http.post<createWorld>('http://localhost:9090/createWorld', body)
  }
  createGroupConnection(body: GroupConnection): Observable<GroupConnection> {
    return this.http.post<GroupConnection>('http://localhost:9090/createGroupConnection', body)
  }
  deleteGroupConnection(id: string, body: GroupConnection): Observable<Connection[]> {
    const options = {
      body: body
    };
    return this.http.delete<Connection[]>(`http://localhost:9090/deleteGroupConnection?id=${id}`, options);
  }
  createPaper(body: any): Observable<paper> {
    return this.http.post<paper>('http://localhost:9090/createPaper', body)
  }
  createChapter(body: Chapter): Observable<Chapter> {
    return this.http.post<Chapter>('http://localhost:9090/createChapter', body)
  }
  createConnection(body: Connection): Observable<Connection> {
    return this.http.post<Connection>('http://localhost:9090/createConnection', body)
  }
  createEvent(body: Event): Observable<Event> {
    return this.http.post<Event>('http://localhost:9090/createEvent', body)
  }
  removeConnection(body: Connection): Observable<Connection> {
    return this.http.post<Connection>('http://localhost:9090/removeConnection', body)
  }
  deleteStoryline(id: string, body: StoryLine): Observable<Chapter[]> {
    const options = {
      body: body
    };
    return this.http.delete<Chapter[]>(`http://localhost:9090/deleteStoryline?id=${id}`, options);
  }
  deleteTimeline(id: string): Observable<Timeline> {
    return this.http.delete<Timeline>(`http://localhost:9090/deleteTimeline?id=${id}`)
  }
  deleteChapter(id: string): Observable<Chapter> {
    return this.http.delete<Chapter>(`http://localhost:9090/deleteChapter?id=${id}`)
  }
  deleteEvent(id: string): Observable<Event> {
    return this.http.delete<Event>(`http://localhost:9090/removeEvent?id=${id}`)
  }
  createStoryLine(body: StoryLine): Observable<StoryLine> {
    return this.http.post<StoryLine>('http://localhost:9090/createStoryline', body)
  }
  updateTimeline(body: Timeline): Observable<Timeline> {
    return this.http.put<Timeline>(`http://localhost:9090/updateTimeline?id=${body.id}`, body);
  }
  createTimeline(body: Timeline): Observable<Timeline> {
    return this.http.post<Timeline>(`http://localhost:9090/createTimeline`, body);
  }

  fetchChapterByPaperAndTitle(
    chapterOrder: string,
    paperId: string
  ): Observable<{
    chapterId: string;
    title: string;
    files: { name: string; mimeType: string; link: string }[];
    world: any;
  }> {
    return this.http.get<{
      chapterId: string;
      title: string;
      files: { name: string; mimeType: string; link: string }[];
      world: any;
    }>(`http://localhost:9090/getChapterFilesByOrderAndPaperId?chapterOrder=${chapterOrder}&paperId=${paperId}`);
  }

    createAnnotation(annotation: ChapterAnnotation): Observable<ChapterAnnotation> {
    return this.http.post<ChapterAnnotation>(`${this.baseUrl}/annotations`, annotation);
  }

  // ✅ Obter anotações de um capítulo (userId vem do token no backend)
  getAnnotations(paperId: string, chapterOrder: number): Observable<ChapterAnnotation[]> {
    return this.http.get<ChapterAnnotation[]>(`${this.baseUrl}/annotations/${paperId}/${chapterOrder}`);
  }

  // ✅ Criar ou atualizar anotação com base no spanId, paperId e chapterOrder
  updateAnnotation(
    spanId: string,
    paperId: string,
    chapterOrder: string,
    note: string,
    favorite: boolean
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/annotations/${spanId}`, {
      paper_id: paperId,
      chapter_order: chapterOrder,
      note,
      favorite
    });
  }

  // ✅ Deletar anotação
  deleteAnnotation(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/annotations/${id}`);
  }

  // 🔸 Atualizar configuração
  updateChapterConfiguration(
    paperId: string,
    chapterOrder: number,
    completed: boolean,
    favorite: boolean
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/chapter-configurations/${paperId}/${chapterOrder}`, {
      completed,
      favorite
    });
  }

  // 🔹 Obter configuração do capítulo
  getChapterConfiguration(paperId: string, chapterOrder: number): Observable<ChapterConfiguration> {
    return this.http.get<ChapterConfiguration>(
      `${this.baseUrl}/chapter-configurations/${paperId}/${chapterOrder}`
    );
  }

  // 🔹 Obter todas as configurações do usuário autenticado
  getAllChapterConfigurations(): Observable<ChapterConfiguration[]> {
    return this.http.get<ChapterConfiguration[]>(`${this.baseUrl}/chapter-configurations`);
  }

  // ✅ Marcar capítulo como completo
  markChapterCompleted(paperId: string, chapterOrder: string, completed: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/chapter-configurations/${paperId}/${chapterOrder}/completed`, {
      completed
    });
  }
}