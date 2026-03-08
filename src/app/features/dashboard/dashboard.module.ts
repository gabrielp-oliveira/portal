import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { LoadingComponent } from '../../shared/loading/loading.component';

import { DashboardDataService } from './dashboard.data.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HighlightPipe } from './highlight.pipe';
import { CloudinaryPipe } from './pipes/cloudinary.pipe';
import { ProgressPipe } from './pipes/progress.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { StatsStripComponent } from './components/stats-strip/stats-strip.component';
import { PanelShellComponent } from './components/panel-shell/panel-shell.component';

const routes: Routes = [{ path: '', component: DashboardComponent }];

@NgModule({
  declarations: [
    DashboardComponent,
    HighlightPipe,
    ProgressPipe,
    TimeAgoPipe,
    StatsStripComponent,
    PanelShellComponent,
  ],
  providers: [
    DashboardDataService,
    Title,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    LoadingComponent,
    CloudinaryPipe,
    RouterModule.forChild(routes),
  ]
})
export class DashboardModule {}
