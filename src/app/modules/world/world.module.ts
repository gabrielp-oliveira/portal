import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { createPapperDialogComponent, WorldComponent } from './world/world.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: WorldComponent
  }
];

@NgModule({
  declarations: [WorldComponent, createPapperDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,

    RouterModule.forChild(routes)
  ]
})
export class worldModule { }
