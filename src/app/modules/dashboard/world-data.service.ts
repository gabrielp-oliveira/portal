import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { world, paper, Chapter, Connection, Timeline, Event, basicWorld, StoryLine, Subway_Settings, GroupConnection } from '../../models/paperTrailTypes';

@Injectable({
  providedIn: 'root'
})
export class WorldDataService {
  // Usamos BehaviorSubjects para armazenar o estado e permitir que os componentes se inscrevam para atualizações
  private worldSubject = new BehaviorSubject<basicWorld | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private papersSubject = new BehaviorSubject<paper[]>([]);
  private chaptersSubject = new BehaviorSubject<Chapter[]>([]);
  private tableChapterSubject = new BehaviorSubject<Chapter[] | undefined>(undefined);
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  private groupConnectionSubject = new BehaviorSubject<GroupConnection[]>([]);
  private ssGroupConnectionSubject = new BehaviorSubject<GroupConnection[] | undefined>(undefined);
  private timelinesSubject = new BehaviorSubject<Timeline[]>([]);
  private storylinesSubject = new BehaviorSubject<StoryLine[]>([]);
  private connectionsSubject = new BehaviorSubject<Connection[]>([]);
  private settingsSubject = new BehaviorSubject<Subway_Settings>({
    id: '',
    chapter_names: false,
    display_table_chapters: false,
    timeline_update_chapter: false,
    storyline_update_chapter: false,
    show_span_favorite : false,
    theme: true,
    group_connection_update_chapter: false,
    user_id: '',
    k: 0.7,
    x: 0,
    y: 0,
    world_id: ''
  });

  // Observables para os componentes se inscreverem
  world$ = this.worldSubject.asObservable();
  papers$ = this.papersSubject.asObservable();
  chapters$ = this.chaptersSubject.asObservable();
  tableChapter$ = this.tableChapterSubject.asObservable();
  events$ = this.eventsSubject.asObservable();
  groupConnection$ = this.groupConnectionSubject.asObservable();
  SsGroupConnection$ = this.ssGroupConnectionSubject.asObservable();
  timelines$ = this.timelinesSubject.asObservable();
  storylines$ = this.storylinesSubject.asObservable();
  connections$ = this.connectionsSubject.asObservable();
  settings$ = this.settingsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  worldId: string = ""
  constructor() { }

  getWorld() {
    return this.worldSubject.value
  }

  // Métodos para atualizar o estado
  setWorld(world: basicWorld): void {
    console.log('..')
    this.worldId = world.id
    this.worldSubject.next(world);
  }

  setPapers(papers: paper[]): void {
    this.papersSubject.next(papers);
  }
  setSettings(ss: Subway_Settings): void {
    this.settingsSubject.next(ss);
  }
  getSettings() {
    return this.settingsSubject.value;
  }

  setChapters(chapters: Chapter[]): void {
    this.chaptersSubject.next(chapters);
  }
  setTableChapter(chapters: Chapter[] | undefined): void {
    this.tableChapterSubject.next(chapters);
  }
  setGlobalConnectionGroup(cnn: GroupConnection[] | undefined): void {
    this.ssGroupConnectionSubject.next(cnn);
  }

  setEvents(events: Event[]): void {
    this.eventsSubject.next(events);
  }
  setGroupConnection(gcs: GroupConnection[]): void {
    this.groupConnectionSubject.next(gcs);
  }

  setTimelines(timelines: Timeline[]): void {
    this.timelinesSubject.next(timelines);
  }
  setStorylines(storyLine: StoryLine[]): void {
    this.storylinesSubject.next(storyLine);
  }

  setConnections(connections: Connection[]): void {
    this.connectionsSubject.next(connections);
  }

  // Métodos para manipular dados locais
  addPaper(paper: paper): void {
    const papers = this.papersSubject.value;
    this.papersSubject.next([...papers, paper]);
  }

  addGroupConnection(gc: GroupConnection): void {
    const gcs = this.groupConnectionSubject.value;
    this.groupConnectionSubject.next([...gcs, gc]);
  }

  updateGroupConnection(gc: GroupConnection): void {
    const gcs = this.groupConnectionSubject.value.map(oldGc =>
      oldGc.id === gc.id ? gc : oldGc
    );
    this.groupConnectionSubject.next(gcs);
  }

  addStoryline(storyline: StoryLine): void {
    const storylines = this.storylinesSubject.value;
    this.storylinesSubject.next([...storylines, storyline]);
  }

  addChapter(chapter: Chapter): void {
    const chapters = this.chaptersSubject.value;
    this.chaptersSubject.next([...chapters, chapter]);
  }
  updateChapter(chapter: Chapter): void {
    const chapters = this.chaptersSubject.value.map(existingChapter =>
      existingChapter.id === chapter.id ? chapter : existingChapter
    );
    this.chaptersSubject.next(chapters);
  }
  updateConnection(cnn: Connection): void {
    const cnns = this.connectionsSubject.value.map(existingCnn =>
      existingCnn.id === cnn.id ? cnn : existingCnn
    );
    this.connectionsSubject.next(cnns);
  }
  updateTimeline(timeline: Timeline): void {
    const timelines = this.timelinesSubject.value.map(existingTimeline =>
      existingTimeline.id === timeline.id ? timeline : existingTimeline
    );
    this.timelinesSubject.next(timelines);
  }
  updateStoryline(storyline: StoryLine): void {
    const storylines = this.storylinesSubject.value.map(existingStoryline =>
      existingStoryline.id === storyline.id ? storyline : existingStoryline
    );
    this.storylinesSubject.next(storylines);
  }

