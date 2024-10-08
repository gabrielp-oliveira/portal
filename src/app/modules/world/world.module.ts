import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WorldComponent } from './world/world.component';
import { ReactiveFormsModule } from '@angular/forms';
import { dialogModule } from '../../dialog/dialog.module';
import { SubwayComponent } from './subway/subway.component';
import { SubwayService } from './subway.service';
import { LoadingService } from '../loading.service';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
const routes: Routes = [
  {
    path: '',
    component: WorldComponent
  }
];

@NgModule({
  declarations: [WorldComponent, SubwayComponent],
  imports: [
    CommonModule,
    dialogModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatButtonModule,
    RouterModule.forChild(routes)
  ],
  providers: [SubwayService, LoadingService]
})
export class worldModule { }
