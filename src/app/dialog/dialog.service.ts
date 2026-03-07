import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Chapter, chapterBasicInfo, ChapterDetails, Connection, description, Event, GroupConnection, info, infoDialog, paper, StoryLine, Timeline } from '../models/paperTrailTypes';
import { PreviewComponent } from '../features/docx/preview/preview.component';

import { createPaperDialogComponent } from './components/create-paper-dialog.component';
import { createChapterDialogComponent } from './components/create-chapter-dialog.component';
import { UpdateChapterDialogComponent } from './components/update-chapter-dialog.component';
import { UpdateTimelineDialogComponent } from './components/update-timeline-dialog.component';
import { deleteTimelineDialogComponent } from './components/delete-timeline-dialog.component';
import { deleteGroupConnectionDialogComponent } from './components/delete-group-connection-dialog.component';
import { deleteChapterDialogComponent } from './components/delete-chapter-dialog.component';
import { createTimelineDialogComponent } from './components/create-timeline-dialog.component';
import { SettingsDialogComponent } from './components/settings-dialog.component';
import { createStorylineDialogComponent } from './components/create-storyline-dialog.component';
import { createEventsDialogComponent } from './components/create-events-dialog.component';
import { UpdatePaperDialogComponent } from './components/update-paper-dialog.component';
import { UpdateEventDialogComponent } from './components/update-event-dialog.component';
import { createWorldDialogComponent } from './components/create-world-dialog.component';
import { DataPickerDialogComponent } from './components/data-picker-dialog.component';
import { chapteDescriptionDialogComponent } from './components/chapter-description-dialog.component';
import { updateConnectionDialogComponent } from './components/update-connection-dialog.component';
import { createGroupConnectionDialogComponent } from './components/create-group-connection-dialog.component';
import { updateGroupConnectionDialogComponent } from './components/update-group-connection-dialog.component';
import { strEditDialogComponent } from './components/str-edit-dialog.component';
import { InfoDialogComponent } from './components/info-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  openDialog(component: any, enterAnimationDuration: string, exitAnimationDuration: string, data?: any) {
    this.dialog.open(component, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: data
    });
  }

  openCreateWorldDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createWorldDialogComponent, {
      width: '550px',
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

  openDeleteTimelineDialog(t: { timeline: Timeline, timelines: Timeline[], chapters: Chapter[] }, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(deleteTimelineDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: t
    });
  }

  openDeleteGroupConnection(gc: GroupConnection, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(deleteGroupConnectionDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: gc
    });
  }

  openDeleteChapter(chp: Chapter, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(deleteChapterDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: chp
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

  opencreateEventsDialog(worldId: String, enterAnimationDuration: string, exitAnimationDuration: string): void {
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
      width: '450px',
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

  openCreateGroupConnectionDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
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
      data: { chapterId: chapterId }
    });
  }

  openUpdatePaperDialog(enterAnimationDuration: string, exitAnimationDuration: string, paperId: string): void {
    this.dialog.open(UpdatePaperDialogComponent, {
      width: '450px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { paperId: paperId }
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
      width: '650px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  openChapterDescription(data: description, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(chapteDescriptionDialogComponent, {
      width: '1050px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: data
    });
  }

  openStorylineEditDialog(data: StoryLine, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(strEditDialogComponent, {
      width: '500px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: data
    });
  }

  openPreview(data: Chapter | chapterBasicInfo, enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(PreviewComponent, {
      width: '60%',
      minWidth: '450px',
      maxWidth: '1200px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { id: data.id, name: data.title }
    });
  }

  openInfoDialog(data: infoDialog, top: string = '10px', right: string = '80px'): void {
    this.dialog.open(InfoDialogComponent, {
      width: '400px',
      position: { top, right },
      data
    });
  }
}
