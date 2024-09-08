import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../api.service';

import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../error.service';
import { DialogService } from '../../../dialog/dialog.service';
import { Chapter, Papper } from '../../../models/papperTrailTypes';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrl: './world.component.scss'
})
export class WorldComponent {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private dialog: DialogService,
    private wd: WorldDataService,
    private errorHandler: ErrorService
  ) { }

  pappers$: Papper[];
  world$ = this.wd.world$;
  chapters$: Chapter[]

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadWorldData(id);
      }

      this.wd.chapters$.subscribe((c) => {
        this.chapters$ = c
      })
      this.wd.pappers$.subscribe((p) => {
        this.pappers$ = p
      })
  }

  papperBackgroundColor(order: number){
    return {
      'background-color': this.numberToRGB(order)
    }
  }
  chapterBackgroundColor(id: string){

    const a = this.pappers$.filter((p) => p.id == id)[0]

    return {
      'background-color': this.numberToRGB(a.order)
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


  openChapter(worldId: string | undefined, papperId: string){
    this.router.navigate([`/world/${worldId}/chapter/${papperId}`]);
  }

  updateChapter(pachapterId: string){
    this.dialog.openUpdateChapterDialog('150ms', '150ms', pachapterId) 
  }

  updatePapper(papperId: string){
    this.dialog.openUpdatePapperrDialog('150ms', '150ms', papperId) 
  }
  private loadWorldData(id: string): void {
    this.api.getWorldData(id).subscribe({
      next: (data) => this.wd.setWorldData(data),
      error: (err) =>this.errorHandler.errHandler(err)
    });
  }

  callCreatePapperDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.openCreatePapperDialog(enterAnimationDuration, exitAnimationDuration)
  }
  callCreteChapterDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.openCreateChapterDialog(enterAnimationDuration, exitAnimationDuration)
  }

}

