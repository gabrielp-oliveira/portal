import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { createPaperDialogComponent, createChapterDialogComponent, createWorldDialogComponent, UpdateChapterDialogComponent, UpdatePaperDialogComponent, UpdateTimelineDialogComponent, createTimelineDialogComponent, createEventsDialogComponent, createStorylineDialogComponent, deleteTimelineDialogComponent } from './components/dialog.component';
import { MatSliderModule } from '@angular/material/slider';




@NgModule({
  declarations: [createPaperDialogComponent, createChapterDialogComponent, createWorldDialogComponent,
    UpdateChapterDialogComponent, UpdatePaperDialogComponent,
     UpdateTimelineDialogComponent, createTimelineDialogComponent, createEventsDialogComponent,
     createStorylineDialogComponent, deleteTimelineDialogComponent
  ],
  providers: [],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatSliderModule
  ]
})
export class dialogModule { }
