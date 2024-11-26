import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DocxComponent } from './docx/docx.component';
import { RouterModule, Routes } from '@angular/router';
import { SafeUrlPipe } from '../../safe-url.pipe';
import { PreviewComponent } from './preview/preview.component';
import { MatIconModule } from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChapterInfoComponent } from "../../standAlone/info/chapter-info/chapter-info.component";


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
    ChapterInfoComponent,
    MatIconModule,
    HttpClientModule,
    CommonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatDatepickerModule,
    RouterModule.forChild(routes),
]
})
export class DocxModule { }
