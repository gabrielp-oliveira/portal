import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { DialogService } from '../../../dialog/dialog.service';
import { ApiService } from '../../api.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../error.service';
import { Chapter, world } from '../../../models/paperTrailTypes';

@Component({
  selector: 'app-readChapter',
  templateUrl: './readChapter.component.html',
  styleUrls: ['./readChapter.component.scss']
})
export class ReadChapterComponent implements OnInit {
  private iframe!: HTMLIFrameElement;
  private currentTheme: 'dark' | 'light' = 'light';
  private chapterOrder: string | null = null;
  private paperId: string | null = null;
  private world: world;
  private chapters: Chapter[];
  private preventEvent: boolean = false
  constructor(
    private err: ErrorService,
    private api: ApiService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private dialog: DialogService,
    private wd: WorldDataService,
    private router: Router,

  ) { }

  ngOnInit() {
    this.chapterOrder = this.route.snapshot.paramMap.get('chapterOrder');
    this.paperId = this.route.snapshot.paramMap.get('paperId');

    this.iframe = document.getElementById("read-frame") as HTMLIFrameElement;
  }

  onIframeLoad() {
    if (!this.chapterOrder || !this.paperId || !this.iframe?.contentWindow) return;

    const jwt = localStorage.getItem('jwt') || '';

    const payload = {
      type: 'init',
      payload: {
        chapterOrder: this.chapterOrder,
        paperId: this.paperId,
        theme: this.currentTheme,
        jwt
      }
    };

    console.log("📤 Enviando mensagem para iframe:", payload);

    this.iframe.contentWindow.postMessage(payload, 'http://localhost:4200');
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (!event.data?.type) return;


    if(event.data.type == 'worldData'){
      this.world = event.data.payload
          this.api.GetWorldChapters(event.data.payload.id).subscribe((data) => {
            this.chapters = data
          })

    }
    if (event.data.type === 'theme-changed') {
      console.log("🌓 Tema alterado dentro do iframe:", this.currentTheme);
      this.currentTheme = event.data.payload;

    } else if (event.data.type === 'chapter-end') {
      this.goToNextPaper()
      
    } else if (event.data.type === 'attempt-prev-chapter') {
      this.goToPreviousChapter()
    }
  }

  goToNextPaper() {
  if (!this.paperId || !this.chapterOrder || !this.world?.name) {
    console.error("Dados incompletos para navegação");
    return;
  }

  const currentPaperId = this.paperId;
  const currentOrder = Number(this.chapterOrder);

  // 🔍 Encontra o índice do capítulo atual
  const sortedChapters = [...this.chapters].sort((a, b) => {
    if (a.paper_id === b.paper_id) {
      return a.order - b.order;
    }
    return a.paper_id.localeCompare(b.paper_id);
  });

  const currentIndex = sortedChapters.findIndex(
    c => c.paper_id === currentPaperId && c.order === currentOrder
  );

  if (currentIndex === -1) {
    console.error("Capítulo atual não encontrado");
    return;
  }

  const nextChapter = sortedChapters[currentIndex + 1];

  if (nextChapter) {
    // ✅ Avança para o próximo capítulo
    window.location.href = `/read/book/${nextChapter.paper_id}/chapter/${nextChapter.order}`;
  } else {
    // 🛑 Nenhum próximo capítulo → vai para a rota do mundo
    const worldName = this.world.name.split(" ").join("_");
    window.location.href = `/read/${worldName}`;
  }
}


goToPreviousChapter() {
  if (!this.paperId || !this.chapterOrder || !this.world?.name) {
    console.error("Dados incompletos para navegação");
    return;
  }

  const currentPaperId = this.paperId;
  const currentOrder = Number(this.chapterOrder);

  // 🔍 Ordena todos os capítulos por livro e ordem
  const sortedChapters = [...this.chapters].sort((a, b) => {
    if (a.paper_id === b.paper_id) {
      return a.order - b.order;
    }
    return a.paper_id.localeCompare(b.paper_id);
  });

  // 🔍 Localiza índice do capítulo atual
  const currentIndex = sortedChapters.findIndex(
    c => c.paper_id === currentPaperId && c.order === currentOrder
  );

  if (currentIndex === -1) {
    console.error("Capítulo atual não encontrado");
    return;
  }

  const prevChapter = sortedChapters[currentIndex - 1];

  if (prevChapter) {
    // ✅ Volta ao capítulo anterior (mesmo de outro livro)
    window.location.href = `/read/book/${prevChapter.paper_id}/chapter/${prevChapter.order}`;
  } else {
    // 🛑 Nenhum capítulo anterior → volta ao mundo
    const worldName = this.world.name.split(" ").join("_");
    window.location.href = `/read/${worldName}`;
  }
}



  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.iframe?.contentWindow?.postMessage({
      type: 'set-theme',
      payload: this.currentTheme
    });
  }

  goNextPage() {
    this.iframe?.contentWindow?.postMessage({ type: 'next-page' });
  }

  goPrevPage() {
    this.iframe?.contentWindow?.postMessage({ type: 'prev-page' });
  }
}
