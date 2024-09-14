import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { WorldDataService } from '../../world-data.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './world.component.html',
  styleUrl: './world.component.scss'
})
export class WorldComponent {

  worldId: string = "";
  isDiff:boolean = false
  constructor(private route: ActivatedRoute, private api: ApiService, private dialog: MatDialog,      private wd: WorldDataService,
  ) { }

  ngOnInit(): void {
    // Captura o parâmetro 'id' da rota
    this.route.paramMap.subscribe(params => {
      this.worldId = params.get('id') || "";
      this.api.getWorldData(this.worldId).subscribe((worldInfo) => {
        console.log(worldInfo)
      })
      combineLatest({ "timelines": this.wd.timelines$, "storyLines": this.wd.storylines$
   }).subscribe(() => {
      this.isDiff = this.wd.checkStoryTimeLineAndEvents()
   })

      console.log(params.get('id'))
      // Agora você pode usar o worldId para buscar dados ou exibir informações
    });
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    // this.dialog.open(createWorldPapperDialogComponent, {
    //   width: '350px',
    //   enterAnimationDuration,
    //   exitAnimationDuration,
    // });
  }
  saveChanges(){

  }
}
