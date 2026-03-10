import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { WorldComponent } from './world/world.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../read-world/footer/footer.component';
import { CloudinaryPipe } from '../dashboard/pipes/cloudinary.pipe';

const routes: Routes = [
  { path: '', component: WorldComponent }
];

@NgModule({
  declarations: [WorldComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    RouterModule,
    MatIconModule,
    HeaderComponent,
    FooterComponent,
    CloudinaryPipe,
  ]
})
export class WorldModule {}