  updatePaper(paper: paper): void {
    const papers = this.papersSubject.value.map(existingPaper =>
      existingPaper.id === paper.id ? paper : existingPaper
    );
    this.papersSubject.next(papers);
  }

  updateEvent(event: Event): void {
    const events = this.eventsSubject.value.map(existingEvent =>
      existingEvent.id === event.id ? event : existingEvent
    );
    this.eventsSubject.next(events);
  }
  getChapterLink(id: string): string {
    return `https://docs.google.com/document/d/${id}/edit?usp=drivesdk`
  }
  getChapterPreview(id: string): string {
    return `https://docs.google.com/document/d/${id}/preview?usp=drivesdk`
  }
  getChapterTitle(id: string) {
    return this.chaptersSubject.value.filter((c) => c.id == id)[0]
  }
  getChapterByPaperId(id: string) {
    return this.chaptersSubject.value.filter((c) => c.paper_id == id)
  }
  getPaperByChapterId(id: string) {
    return this.papersSubject.value.filter((p) => p.id == this.getChapterById(id).paper_id)[0]
  }
  getNextPaperInOrderById(id: string) {
    const paper = this.papersSubject.value.filter((p) => p.id == id)[0]
    const nextPaper = this.papersSubject.value.filter((p) => p.order == paper.order + 1)[0]
    return nextPaper
  }
  getPrevPaperInOrderById(id: string) {
    const paper = this.papersSubject.value.filter((p) => p.id == id)[0]
    const nextPaper = this.papersSubject.value.filter((p) => p.order == paper.order - 1)[0]
    return nextPaper
  }

  getChapterByTitle(title: string) {
    return this.chaptersSubject.value.filter((c) => c.title == title)[0]
  }
  getChapterById(id: string) {
    return this.chaptersSubject.value.filter((c) => c.id == id)[0]
  }

  addEvent(event: Event): void {
    const events = this.eventsSubject.value;
    this.eventsSubject.next([...events, event]);
  }

  addTimeline(timeline: Timeline): void {
    const timelines = this.timelinesSubject.value;
    this.timelinesSubject.next([...timelines, timeline]);
  }

  addConnection(connection: Connection): void {
    const connections = this.connectionsSubject.value;
    this.connectionsSubject.next([...connections, connection]);
  }

  removePaper(papperId: string): void {
    const papers = this.papersSubject.value.filter(p => p.id !== papperId);
    this.papersSubject.next(papers);
  }
  removeGroupConnection(gcId: string): void {
    const gc = this.groupConnectionSubject.value.filter(p => p.id !== gcId);
    this.groupConnectionSubject.next(gc);
  }

  removeChapter(chapterId: string): void {
    const chapters = this.chaptersSubject.value.filter(c => c.id !== chapterId);
    this.chaptersSubject.next(chapters);
  }
  removeStoryLine(strId: string): void {
    const storylines = this.storylinesSubject.value.filter(c => c.id !== strId);
    this.storylinesSubject.next(storylines);
  }

  removeEvent(eventId: string): void {
    const events = this.eventsSubject.value.filter((e: Event) => e.id !== eventId);
    this.eventsSubject.next(events);
  }

  removeTimeline(timelineId: string): void {
    const timelines = this.timelinesSubject.value.filter(t => t.id !== timelineId);
    this.timelinesSubject.next(timelines);
  }

  removeConnection(connectionId: string): void {
    const connections = this.connectionsSubject.value.filter(c => c.id !== connectionId);
    this.connectionsSubject.next(connections);
  }

  setWorldData(data: world): void {
    const basicworldInfo: basicWorld = {
      created_at: data.created_at,
      id: data.id,
      name: data.name,
      description: data.description
    }
    this.setWorld(basicworldInfo)
    this.setPapers(data.papers)
    this.setGroupConnection(data.groupConnections)
    this.setChapters(data.chapters)
    this.setConnections(data.connections)
    this.setEvents(data.events)
    this.setTimelines(data.timelines)
    this.setStorylines(data.storyLines)
    this.setSettings(data.subway_settings)

    this.setLoading(false)
  }

  setLoading(status: boolean) {
    this.loadingSubject.next(status);
  }

  // Adicione estes métodos públicos
  updateAllPapersVisible(): void {
    const updated = this.papersSubject.value.map(p => ({ ...p, visible: true }));
    this.papersSubject.next(updated);
  }

  updateAllChaptersVisible(): void {
    const updated = this.chaptersSubject.value.map(c => ({ ...c, visible: true }));
    this.chaptersSubject.next(updated);
  }

  updateAllTimelinesVisible(): void {
    const updated = this.timelinesSubject.value.map(t => ({ ...t, visible: true }));
    this.timelinesSubject.next(updated);
  }

  getpaperList(): paper[] {
    return this.papersSubject.value
  }
}
