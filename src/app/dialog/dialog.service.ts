import { Injectable } from '@angular/core';
import { chapteDescriptionDialogComponent, createChapterDialogComponent,
   createEventsDialogComponent, createPaperDialogComponent, createStorylineDialogComponent,
    createTimelineDialogComponent, createWorldDialogComponent, DataPickerDialogComponent,
     deleteTimelineDialogComponent, updateConnectionDialogComponent, SettingsDialogComponent,
      strEditDialogComponent, UpdateChapterDialogComponent, UpdateEventDialogComponent,
       UpdatePaperDialogComponent, UpdateTimelineDialogComponent, 
       createGroupConnectionDialogComponent,
       updateGroupConnectionDialogComponent} from './components/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Chapter, chapterBasicInfo, ChapterDetails, Connection, Event, GroupConnection, paper, StoryLine, Timeline } from '../models/paperTrailTypes';
import { PreviewComponent } from '../modules/docx/preview/preview.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor( private dialog: MatDialog,
  ) { }


  
  openDialog(component:any, enterAnimationDuration: string, exitAnimationDuration: string, data?: any){
    this.dialog.open(component, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: data
    });
  }


  openCreateWorldDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createWorldDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openUpdateTimelineDialog(t: Timeline, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(UpdateTimelineDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: t
    });
  }
  openDeleteTimelineDialog(t: {timeline: Timeline, timelines: Timeline[], chapters:Chapter[]  }, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(deleteTimelineDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: t
    });
  }
  openUpdateEventDialog(t: Event, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(UpdateEventDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: t
    });
  }
  opencreateEventsDialog(worldId:String, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createEventsDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: worldId
    });
  }
  openCreateStoryline(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createStorylineDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openCreateStorylineDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(UpdateTimelineDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openCreateTimelineDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createTimelineDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openSubwaySettingsDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(SettingsDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openCreateEventsDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(UpdateTimelineDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  openCreatePaperDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createPaperDialogComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openGroupConnectionDialog(cnn: Connection, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(updateConnectionDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: cnn
    });
  }
  openCreateGroupConnectionDialog( enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createGroupConnectionDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration
    });
  }
  openUpdateGroupConnectionDialog(gc: GroupConnection, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(updateGroupConnectionDialogComponent, {
      width: '550px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: gc
    });
  }
  openUpdateChapterDialog(enterAnimationDuration: string, exitAnimationDuration: string, chapterId: string): void {
    this.dialog.open(UpdateChapterDialogComponent, {
      width: '550px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {chapterId: chapterId}
    });
  }
  openUpdatePaperrDialog(enterAnimationDuration: string, exitAnimationDuration: string, papperId: string): void {
    this.dialog.open(UpdatePaperDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {papperId: papperId}
    });
  }
  openDataPickerDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(DataPickerDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openCreateChapterDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createChapterDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  openChapterDescription(data:Chapter | paper | StoryLine | GroupConnection , enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(chapteDescriptionDialogComponent, {
      width: '500px',
      enterAnimationDuration,
      exitAnimationDuration,
      data:data
    });
  }
  openStorylineEditDialog(data: StoryLine, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(strEditDialogComponent, {
      width: '500px',
      enterAnimationDuration,
      exitAnimationDuration,
      data:data
    });
  }
  openPreview(data:Chapter | chapterBasicInfo, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(PreviewComponent, {
      width: '60%',
      minWidth: "450px",
      maxWidth: "1200px",
      enterAnimationDuration,
      exitAnimationDuration,
      data:{id: data.id, name: data.name}
    });
  }




}
