import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ApiService } from '../../api.service';
import { Chapter, chapterBasicInfo, ChapterDetails } from '../../../models/paperTrailTypes';
import { UtilsService } from '../../../utils.service';
import { DialogService } from '../../../dialog/dialog.service';

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
  menuClass:'slide-in-right'|'slide-out-right'|'none' = 'none'
  menu:string = 'closeMenu'
  docLink:string = ""

  panelOpenState = true;
  panelpreviewState = false;


  constructor(
    private route: ActivatedRoute,
    private wd: WorldDataService,
    private api:ApiService,
    private utils:UtilsService,
    private dialog:DialogService
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
    this.menuClass = this.openMenu? 'slide-in-right':'slide-out-right'
    if(this.openMenu){
      this.menu = 'openMenu'
    }else {
      this.menu = 'closeMenu'
    }
    console.log(this.ChapterDetails)
  }
  openPreview(data: Chapter| chapterBasicInfo){
    this.dialog.openPreview(data, '150ms','150ms')
  }

  openDesctiprion(c:Chapter) {
      this.dialog.openChapterDescription(c, '150ms', '150ms')
    
  }

  chapterBackgroundColor() {
    const id = this.ChapterDetails?.chapter?.paper_id || '1'
    console.log(this.ChapterDetails?.color?? this.utils.numberToHex(id))
    return {
      'background-color': this.ChapterDetails?.color?? this.utils.numberToHex(id),
    }
  }

}
