import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ApiService } from '../../api.service';
import { ChapterDetails } from '../../../models/paperTrailTypes';

@Component({
  selector: 'app-docx',
  templateUrl: './docx.component.html',
  styleUrl: './docx.component.scss'
})
export class DocxComponent {
  worldId: string = "";
  chapterId: string = "";
  ChapterDetails: ChapterDetails

  docLink:string = ""
  constructor(
    private route: ActivatedRoute,
    private wd: WorldDataService,
    private api:ApiService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.worldId = String(params.get('id'))
      this.chapterId = String(params.get('chapterId'))
      this.api.getChapterUrl(this.chapterId).subscribe((a: ChapterDetails) => this.ChapterDetails = a)
      this.docLink = this.wd.getChapterLink(this.chapterId)
    });
  }
}
