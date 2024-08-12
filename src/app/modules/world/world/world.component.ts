import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../api.service';

import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../error.service';
import { DialogService } from '../../../dialog/dialog.service';

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

  pappers$ = this.wd.pappers$;
  world$ = this.wd.world$;
  chapters$ = this.wd.chapters$;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadWorldData(id);
      }
  }

  openChapter(worldId: string | undefined, papperId: string){
    this.router.navigate([`/world/${worldId}/chapter/${papperId}`]);

    // this.wd.getChapterLink(id)
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

