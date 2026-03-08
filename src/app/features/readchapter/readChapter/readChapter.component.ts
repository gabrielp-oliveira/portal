import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiService } from '../../../core/api.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../../core/error.service';
import { Chapter, Subway_Settings } from '../../../models/paperTrailTypes';

@Component({
  standalone: false,
  selector: 'app-readChapter',
  templateUrl: './readChapter.component.html',
  styleUrls: ['./readChapter.component.scss']
})
export class ReadChapterComponent implements OnInit {
  readerUrl: SafeResourceUrl;
  private iframe!: HTMLIFrameElement;
  private currentTheme: boolean = true;
  private chapterOrder: string | null = null;
  private paperId: string | null = null;
  private worldName: string | undefined;
  private hasNext: boolean = false;
  private hasPrev: boolean = false;
  private chapter: Chapter
  private settings: Subway_Settings
  private preventEvent: boolean = false;
  private favoriteSpans = new Set<string>();

  constructor(
    private err: ErrorService,
    private api: ApiService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private wd: WorldDataService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {
    this.readerUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/assets/reader/index.html');
  }

  ngOnInit() {
    const paperId = this.route.snapshot.paramMap.get('paperId');
    this.chapterOrder = this.route.snapshot.paramMap.get('chapterOrder');
    this.paperId = paperId;
  }

  onIframeLoad(event: Event) {
    this.iframe = event.target as HTMLIFrameElement;
    if (!this.chapterOrder || !this.paperId || !this.iframe?.contentWindow) return;

    const jwt = localStorage.getItem('accessToken') || '';

    const payload = {
      type: 'init',
      payload: {
        chapterOrder: this.chapterOrder,
        paperId: this.paperId,
        theme: this.currentTheme,
        jwt
      }
    };

    this.iframe.contentWindow.postMessage(payload, '*');

  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    const { data } = event;
    if (!data?.type) return;

    const { type, payload } = data;
    switch (type) {

      case 'toggle-show-span-hightlight':
        this.settings.show_span_favorite = payload.show_span_favorite;
        this.api.updateSettings(this.settings.id, this.settings).subscribe((ss) => {
          this.settings = ss
        })
        break;


      case 'return-to-read-world':
        if (this.worldName) {
          this.router.navigate(['/read', this.worldName]);
        } else {
          console.warn('🌐 Nome do mundo não encontrado');
        }
        break;
      case 'theme-changed':
        this.currentTheme = payload.theme;

        this.settings.theme = payload.theme

        this.api.updateSettings(this.settings.id, this.settings).subscribe((ss) => {
          this.settings = ss
        })
        break;

      case 'chapter-end':
        if (this.paperId && this.chapterOrder != null) {
          this.api.markChapterCompleted(this.paperId, this.chapterOrder, true).subscribe({
            next: () => {
              this.goToNextPaper()
              console.log('✅ Capítulo marcado como completo')

            },
            error: err => console.error('❌ Erro ao marcar capítulo como completo:', err)
          });
        }
        break;

      case 'attempt-prev-chapter':
        if (this.paperId && this.chapterOrder != null) {
          this.api.markChapterCompleted(this.paperId, this.chapterOrder, true).subscribe({
            next: () => {
              console.log('✅ Capítulo marcado como completo')
              this.goToPreviousChapter()

            },
            error: err => console.error('❌ Erro ao marcar capítulo como completo:', err)
          });
        }
        this.goToPreviousChapter?.();
        break;

      case 'request-chapter-data':
        if (this.chapterOrder == null || !this.paperId) {
          console.error('❌ Dados inválidos: paperId ou chapterOrder ausente');
          return;
        }
        this.api.getchaptersContent(this.chapterOrder, this.paperId).subscribe({
          next: (chapterData) => {
            console.log(chapterData)
            this.chapter = chapterData.chapter
            this.settings = chapterData.settings
            this.hasNext = chapterData.hasNext
            this.hasPrev = chapterData.hasPrev
            this.worldName = chapterData.worldName

            this.iframe?.contentWindow?.postMessage({
              type: 'chapter-data-response',
              payload: { ...chapterData, settings: chapterData.settings }
            }, '*');
          },
          error: (err) => {
            this.iframe?.contentWindow?.postMessage({
              type: 'chapter-data-error',
              payload: err.message || 'Erro desconhecido ao buscar capítulo'
            }, '*');
          }
        });
        break;

      case 'save-annotation':

        if (!payload?.span.id || !payload?.span.text || !payload.note || !this.paperId || this.chapterOrder == null) {
          console.error('❌ spanId, note, paperId ou chapterOrder ausente em save-annotation');
          return;
        }

        this.api.updateAnnotation(
          payload.span.id,
          this.paperId,
          this.chapterOrder,
          payload.note,
          false,
          payload.span.text
        ).subscribe({
          next: () => console.log('✅ Anotação salva  com sucesso'),
          error: err => console.error('❌ Erro ao salvar anotação:', err)
        });
        break;

      case 'update-annotation-favorite':
        console.log(payload)
        if (!payload?.spanId || !this.paperId || this.chapterOrder == null || !payload?.spanText) {
          console.error('❌ spanId, paperId ou chapterOrder ausente em update-annotation-favorite');
          return;
        }

        const isNowFavorite = !this.favoriteSpans.has(payload.spanId);

        this.api.updateAnnotation(
          payload.spanId,
          this.paperId,
          this.chapterOrder,
          '',
          isNowFavorite,
          payload?.spanText
        ).subscribe({
          next: () => {
            if (isNowFavorite) {
              this.favoriteSpans.add(payload.spanId);
              this.sendFavoriteVisualUpdate(payload.spanId, true);
              console.log('❤️ Marcado como favorito');
            } else {
              this.favoriteSpans.delete(payload.spanId);
              this.sendFavoriteVisualUpdate(payload.spanId, false);
              console.log('💔 Removido dos favoritos');
            }
          },
          error: err => console.error('❌ Erro ao atualizar favorito:', err)
        });
        break;

      case 'delete-annotation':
        if (!payload?.annotationId) {
          console.error('❌ annotationId ausente em delete-annotation');
          return;
        }

        this.api.deleteAnnotation(payload.annotationId).subscribe({
          next: () => console.log('🗑️ Anotação removida com sucesso'),
          error: err => console.error('❌ Erro ao deletar anotação:', err)
        });
        break;

      case 'log':
        console.log(`📨 Log do iframe | Fonte: ${payload?.source}`, payload?.message);
        break;

      case "chapter-favorite":
        if (this.paperId && this.chapterOrder != null) {
          this.api.markChapterFavorite(this.paperId, this.chapterOrder, true).subscribe({
            next: () => {
              console.log('✅ Capítulo marcado como completo')
            },
            error: err => console.error('❌ Erro ao marcar capítulo como completo:', err)
          });
        }
        break;
      default:
        console.warn("⚠️ Evento desconhecido do iframe:", data);
        break;
    }
  }

  private sendFavoriteVisualUpdate(spanId: string, favorite: boolean) {
    this.iframe?.contentWindow?.postMessage({
      type: 'toggle-favorite-icon',
      payload: { spanId, favorite }
    }, '*');
  }

  goToNextPaper() {
    if (!this.paperId || !this.chapterOrder) {
      console.error("❗ Dados incompletos para navegação");
      return;
    }

    if (this.hasNext) {
      const nextOrder = Number(this.chapterOrder) + 1;
      window.location.href = `/read/book/${this.paperId}/chapter/${nextOrder}`;
    } else {
      const worldName = this.worldName?.split(" ").join("_");
      window.location.href = worldName ? `/read/${worldName}` : `/dashboard`;
    }
  }

  goToPreviousChapter() {
    if (!this.paperId || !this.chapterOrder) {
      console.error("❗ Dados incompletos para navegação");
      return;
    }

    if (this.hasPrev) {
      const prevOrder = Number(this.chapterOrder) - 1;
      window.location.href = `/read/book/${this.paperId}/chapter/${prevOrder}`;
    } else {
      window.location.href = `/dashboard`;
    }
  }




}
