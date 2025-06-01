import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { DialogService } from '../../../dialog/dialog.service';
import { ApiService } from '../../api.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../error.service';

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

  constructor(
    private err: ErrorService,
    private api: ApiService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private dialog: DialogService,
    private wd: WorldDataService, 
  ) {}

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

    switch (event.data.type) {
      case 'theme-changed':
        this.currentTheme = event.data.payload;
        console.log("🌓 Tema alterado dentro do iframe:", this.currentTheme);
        break;
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.iframe?.contentWindow?.postMessage({
      type: 'set-theme',
      payload: this.currentTheme
    }, 'http://localhost:4200');
  }

  goNextPage() {
    this.iframe?.contentWindow?.postMessage({ type: 'next-page' }, 'http://localhost:4200');
  }

  goPrevPage() {
    this.iframe?.contentWindow?.postMessage({ type: 'prev-page' }, 'http://localhost:4200');
  }
}
