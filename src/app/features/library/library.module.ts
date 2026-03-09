import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { LibraryComponent } from './library/library.component';
import { FooterComponent } from '../read-world/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { CloudinaryPipe } from '../dashboard/pipes/cloudinary.pipe';

const routes: Routes = [
  { path: '', component: LibraryComponent }
];

@NgModule({
  declarations: [LibraryComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    RouterModule,
    FooterComponent,
    HeaderComponent,
    MatIconModule,
    CloudinaryPipe,
  ]
})
export class LibraryModule {}
