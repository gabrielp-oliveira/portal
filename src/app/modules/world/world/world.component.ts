import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../api.service';

import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../error.service';
import { DialogService } from '../../../dialog/dialog.service';
import { basicWorld, Chapter, infoDialog, paper, world } from '../../../models/paperTrailTypes';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrl: './world.component.scss'
})
export class WorldComponent {
papper: paper;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private dialog: DialogService,
    private wd: WorldDataService,
    private errorHandler: ErrorService,
  ) { }

  papers$: paper[];
  worldId:String;
  chapters$: Chapter[]
  worldData: basicWorld | null
  panelSSOpenState = true;
  panelCreationButtonsOpenState = true;
  panelGroupConnectionOpenState = true;
  destroy$ = new Subject<void>();
  showLoading = this.wd.loading$
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.worldId = id
        this.loadWorldData(id);
      }
      
      this.wd.world$
        .pipe(takeUntil(this.destroy$))
      .subscribe((w) => {
        this.worldData = w
      })
      this.wd.chapters$
        .pipe(takeUntil(this.destroy$))
      .subscribe((c) => {
        this.chapters$ = c
      })
      this.wd.papers$
        .pipe(takeUntil(this.destroy$))
      .subscribe((p) => {
        this.papers$ = p
      })

      // const info :infoDialog= {
      //   status: 'warning',
      //   action: "Delete Timeline",
      //   message:"you must have at least one timeline",
      //   header: "fail to delete timeline"
      // }
      // this.dialog.openInfoDialog(info)
      }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  papperBackgroundColor(pp: paper){
    return {
      'background-color': this.numberToRGB(pp.order),
      "filter": pp.focus? "brightness(1.2)" : "brightness(1)",
    }
  }
  chapterBackgroundColor(chapter: Chapter){

    const pp = this.papers$.filter((p) => p.id == chapter.paper_id)[0]
    return {
      'background-color': this.numberToRGB(pp.order),
      "filter": (pp.focus || chapter.focus)? "brightness(1.2)" : "brightness(1)"

    }
  }
  numberToRGB(num: number): string {
    // Função hash simples para garantir que cores sejam geradas consistentemente
    const hash = num * 2654435761 % 2**32;
  
    // Extrai valores de R, G, B a partir do hash
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = (hash & 0x0000FF);
  
    return `rgb(${r}, ${g}, ${b})`;
  }

  createStoryline(){
    this.dialog.openCreateStoryline('150ms', '150ms')
  }
  createTimeline(){
    this.dialog.openCreateTimelineDialog('150ms', '150ms')
  }
  openSubwaySettings(){
    this.dialog.openSubwaySettingsDialog('150ms', '150ms')
  }
  openCreateGroup(){
    this.dialog.openCreateGroupConnectionDialog('150ms', '150ms')
  }
  createEvents(){
    this.dialog.opencreateEventsDialog( this.wd.worldId , '150ms', '150ms')
  }
  openChapter(worldId: string | undefined, papperId: string){
    this.router.navigate([`/world/${worldId}/chapter/${papperId}`]);
  }

  updateChapter(pachapterId: string){
    this.dialog.openUpdateChapterDialog('150ms', '150ms', pachapterId) 
  }

  updatePaper(papperId: string){
    this.dialog.openUpdatePaperrDialog('150ms', '150ms', papperId) 
  }
  private loadWorldData(id: string): void {

    
    this.api.getWorldData(id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {  
        this.wd.setWorldData(data)
      },
      error
      : (err) =>this.errorHandler.errHandler(err)
    });
    // setTimeout(() => {
    //   this.wd.loadingOff()

    // }, 2000);
  }

  callCreatePaperDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.openCreatePaperDialog(enterAnimationDuration, exitAnimationDuration)
  }
  callCreteChapterDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.openCreateChapterDialog(enterAnimationDuration, exitAnimationDuration)
  }


  
  hoverPappeer(pp: paper){
    pp.focus = !!!pp.focus
    this.wd.updatePaper(pp)
  }
  hooverChapter(cpt: Chapter){
    cpt.focus = !!!cpt.focus
    this.wd.updateChapter(cpt)
  }

}

