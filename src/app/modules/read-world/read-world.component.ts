import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { WorldDataService } from '../dashboard/world-data.service';
import { ErrorService } from '../error.service';
import { Timeline, Chapter, StoryLine, paper, paperCard } from '../../models/paperTrailTypes';
import { ApiService } from '../api.service';
// import { UtilsService } from '../../utils.service';
import { ChapterDetailsComponent } from './dialog/chapter-details/chapter-details.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-read-world',
  templateUrl: './read-world.component.html',
  styleUrls: ['./read-world.component.scss']
})
export class ReadWorldComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private iframe!: HTMLIFrameElement;
  paperCardList: paperCard[]
  private lastSentSettings: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public wd: WorldDataService,
    private errorHandler: ErrorService,
    private api: ApiService,
    // private utils: UtilsService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  ngAfterViewInit(): void {
    const worldName = this.route.snapshot.paramMap.get('worldName');
    if (!worldName) return;

    this.iframe = document.getElementById("board-frame") as HTMLIFrameElement;
    if (!this.iframe) return;

    // 🛠️ Adiciona listener uma única vez
    this.iframe.addEventListener("load", () => {
      this.setupDataSyncWithIframe();
    }, { once: true });

    // 🛠️ Escuta mensagens do iframe apenas uma vez
    window.addEventListener("message", this.handleIframeMessage);

    // 🔁 Carrega os dados e aplica visible: true
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
        this.parsePaperChapters(coloredPapers)
      });
  }

  private setupDataSyncWithIframe(): void {
    combineLatest([
      this.wd.chapters$,
      this.wd.timelines$,
      this.wd.storylines$,
      this.wd.settings$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([chapters, timelines, storylines, settings]) => {
        if (!settings) return;

        const visibleChapters = chapters.filter(c => c.visible);

        const visibleTimelines = timelines
          .filter(t => t.visible)
          .sort((a, b) => a.order - b.order)
          .map((t, index) => ({ ...t, order: index + 1 }));

        const visibleStorylines = storylines;

        // 🔒 Serializa só as propriedades relevantes
        const serialized = JSON.stringify({
          x: settings.x,
          y: settings.y,
          k: settings.k,
          theme: settings.theme
        });

        // ✅ Evita reenviar dados se não houve alteração relevante
        if (this.lastSentSettings !== serialized) {
          this.lastSentSettings = serialized;

          this.iframe.contentWindow?.postMessage({
            type: "set-data",
            data: {
              timelines: visibleTimelines,
              storylines: visibleStorylines,
              chapters: visibleChapters,
              settings
            }
          }, "*");
        }

        // 💡 Mesmo se settings não mudou, podemos reenviar apenas o tema se quiser reforçar
        this.iframe.contentWindow?.postMessage({
          type: "set-light",
          data: { light: settings.theme }
        }, "*");
      });
  }


  // 🔁 Handler de mensagens externas do iframe
  handleIframeMessage = (event: MessageEvent) => {
    const { type, data } = event.data || {};
    if (type === "chapter-option-selected") {
      this.ChapterSelect(data)
    } else if (type === "chapter-focus") {
      // console.log("🟢 Usuário focou ->:", data);
    } else if (type === "board-transform-update") {
      // console.log("🟢 Transformação do board ->:", data);
      this.boardTransform(data.transform)
    }
  };

  ngOnDestroy(): void {
    window.removeEventListener("message", this.handleIframeMessage);
    this.destroy$.next();
    this.destroy$.complete();
  }


  ChapterSelect(data: chapterSelected) {
    const chapter = this.wd.getChapterTitle(data.chapterId);
    console.log(chapter)
    if (data.option === 'Read Chapter') {


      this.router.navigate(['/read/book', chapter.paper_id, 'chapter', chapter.order]);
    }

    if (data.option === 'Chapter Details') {
      this.openChapterDetails(data.chapterId);
    }
  }



  boardTransform(data: boardTransformation) {
    const current = this.wd.getSettings();

    if (current) {
      const changed =
        current.x !== data.x || current.y !== data.y || current.k !== data.k;

      if (!changed) return; // não faz nada se nada mudou

      const updated = {
        ...current,
        x: data.x,
        y: data.y,
        k: data.k,
      };

      this.api.updateSettings(updated.id, updated)
        .pipe(takeUntil(this.destroy$))
        .subscribe((ss) => {
          this.wd.setSettings(ss);
        });
    }
  }


  openChapterDetails(id: string): void {

    const data = {
      chapter: this.wd.getChapterById(id),
      paper: this.wd.getPaperByChapterId(id),
      link: this.wd.getChapterLink(id)
    }
    this.dialog.open(ChapterDetailsComponent, {
      width: '400px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: data
    });
  }

  parsePaperChapters(papers: paper[]) {
    this.paperCardList = []
    papers.forEach((pp) => {
      this.paperCardList.push({
        paper: pp,
        chapterList: this.wd.getChapterByPaperId(pp.id)
      })
    })
  }
}




type chapterSelected = {
  chapterId: string,
  option: "Chapter Details" | "Read Chapter"
}

type boardTransformation = {
  x: number,
  y: number,
  k: number
}