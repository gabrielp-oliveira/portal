import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ApiService } from '../../api.service';
import { ChapterDetails } from '../../../models/paperTrailTypes';
import { UtilsService } from '../../../utils.service';

@Component({
  selector: 'app-docx',
  templateUrl: './docx.component.html',
  styleUrl: './docx.component.scss'
})
export class DocxComponent {
  worldId: string = "";
  chapterId: string = "";
  ChapterDetails: ChapterDetails
  openMenu:boolean = false
  menuClass:'slide-in-right'|'slide-out-left'|'none' = 'none'
  docLink:string = ""

  panelOpenState = false;
  panelpreviewState = false;


  constructor(
    private route: ActivatedRoute,
    private wd: WorldDataService,
    private api:ApiService,
    private utils:UtilsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.worldId = String(params.get('id'))
      this.chapterId = String(params.get('chapterId'))
      this.api.getChapteData(this.chapterId).subscribe((a: ChapterDetails) =>this.ChapterDetails = a)
      this.docLink = this.wd.getChapterLink(this.chapterId)
    });
  }
  callMenu(){
    this.openMenu = !this.openMenu
    this.menuClass = this.openMenu? 'slide-in-right':'slide-out-left'
  }

  chapterBackgroundColor() {
    const id = this.ChapterDetails?.chapter?.paper_id || '1'
    return {
      'background-color': this.ChapterDetails.color?? this.utils.numberToHex(id),
    }
  }

}
