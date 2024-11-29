import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { AuthService } from '../../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { infoDialog, paper, world } from '../../../models/paperTrailTypes';
import { ErrorService } from '../../error.service';
import { WorldDataService } from '../world-data.service';
import { DialogService } from '../../../dialog/dialog.service';
import { Observable, Subject, takeUntil } from 'rxjs';

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
    private wd:WorldDataService,
  ) { }
  worldList: world[] = []
  papperList: paper[] = []
  destroy$ = new Subject<void>();

  Showloading: Observable<boolean> = this.wd.loading$
  ngOnInit() {
    // this.wd.loadingOn()
    this.api.getWorldList()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
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

    // this.wd.loading$.subscribe((status) => {
      
    //   const info:infoDialog = {
    //     header:"error loading worlds list",
    //     status: 'warning',
    //     message:"error loading world list, please try again later or contact our support page.",
    //     action: "getWorldList"
    //   }
    //   // this.dialog.openInfoDialog(info)
    // })
  }


  ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
  }

  logOut() {
    this.auth.logOut()
  }

  getPaperList(worldId: string) {
    this.api
    .getPaperList(worldId)
    .pipe(takeUntil(this.destroy$)).subscribe({
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


