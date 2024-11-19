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
  strEditDialogComponent, UpdateEventDialogComponent, SettingsDialogComponent,
  updateConnectionDialogComponent,
  createGroupConnectionDialogComponent,
  updateGroupConnectionDialogComponent
} from './components/dialog.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalComponent } from '../standAlone/modal/modal.component';






@NgModule({
  declarations: [createPaperDialogComponent, createChapterDialogComponent, createWorldDialogComponent,
    UpdateChapterDialogComponent, UpdatePaperDialogComponent,
    UpdateTimelineDialogComponent, createTimelineDialogComponent, createEventsDialogComponent,
    createStorylineDialogComponent, deleteTimelineDialogComponent, DataPickerDialogComponent, chapteDescriptionDialogComponent,
    strEditDialogComponent, UpdateEventDialogComponent, SettingsDialogComponent, ModalComponent,
    updateConnectionDialogComponent, createGroupConnectionDialogComponent, updateGroupConnectionDialogComponent
  ],
  providers: [],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatCardModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    FontAwesomeModule,
    MatDatepickerModule,
    MatNativeDateModule, // Aqui está o adaptador de data nativo
    MatSliderModule
  ]
})
export class dialogModule { }
