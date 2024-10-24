import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { world, paper, Chapter, Connection, Timeline, Event, basicWorld, StoryLine } from '../../models/paperTrailTypes';

@Injectable({
  providedIn: 'root'
})
export class WorldDataService {
  // Usamos BehaviorSubjects para armazenar o estado e permitir que os componentes se inscrevam para atualizações
  private worldSubject = new BehaviorSubject<basicWorld | null>(null);
  private papersSubject = new BehaviorSubject<paper[]>([]);
  private chaptersSubject = new BehaviorSubject<Chapter[]>([]);
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  private timelinesSubject = new BehaviorSubject<Timeline[]>([]);
  private storylinesSubject = new BehaviorSubject<StoryLine[]>([]);
  private connectionsSubject = new BehaviorSubject<Connection[]>([]);

  // Observables para os componentes se inscreverem
  world$ = this.worldSubject.asObservable();
  papers$ = this.papersSubject.asObservable();
  chapters$ = this.chaptersSubject.asObservable();
  events$ = this.eventsSubject.asObservable();
  timelines$ = this.timelinesSubject.asObservable();
  storylines$ = this.storylinesSubject.asObservable();
  connections$ = this.connectionsSubject.asObservable();
  worldId: string = ""
  constructor() {}

  getWorld(){

  }

  // Métodos para atualizar o estado
  setWorld(world: basicWorld): void {
    this.worldId = world.id
    this.worldSubject.next(world);
  }

  setPapers(papers: paper[]): void {
    this.papersSubject.next(papers);
  }

  setChapters(chapters: Chapter[]): void {
    this.chaptersSubject.next(chapters);
  }

  setEvents(events: Event[]): void {
    this.eventsSubject.next(events);
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
  getChapterLink(id: string): string{
    return `https://docs.google.com/document/d/${id}/edit?usp=drivesdk`
  }
  getChapterPreview(id: string): string{
    return `https://docs.google.com/document/d/${id}/preview?usp=drivesdk`
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

  removeChapter(chapterId: string): void {
    const chapters = this.chaptersSubject.value.filter(c => c.id !== chapterId);
    this.chaptersSubject.next(chapters);
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

  setWorldData(data: world): void{
    const basicworldInfo :basicWorld = {
      created_at: data.created_at,
      id: data.id,
      name: data.name
  }
  this.setWorld(basicworldInfo)
  this.setPapers(data.papers)
  this.setChapters(data.chapters)
  this.setConnections(data.connections)
  this.setEvents(data.Events)
  this.setTimelines(data.timelines)
  this.setStorylines(data.storyLines)
  }
}
