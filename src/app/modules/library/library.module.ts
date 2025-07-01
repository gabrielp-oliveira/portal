import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryComponent } from './library/library.component';
import { RouterModule, Routes } from '@angular/router';
import { FooterComponent } from '../read-world/footer/footer.component';
import { HeaderComponent } from '../../standAlone/header/header.component';




const routes: Routes = [
  {
    path: '',
    component: LibraryComponent
  }
];

@NgModule({
  declarations: [LibraryComponent],
  imports: [
    CommonModule,
    FooterComponent,
    HeaderComponent,
    RouterModule.forChild(routes),
  ]
})
export class LibraryModule { }
