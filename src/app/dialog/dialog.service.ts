import { Injectable } from '@angular/core';
import { createChapterDialogComponent, createPapperDialogComponent, createWorldDialogComponent } from './components/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor( private dialog: MatDialog,
  ) { }


  

  openCreateWorldDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createWorldDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  openCreatePapperDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createPapperDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openCreateChapterDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createChapterDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }


}
