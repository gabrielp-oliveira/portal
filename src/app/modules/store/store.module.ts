import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreComponent } from '../../module/store/store/store.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: StoreComponent
  }
];

@NgModule({
  declarations: [StoreComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
    
  ]
})
export class StoreModule { }
