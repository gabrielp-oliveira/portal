import { Injectable } from '@angular/core';
import { createChapterDialogComponent, createPapperDialogComponent, createWorldDialogComponent, UpdateChapterDialogComponent, UpdatePapperDialogComponent } from './components/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor( private dialog: MatDialog,
  ) { }


  
  openDialog(component:any, enterAnimationDuration: string, exitAnimationDuration: string, data?: any){
    this.dialog.open(component, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: data
    });
  }

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
  openUpdateChapterDialog(enterAnimationDuration: string, exitAnimationDuration: string, chapterId: string): void {
    this.dialog.open(UpdateChapterDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {chapterId: chapterId}
    });
  }
  openUpdatePapperrDialog(enterAnimationDuration: string, exitAnimationDuration: string, papperId: string): void {
    this.dialog.open(UpdatePapperDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {papperId: papperId}
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
