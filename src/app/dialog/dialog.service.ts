import { Injectable } from '@angular/core';
import { createChapterDialogComponent, createEventsDialogComponent, createPaperDialogComponent, createStorylineDialogComponent, createTimelineDialogComponent, createWorldDialogComponent, DataPickerDialogComponent, deleteTimelineDialogComponent, UpdateChapterDialogComponent, UpdatePaperDialogComponent, UpdateTimelineDialogComponent } from './components/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Chapter, Timeline } from '../models/paperTrailTypes';

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
  openUpdateTimelineDialog(t: Timeline, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(UpdateTimelineDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: t
    });
  }
  openDeleteTimelineDialog(t: {timeline: Timeline, timelines: Timeline[], chapters:Chapter[]  }, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(deleteTimelineDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: t
    });
  }
  opencreateEventsDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createEventsDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openCreateStoryline(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createStorylineDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openCreateStorylineDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(UpdateTimelineDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openCreateTimelineDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createTimelineDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openCreateEventsDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(UpdateTimelineDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  openCreatePaperDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createPaperDialogComponent, {
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
  openUpdatePaperrDialog(enterAnimationDuration: string, exitAnimationDuration: string, papperId: string): void {
    this.dialog.open(UpdatePaperDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {papperId: papperId}
    });
  }
  openDataPickerDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(DataPickerDialogComponent, {
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
