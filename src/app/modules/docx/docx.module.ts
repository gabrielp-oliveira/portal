import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DocxComponent } from './docx/docx.component';
import { RouterModule, Routes } from '@angular/router';
import { SafeUrlPipe } from '../../safe-url.pipe';
import { PreviewComponent } from './preview/preview.component';
import { MatIconModule } from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';


const routes: Routes = [
  {
    path: '',
    component: DocxComponent
  }
];
@NgModule({
  declarations: [DocxComponent, SafeUrlPipe, PreviewComponent],
  exports: [DocxComponent],
  imports: [
    MatIconModule,
    HttpClientModule,
    CommonModule,
    MatIconModule,
    MatExpansionModule,
    RouterModule.forChild(routes)
  ]
})
export class DocxModule { }
