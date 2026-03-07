import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

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
import { MY_DATE_FORMATS } from './components/data-picker-dialog.component';

import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PaperInfoComponent } from '../shared/info/paper-info/paper-info.component';
import { ChapterInfoComponent } from '../shared/info/chapter-info/chapter-info.component';
import { ConnectionGroupInfoComponent } from '../shared/info/connectionGroup-info/connectionGroup-info.component';
import { StorylineInfoComponent } from '../shared/info/storyline-info/storyline-info.component';
import { EventInfoComponent } from '../shared/info/event-info/event-info.component';
import { TimelineInfoComponent } from '../shared/info/timeline-info/timeline-info.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TxtEditorComponent } from '../shared/txt-editor/txt-editor.component';
import { LoadingComponent } from '../shared/loading/loading.component';

@NgModule({
  declarations: [
    createPaperDialogComponent,
    createChapterDialogComponent,
    createWorldDialogComponent,
    UpdateChapterDialogComponent,
    UpdatePaperDialogComponent,
    UpdateTimelineDialogComponent,
    createTimelineDialogComponent,
    createEventsDialogComponent,
    createStorylineDialogComponent,
    deleteTimelineDialogComponent,
    chapteDescriptionDialogComponent,
    strEditDialogComponent,
    UpdateEventDialogComponent,
    InfoDialogComponent,
    deleteChapterDialogComponent,
    deleteGroupConnectionDialogComponent,
    updateConnectionDialogComponent,
    createGroupConnectionDialogComponent,
    updateGroupConnectionDialogComponent,
    SettingsDialogComponent,
  ],
  exports: [
    SettingsDialogComponent,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    LoadingComponent,
    ReactiveFormsModule,
    MatCardModule,
    PaperInfoComponent, ChapterInfoComponent, ConnectionGroupInfoComponent,
    StorylineInfoComponent, EventInfoComponent, TimelineInfoComponent,
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
    MatNativeDateModule,
    MatSliderModule,
    TxtEditorComponent,
  ]
})
export class dialogModule { }
