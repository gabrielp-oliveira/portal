import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import {
  createPaperDialogComponent, createChapterDialogComponent, createWorldDialogComponent,
  UpdateChapterDialogComponent, UpdatePaperDialogComponent, UpdateTimelineDialogComponent,
  createTimelineDialogComponent, createEventsDialogComponent, createStorylineDialogComponent,
  deleteTimelineDialogComponent, DataPickerDialogComponent, chapteDescriptionDialogComponent,
  strEditDialogComponent,
  UpdateEventDialogComponent
} from './components/dialog.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';






@NgModule({
  declarations: [createPaperDialogComponent, createChapterDialogComponent, createWorldDialogComponent,
    UpdateChapterDialogComponent, UpdatePaperDialogComponent,
    UpdateTimelineDialogComponent, createTimelineDialogComponent, createEventsDialogComponent,
    createStorylineDialogComponent, deleteTimelineDialogComponent, DataPickerDialogComponent, chapteDescriptionDialogComponent,
    strEditDialogComponent, UpdateEventDialogComponent
  ],
  providers: [],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatCardModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatNativeDateModule, // Aqui está o adaptador de data nativo
    MatSliderModule
  ]
})
export class dialogModule { }
