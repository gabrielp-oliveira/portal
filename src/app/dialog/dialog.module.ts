import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { createPapperDialogComponent, createChapterDialogComponent, createWorldDialogComponent } from './components/dialog.component';




@NgModule({
  declarations: [createPapperDialogComponent, createChapterDialogComponent, createWorldDialogComponent],
  providers: [],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule
  ]
})
export class dialogModule { }
