import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { world, Papper, Chapter, Connection, Timeline, Event, basicWorld, StoryLine } from '../../models/papperTrailTypes';

@Injectable({
  providedIn: 'root'
})
export class WorldDataService {
  // Usamos BehaviorSubjects para armazenar o estado e permitir que os componentes se inscrevam para atualizações
  private worldSubject = new BehaviorSubject<basicWorld | null>(null);
  private pappersSubject = new BehaviorSubject<Papper[]>([]);
  private chaptersSubject = new BehaviorSubject<Chapter[]>([]);
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  private timelinesSubject = new BehaviorSubject<Timeline[]>([]);
  private storylinesSubject = new BehaviorSubject<StoryLine[]>([]);
  private connectionsSubject = new BehaviorSubject<Connection[]>([]);

  // Observables para os componentes se inscreverem
  world$ = this.worldSubject.asObservable();
  pappers$ = this.pappersSubject.asObservable();
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

  setPappers(pappers: Papper[]): void {
    this.pappersSubject.next(pappers);
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
  addPapper(papper: Papper): void {
    const pappers = this.pappersSubject.value;
    this.pappersSubject.next([...pappers, papper]);
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
  updatePapper(papper: Papper): void {
    const pappers = this.pappersSubject.value.map(existingPapper => 
      existingPapper.id === papper.id ? papper : existingPapper
    );
    this.pappersSubject.next(pappers);
  }
  getChapterLink(id: string): string{
    return `https://docs.google.com/document/d/${id}/edit?usp=drivesdk`
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

  removePapper(papperId: string): void {
    const pappers = this.pappersSubject.value.filter(p => p.id !== papperId);
    this.pappersSubject.next(pappers);
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
  this.setPappers(data.pappers)
  this.setChapters(data.chapters)
  this.setConnections(data.connections)
  this.setEvents(data.Events)
  this.setTimelines(data.timelines)
  this.setStorylines(data.storyLines)
  }
}
