import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { AuthService } from '../../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { paper, world } from '../../../models/paperTrailTypes';
import { ErrorService } from '../../error.service';
import { WorldDataService } from '../world-data.service';
import { DialogService } from '../../../dialog/dialog.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  constructor(
    private err: ErrorService,
    private api: ApiService,
    private auth: AuthService,
    private dialog: DialogService,
    private wp:WorldDataService
  ) { }

  worldList: world[] = []
  papperList: paper[] = []

  ngOnInit() {
    this.api.getWorldList().subscribe({
      next: (worldList) => {
        this.worldList = worldList
      },
      error: (err) => {
        this.err.errHandler(err)
      },
      complete: () => {
        console.log('Operação concluída');
      }
    });

  }

  logOut() {
    this.auth.logOut()
  }

  getPaperList(worldId: string) {
    this.api.getPaperList(worldId).subscribe({
      next: (worldList) => {
        this.papperList = worldList
      },
      error: (err) => {
        this.err.errHandler(err)
      },
      complete: () => {
        console.log('Operação concluída');
      }
    });
  }
  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.openCreateWorldDialog(enterAnimationDuration, exitAnimationDuration)
    
  }


}


