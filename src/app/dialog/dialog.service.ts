import { Injectable } from '@angular/core';
import { chapteDescriptionDialogComponent, createChapterDialogComponent, createEventsDialogComponent, createPaperDialogComponent, createStorylineDialogComponent, createTimelineDialogComponent, createWorldDialogComponent, DataPickerDialogComponent, deleteTimelineDialogComponent, strEditDialogComponent, UpdateChapterDialogComponent, UpdatePaperDialogComponent, UpdateTimelineDialogComponent } from './components/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Chapter, paper, StoryLine, Timeline } from '../models/paperTrailTypes';
import { DocxComponent } from '../modules/docx/docx/docx.component';
import { PreviewComponent } from '../modules/docx/preview/preview.component';

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
  opencreateEventsDialog(worldId:String, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createEventsDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: worldId
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
  openChapterDescription(data:Chapter | paper | StoryLine, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(chapteDescriptionDialogComponent, {
      width: '500',
      enterAnimationDuration,
      exitAnimationDuration,
      data:data
    });
  }
  openStorylineEditDialog(data: StoryLine, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(strEditDialogComponent, {
      width: '500',
      enterAnimationDuration,
      exitAnimationDuration,
      data:data
    });
  }
  openPreview(data:Chapter, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(PreviewComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
      data:data
    });
  }




}
