import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
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
  updateGroupConnectionDialogComponent,
  InfoDialogComponent,
  deleteChapterDialogComponent,
  deleteGroupConnectionDialogComponent,
  MY_DATE_FORMATS
} from './components/dialog.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PaperInfoComponent } from '../standAlone/info/paper-info/paper-info.component';
import { ChapterInfoComponent } from '../standAlone/info/chapter-info/chapter-info.component';
import { ConnectionGroupInfoComponent } from '../standAlone/info/connectionGroup-info/connectionGroup-info.component';
import { StorylineInfoComponent } from '../standAlone/info/storyline-info/storyline-info.component';
import { EventInfoComponent } from '../standAlone/info/event-info/event-info.component';
import { TimelineInfoComponent } from '../standAlone/info/timeline-info/timeline-info.component';
import {MatTabsModule} from '@angular/material/tabs';
import { TxtEditorComponent } from "../standAlone/txt-editor/txt-editor.component";
import { LoadingComponent } from '../standAlone/loading/loading.component';

import { provideNativeDateAdapter } from '@angular/material/core';






@NgModule({
  declarations: [createPaperDialogComponent, createChapterDialogComponent, createWorldDialogComponent,
    UpdateChapterDialogComponent, UpdatePaperDialogComponent,
    UpdateTimelineDialogComponent, createTimelineDialogComponent, createEventsDialogComponent,
    createStorylineDialogComponent, deleteTimelineDialogComponent, chapteDescriptionDialogComponent,
    strEditDialogComponent, UpdateEventDialogComponent, 
    InfoDialogComponent,deleteChapterDialogComponent,deleteGroupConnectionDialogComponent,
    updateConnectionDialogComponent, createGroupConnectionDialogComponent, updateGroupConnectionDialogComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter }, // Fornece o DateAdapter
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }, // Configura o formato de data
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    LoadingComponent,
    ReactiveFormsModule,
    MatCardModule,
    PaperInfoComponent, ChapterInfoComponent, ConnectionGroupInfoComponent, StorylineInfoComponent, EventInfoComponent, TimelineInfoComponent,
    MatIconModule,
    DataPickerDialogComponent,
    MatTabsModule,
    JsonPipe,
    MatTooltipModule,
    MatExpansionModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    FontAwesomeModule,
    MatDatepickerModule,
    MatNativeDateModule, // Aqui está o adaptador de data nativo
    MatSliderModule,
    TxtEditorComponent,
]
})
export class dialogModule { }
