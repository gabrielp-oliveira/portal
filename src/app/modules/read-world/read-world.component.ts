import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../api.service';
import { WorldDataService } from '../dashboard/world-data.service';
import { ErrorService } from '../error.service';

@Component({
  selector: 'app-read-world',
  templateUrl: './read-world.component.html',
  styleUrls: ['./read-world.component.scss']
})
export class ReadWorldComponent implements AfterViewInit, OnDestroy {
  destroy$ = new Subject<void>();
  worldName!: string;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private wd: WorldDataService,
    private errorHandler: ErrorService
  ) {}

  ngAfterViewInit(): void {
    const worldName = this.route.snapshot.paramMap.get('worldName');
    if (!worldName) return;

    this.worldName = worldName;

    const iframe = document.getElementById("board-frame") as HTMLIFrameElement;
    if (!iframe) return;

    // Aguarda o iframe carregar antes de enviar os dados
    iframe.addEventListener("load", () => {
      this.loadWorldData(worldName, iframe);
    }, { once: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private loadWorldData(name: string, iframe: HTMLIFrameElement): void {
  this.api.getWorldDataByName(encodeURIComponent(name))
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (world) => {
        const paperColorMap = new Map(
          (world.papers || []).map(p => [p.id, p.color])
        );

        const coloredChapters = (world.chapters || []).map(ch => ({
          ...ch,
          color: paperColorMap.get(ch.paper_id) || '#CCCCCC'
        }));

        // ✅ Substitui os capítulos com cores aplicadas
        const updatedWorld = {
          ...world,
          chapters: coloredChapters
        };

        // Agora sim salva no estado
        this.wd.setWorldData(updatedWorld);

        // E envia os dados ao iframe
        iframe.contentWindow?.postMessage({
          type: "set-data",
          data: {
            timelines: updatedWorld.timelines,
            storylines: updatedWorld.storyLines,
            chapters: updatedWorld.chapters
          }
        }, "*");

        iframe.contentWindow?.postMessage({
          type: "set-light",
          data: {
            light: false // ou true, se estiver em modo claro
          }
        }, "*");
      },
      error: (err) => this.errorHandler.errHandler(err)
    });
}


}
