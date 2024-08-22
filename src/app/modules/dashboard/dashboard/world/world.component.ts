import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './world.component.html',
  styleUrl: './world.component.scss'
})
export class WorldComponent {

  worldId: string = "";

  constructor(private route: ActivatedRoute, private api: ApiService, private dialog: MatDialog) { }

  ngOnInit(): void {
    // Captura o parâmetro 'id' da rota
    this.route.paramMap.subscribe(params => {
      this.worldId = params.get('id') || "";
      this.api.getWorldData(this.worldId).subscribe((worldInfo) => {
        console.log(worldInfo)
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

}
