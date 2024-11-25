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
  strEditDialogComponent, UpdateEventDialogComponent,
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
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';






@NgModule({
  declarations: [createPaperDialogComponent, createChapterDialogComponent, createWorldDialogComponent,
    UpdateChapterDialogComponent, UpdatePaperDialogComponent,
    UpdateTimelineDialogComponent, createTimelineDialogComponent, createEventsDialogComponent,
    createStorylineDialogComponent, deleteTimelineDialogComponent, DataPickerDialogComponent, chapteDescriptionDialogComponent,
    strEditDialogComponent, UpdateEventDialogComponent, ModalComponent,
    updateConnectionDialogComponent, createGroupConnectionDialogComponent, updateGroupConnectionDialogComponent
  ],
  providers: [],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
  
    MatDialogModule,
    MatButtonModule,
    FontAwesomeModule,
    MatDatepickerModule,
    MatNativeDateModule, // Aqui está o adaptador de data nativo
    MatSliderModule
  ]
})
export class dialogModule { }
