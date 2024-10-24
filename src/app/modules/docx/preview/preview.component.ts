import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ApiService } from '../../api.service';
import { Chapter } from '../../../models/paperTrailTypes';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent {
  worldId: string = "";
  chapterId: string = "";

  docLink:string = ""
  constructor(
    private route: ActivatedRoute,
    private wd: WorldDataService,
    private api:ApiService,
    @Inject(MAT_DIALOG_DATA) public data: Chapter
  ) {
  }

  ngOnInit(): void {
      this.docLink = this.wd.getChapterPreview(this.data.id)
  }
}
