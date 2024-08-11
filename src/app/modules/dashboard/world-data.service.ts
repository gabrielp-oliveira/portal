import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { world, Papper, Chapter, Connection, Timeline, Event, basicWorld } from '../../models/papperTrailTypes';

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
  private connectionsSubject = new BehaviorSubject<Connection[]>([]);

  // Observables para os componentes se inscreverem
  world$ = this.worldSubject.asObservable();
  pappers$ = this.pappersSubject.asObservable();
  chapters$ = this.chaptersSubject.asObservable();
  events$ = this.eventsSubject.asObservable();
  timelines$ = this.timelinesSubject.asObservable();
  connections$ = this.connectionsSubject.asObservable();

  constructor() {}

  getWorld(){

  }

  // Métodos para atualizar o estado
  setWorld(world: basicWorld | null): void {
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

  setConnections(connections: Connection[]): void {
    this.connectionsSubject.next(connections);
  }

  // Métodos para manipular dados locais
  addPapper(papper: Papper): void {
    const pappers = this.pappersSubject.value;
    this.pappersSubject.next([...pappers, papper]);
  }

  addChapter(chapter: Chapter): void {
    const chapters = this.chaptersSubject.value;
    this.chaptersSubject.next([...chapters, chapter]);
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
  this.setPappers(data.Pappers)
  this.setChapters(data.Chapters)
  this.setConnections(data.Connections)
  this.setEvents(data.Events)
  this.setTimelines(data.Timelines)

  }
}
