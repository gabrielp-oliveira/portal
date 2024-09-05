import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { createPapperDialogComponent, createChapterDialogComponent, createWorldDialogComponent, UpdateChapterDialogComponent, UpdatePapperDialogComponent } from './components/dialog.component';
import { MatSliderModule } from '@angular/material/slider';




@NgModule({
  declarations: [createPapperDialogComponent, createChapterDialogComponent, createWorldDialogComponent,
    UpdateChapterDialogComponent, UpdatePapperDialogComponent
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
