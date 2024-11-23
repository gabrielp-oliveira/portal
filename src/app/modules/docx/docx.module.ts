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
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    RouterModule.forChild(routes)
  ]
})
export class DocxModule { }
