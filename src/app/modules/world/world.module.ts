import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WorldComponent } from './world/world.component';
import { ReactiveFormsModule } from '@angular/forms';
import { dialogModule } from '../../dialog/dialog.module';

const routes: Routes = [
  {
    path: '',
    component: WorldComponent
  }
];

@NgModule({
  declarations: [WorldComponent],
  imports: [
    CommonModule,
    dialogModule,
    ReactiveFormsModule,

    RouterModule.forChild(routes)
  ]
})
export class worldModule { }
