import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, takeUntil, debounceTime } from 'rxjs';
import { WorldDataService } from '../dashboard/world-data.service';
import { ErrorService } from '../error.service';
import { Timeline, Chapter, StoryLine, paper, paperCard, chapterDetailsModal } from '../../models/paperTrailTypes';
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
  private settingsUpdate$ = new Subject<boolean>();
  private readonly ANIMATION_MS = 400;
  private lastSentPayload: string | null = null;
  paperCardList: paperCard[]

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

    this.settingsUpdate$
      .pipe(debounceTime(this.ANIMATION_MS), takeUntil(this.destroy$))
      .subscribe((collapsed_all) => {
        const current = this.wd.getSettings();
        if (!current?.id) return;
        console.log(`[Board] 💾 Persistindo collapsed_all: ${collapsed_all}`);
        const updated = { ...current, collapsed_all };
        this.wd.setSettings(updated);
        this.api.updateSettings(updated.id, updated)
          .pipe(takeUntil(this.destroy$))
          .subscribe((ss) => this.wd.setSettings({ ...ss, collapsed_all }));
      });

    // 🛠️ Adiciona listener uma única vez
    this.iframe.addEventListener("load", () => {
      console.log('[Board] 🖼️ Iframe carregado — iniciando sync');
      this.setupDataSyncWithIframe();
    }, { once: true });

    // 🛠️ Escuta mensagens do iframe apenas uma vez
    window.addEventListener("message", this.handleIframeMessage);

    // 🔁 Carrega os dados e aplica visible: true
    this.api.getWorldDataByName(worldName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((world) => {
        console.log('[Board] 🌐 World data recebido — collapsed_all:', world?.subway_settings?.collapsed_all, '| settings.id:', world?.subway_settings?.id);
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
        // Aguarda settings reais (id vazio = BehaviorSubject default, dados ainda não carregados)
        if (!settings?.id) {
          console.log('[Board] ⏳ combineLatest emitiu mas settings ainda não carregados (id vazio) — ignorando');
          return;
        }

        const visibleChapters = chapters.filter(c => c.visible);

        const visibleTimelines = timelines
          .filter(t => t.visible)
          .sort((a, b) => a.order - b.order)
          .map((t, index) => ({ ...t, order: index + 1 }));

        const visibleStorylines = storylines;

        console.log(`[Board] 🔄 combineLatest emit — settings.id: ${settings.id} | collapsed_all: ${settings.collapsed_all} | chapters: ${visibleChapters.length} | timelines: ${visibleTimelines.length}`);

        // 🔒 Serializa apenas dados que o board NÃO gerencia localmente.
        // collapsed_all, x, y, k são gerenciados pelo próprio board — incluí-los
        // causaria full re-render (e reset de zoom) desnecessário a cada toggle/pan.
        const serialized = JSON.stringify({
          chapters: visibleChapters.map(c => c.id),
          timelines: visibleTimelines.map(t => ({ id: t.id, order: t.order })),
          storylines: visibleStorylines.map(s => s.id),
          theme: settings.theme,
        });

        // ✅ Evita reenviar dados se não houve alteração relevante
        if (serialized === this.lastSentPayload) {
          console.log('[Board] ⏭️ set-data BLOQUEADO (payload idêntico) — collapsed_all:', settings.collapsed_all);
          return;
        }
        this.lastSentPayload = serialized;

        // O board espera collapsedAll (camelCase), mas o model usa collapsed_all (snake_case)
        const boardSettings = { ...settings, collapsedAll: settings.collapsed_all };

        console.log(`[Board] 📤 set-data ENVIADO — collapsed_all: ${settings.collapsed_all} | collapsedAll (board): ${boardSettings.collapsedAll} | theme: ${settings.theme} | chapters: ${visibleChapters.length}`);
        this.iframe.contentWindow?.postMessage({
          type: "set-data",
          data: {
            timelines: visibleTimelines,
            storylines: visibleStorylines,
            chapters: visibleChapters,
            settings: boardSettings
          }
        }, "*");
      });
  }


  // 🔁 Handler de mensagens externas do iframe
  handleIframeMessage = (event: MessageEvent) => {
    const { type, data } = event.data || {};
    if (type === "chapter-option-selected") {
      this.ChapterSelect(data)
    } else if (type === "chapter-focus") {
      // ignorado
    } else if (type === "board-transform-update") {
      console.log('[Board] 📍 board-transform-update recebido:', data?.transform);
      this.boardTransform(data.transform)
    } else if (type === "board-settings-update") {
      console.log(`[Board] 🔘 board-settings-update recebido — collapsedAll: ${data?.collapsedAll}`);
      this.boardSettingsUpdate(data)
    }
  };

  ngOnDestroy(): void {
    window.removeEventListener("message", this.handleIframeMessage);
    this.lastSentPayload = null;
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



  boardSettingsUpdate(data: { collapsedAll: boolean }) {
    this.settingsUpdate$.next(data.collapsedAll);
  }

  boardTransform(data: boardTransformation) {
    const current = this.wd.getSettings();

    if (current && current.id) {
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

    const data:chapterDetailsModal = {
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