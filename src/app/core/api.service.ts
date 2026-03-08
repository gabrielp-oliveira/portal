import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Chapter, ChapterAnnotation, UserChapterDetailsResponse, ChapterConfiguration, ChapterDetails, Connection, createWorld, DashboardHeroResponse, DashboardResponse, description, Event, GroupConnection, paper, StoryLine, Subway_Settings, Timeline, world } from '../models/paperTrailTypes';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  selectedWorld: string = ""
  private baseUrl = environment.apiUrl;

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard`);
  }

  getDashboardHero(): Observable<DashboardHeroResponse> {
    return this.http.get<DashboardHeroResponse>(`${this.baseUrl}/dashboard/hero`);
  }

  getWorldList(): Observable<world[]> {
    return this.http.get<world[]>(`${this.baseUrl}/getWorldsList`);
  }
  getPaperList(worldId: string): Observable<paper[]> {
    return this.http.get<paper[]>(`${this.baseUrl}/getPaperList?id=${worldId}`);
  }
  getWorldData(worldId: string): Observable<world> {
    return this.http.get<world>(`${this.baseUrl}/world?id=${worldId}`);
  }
  getWorldDataByName(name: string): Observable<world> {
    return this.http.get<world>(
      `${this.baseUrl}/worldByName?name=${encodeURIComponent(name)}`
    );
  }

  getChapteData(chapterId: string): Observable<ChapterDetails> {
    return this.http.get<ChapterDetails>(`${this.baseUrl}/chapter?id=${chapterId}`);
  }

  chaptersBook(paperId: string): Observable<{chapters: Chapter[],world: world}> {
    return this.http.get<{chapters: Chapter[],world: world}>(`${this.baseUrl}/chaptersBook?paperId=${paperId}`);
  }
  getPaperData(paperId: string): Observable<paper> {
    return this.http.get<paper>(`${this.baseUrl}/paper?id=${paperId}`);
  }
  updatePaper(paperId: string, body: paper): Observable<paper> {
    return this.http.put<paper>(`${this.baseUrl}/updatePaper?id=${paperId}`, body);
  }
  updateConnection(body: Connection): Observable<Connection> {
    return this.http.put<Connection>(`${this.baseUrl}/updateConnection?id=${body.id}`, body);
  }
  updateSettings(ssId: string, body: Subway_Settings): Observable<Subway_Settings> {
    return this.http.put<Subway_Settings>(`${this.baseUrl}/updateSettings?id=${ssId}`, body);
  }
  getSettingsByWorldId(ssId: string): Observable<Subway_Settings> {
    return this.http.get<Subway_Settings>(`${this.baseUrl}/getSettingsByWorldId?worldId=${ssId}`);
  }
  updateEvent(body: Event): Observable<Event> {
    return this.http.put<Event>(`${this.baseUrl}/updateEvent?id=${body.id}`, body);
  }
  updatePaperList(body: paper[]): Observable<paper> {
    return this.http.put<paper>(`${this.baseUrl}/updatePaperList?id=${body[0].id}`, body);
  }
  updateChapter(chapterId: string, body: Chapter): Observable<Chapter> {
    return this.http.put<Chapter>(`${this.baseUrl}/updateChapter?id=${chapterId}`, body);
  }
  updateDescription(description: description): Observable<description> {
    return this.http.put<description>(`${this.baseUrl}/updateDescription?id=${description.id}`, description);
  }
  getDescription(description: description): Observable<description> {
    return this.http.get<description>(`${this.baseUrl}/description?resource_id=${description.resource_id}`);
  }
  getchapterDetails(id: string): Observable<UserChapterDetailsResponse> {
    return this.http.get<UserChapterDetailsResponse>(`${this.baseUrl}/userChapterDetails?chapterId=${id}`);
  }
  updateChapterList(body: Chapter[]): Observable<Chapter[]> {
    return this.http.put<Chapter[]>(`${this.baseUrl}/updateChapterList?id=${body[0].id}`, body);
  }
  updateTimelineList(body: Timeline[]): Observable<Timeline> {
    return this.http.put<Timeline>(`${this.baseUrl}/updateTimelineList?id=${body[0].world_id}`, body);
  }
  updateStoryLineList(body: StoryLine[]): Observable<StoryLine[]> {
    return this.http.put<StoryLine[]>(`${this.baseUrl}/updateStorylineList?id=${body[0].id}`, body);
  }
  updateStoryLine(body: StoryLine): Observable<StoryLine> {
    return this.http.put<StoryLine>(`${this.baseUrl}/updateStoryline?id=${body.id}`, body);
  }
  updateGroupConnection(body: GroupConnection): Observable<GroupConnection> {
    return this.http.put<GroupConnection>(`${this.baseUrl}/updateGroupConnection?id=${body.id}`, body);
  }
  Createworld(body: any): Observable<createWorld> {
    return this.http.post<createWorld>(`${this.baseUrl}/createWorld`, body);
  }
  createGroupConnection(body: GroupConnection): Observable<GroupConnection> {
    return this.http.post<GroupConnection>(`${this.baseUrl}/createGroupConnection`, body);
  }
  deleteGroupConnection(id: string, body: GroupConnection): Observable<Connection[]> {
    const options = { body };
    return this.http.delete<Connection[]>(`${this.baseUrl}/deleteGroupConnection?id=${id}`, options);
  }
  createPaper(body: any): Observable<paper> {
    return this.http.post<paper>(`${this.baseUrl}/createPaper`, body);
  }
  createChapter(body: Chapter): Observable<Chapter> {
    return this.http.post<Chapter>(`${this.baseUrl}/createChapter`, body);
  }
  createConnection(body: Connection): Observable<Connection> {
    return this.http.post<Connection>(`${this.baseUrl}/createConnection`, body);
  }
  createEvent(body: Event): Observable<Event> {
    return this.http.post<Event>(`${this.baseUrl}/createEvent`, body);
  }
  removeConnection(body: Connection): Observable<Connection> {
    return this.http.post<Connection>(`${this.baseUrl}/removeConnection`, body);
  }
  deleteStoryline(id: string, body: StoryLine): Observable<Chapter[]> {
    const options = { body };
    return this.http.delete<Chapter[]>(`${this.baseUrl}/deleteStoryline?id=${id}`, options);
  }
  deleteTimeline(id: string): Observable<Timeline> {
    return this.http.delete<Timeline>(`${this.baseUrl}/deleteTimeline?id=${id}`);
  }
  deleteChapter(id: string): Observable<Chapter> {
    return this.http.delete<Chapter>(`${this.baseUrl}/deleteChapter?id=${id}`);
  }
  deleteEvent(id: string): Observable<Event> {
    return this.http.delete<Event>(`${this.baseUrl}/removeEvent?id=${id}`);
  }
  createStoryLine(body: StoryLine): Observable<StoryLine> {
    return this.http.post<StoryLine>(`${this.baseUrl}/createStoryline`, body);
  }
  updateTimeline(body: Timeline): Observable<Timeline> {
    return this.http.put<Timeline>(`${this.baseUrl}/updateTimeline?id=${body.id}`, body);
  }
  createTimeline(body: Timeline): Observable<Timeline> {
    return this.http.post<Timeline>(`${this.baseUrl}/createTimeline`, body);
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
    }>(`${this.baseUrl}/getChapterFilesByOrderAndPaperId?chapterOrder=${chapterOrder}&paperId=${paperId}`);
  }
  getchaptersContent(
    chapterOrder: string,
    paperId: string
  ): Observable<{
    settings: Subway_Settings; chapter: Chapter; totalPage: number; hasNext: boolean; hasPrev: boolean; worldName?: string;
  }> {
    return this.http.get<{ chapter: Chapter; totalPage: number; settings: Subway_Settings; hasNext: boolean; hasPrev: boolean; worldName?: string; }>(`${this.baseUrl}/chaptersContent?chapterOrder=${chapterOrder}&paperId=${paperId}`);
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
    favorite: boolean,
    spanText: string
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/annotations/${spanId}`, {
      paper_id: paperId,
      chapter_order: chapterOrder,
      note,
      favorite,
      spanText
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
  markChapterFavorite(paperId: string, chapterOrder: string, favorite: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/chapter-configurations/${paperId}/${chapterOrder}/favorite`, {
      favorite
    });
  }
}