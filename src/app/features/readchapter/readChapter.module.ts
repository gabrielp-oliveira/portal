import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadChapterComponent } from './readChapter/readChapter.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: ReadChapterComponent
  }
];
@NgModule({
  declarations: [ReadChapterComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
    
  ]
})
export class ReadChapterModule { }
