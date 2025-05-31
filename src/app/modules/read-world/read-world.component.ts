import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { WorldDataService } from '../dashboard/world-data.service';
import { ErrorService } from '../error.service';
import { Timeline, Chapter, StoryLine } from '../../models/paperTrailTypes';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-read-world',
  templateUrl: './read-world.component.html',
  styleUrls: ['./read-world.component.scss']
})
export class ReadWorldComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private iframe!: HTMLIFrameElement;

  constructor(
    private route: ActivatedRoute,
    private wd: WorldDataService,
    private errorHandler: ErrorService,
    private api: ApiService
  ) {}


  ngAfterViewInit(): void {
  const worldName = this.route.snapshot.paramMap.get('worldName');
  if (!worldName) return;

  this.iframe = document.getElementById("board-frame") as HTMLIFrameElement;
  if (!this.iframe) return;

  // Aguarda o iframe carregar antes de escutar mudanças
  this.iframe.addEventListener("load", () => {
    this.setupDataSyncWithIframe();
  });

  // Carrega dados da API e define `visible: true`
  this.api.getWorldDataByName(encodeURIComponent(worldName))
    .pipe(takeUntil(this.destroy$))
    .subscribe((world) => {
      const coloredPapers = (world.papers || []).map(p => ({ ...p, visible: true }));
      const paperColorMap = new Map(coloredPapers.map(p => [p.id, p.color]));

      const coloredChapters = (world.chapters || []).map(ch => ({
        ...ch,
        visible: true,
        color: paperColorMap.get(ch.paper_id) || '#CCCCCC'
      }));

      const visibleTimelines = (world.timelines || []).map(t => ({
        ...t,
        visible: true
      }));

      const updatedWorld = {
        ...world,
        papers: coloredPapers,
        chapters: coloredChapters,
        timelines: visibleTimelines
      };

      this.wd.setWorldData(updatedWorld);
    });
}


  private setupDataSyncWithIframe(): void {
    combineLatest([
      this.wd.chapters$,
      this.wd.timelines$,
      this.wd.storylines$,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ([chapters, timelines, storylines]) => {
        console.log('..')
        // Filtra os elementos visíveis
        const visibleChapters: Chapter[] = chapters.filter(c => c.visible);
        const visibleTimelines: Timeline[] = timelines
          .filter(t => t.visible)
          .sort((a, b) => a.order - b.order)
          .map((t, index) => ({ ...t, order: index + 1 })); // Reordena sequencialmente

        const visibleStorylines: StoryLine[] = storylines; // se quiser aplicar filtro, adicione aqui
 
        
        console.log(visibleChapters.length)
        // Envia dados ao iframe
        this.iframe.contentWindow?.postMessage({
          type: "set-data",
          data: {
            timelines: visibleTimelines,
            storylines: visibleStorylines,
            chapters: visibleChapters
          }
        }, "*");
        this.iframe.contentWindow?.postMessage({
          type: "set-light",
          data: {
            light: false // ajuste se tiver modo claro/escuro
          }
        }, "*");
      },
      error: err => this.errorHandler.errHandler(err)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
