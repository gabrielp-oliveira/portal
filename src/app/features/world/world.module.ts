import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WorldComponent } from './world/world.component';
import { ReactiveFormsModule } from '@angular/forms';
import { dialogModule } from '../../dialog/dialog.module';
import { SubwayComponent } from './subway/subway.component';
import { SubwayService } from './subway.service';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';

import { MatIconModule } from '@angular/material/icon'; // Importar o módulo de ícones
import { PaperTableComponent } from './tables/paper/paper-table.component';
import { ChapterComponent } from './tables/chapter/chapter.component';
import { MatSortModule } from '@angular/material/sort'; // Importar o módulo de ícones
import { MatPaginatorModule } from '@angular/material/paginator'; // Importar o módulo de ícones

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GroupConnectionComponent } from './tables/group-connection/group-connection.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConnectionGroupInfoComponent } from "../../shared/info/connectionGroup-info/connectionGroup-info.component";
import { ChapterInfoComponent } from "../../shared/info/chapter-info/chapter-info.component";
import { StorylineInfoComponent } from "../../shared/info/storyline-info/storyline-info.component";
import { EventInfoComponent } from '../../shared/info/event-info/event-info.component';
import { PaperInfoComponent } from '../../shared/info/paper-info/paper-info.component';
import { TimelineInfoComponent } from '../../shared/info/timeline-info/timeline-info.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';



const routes: Routes = [
  {
    path: '',
    component: WorldComponent
  }
];

@NgModule({
  declarations: [WorldComponent, SubwayComponent,
     PaperTableComponent, ChapterComponent, GroupConnectionComponent,
     SidenavComponent],
  imports: [
    CommonModule,
    dialogModule,
    LoadingComponent,
    ReactiveFormsModule,
    MatMenuModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDatepickerModule,
    DragDropModule,
    MatTooltipModule,
    FormsModule,
    MatInputModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatListModule,
    MatNativeDateModule,
    JsonPipe,
    MatSidenavModule,
    MatIconModule, // Adicione o módulo de ícones aqui
    PaperInfoComponent, ChapterInfoComponent, ConnectionGroupInfoComponent, StorylineInfoComponent, EventInfoComponent, TimelineInfoComponent,
    RouterModule.forChild(routes),

],
  providers: [SubwayService]
})
export class worldModule { }
