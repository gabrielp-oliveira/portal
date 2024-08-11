import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { createWorldDialogComponent, DashboardComponent } from './dashboard/dashboard.component';
import { ApiService } from '../api.service';
import {MatDialogModule} from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorService } from '../error.service';
import { WorldDataService } from './world-data.service';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
];

@NgModule({
  declarations: [DashboardComponent, createWorldDialogComponent],
  providers: [ApiService, ErrorService, WorldDataService ],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }
