import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PapperComponent } from './papper/papper.component';

const routes: Routes = [
  {
    path: '',
    component: PapperComponent
  }
];

@NgModule({
  declarations: [PapperComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class PapperModule { }
