import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DocxComponent } from './docx/docx.component';
import { RouterModule, Routes } from '@angular/router';
import { SafeUrlPipe } from '../../safe-url.pipe';


const routes: Routes = [
  {
    path: '',
    component: DocxComponent
  }
];
@NgModule({
  declarations: [DocxComponent, SafeUrlPipe],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes)

  ]
})
export class DocxModule { }
