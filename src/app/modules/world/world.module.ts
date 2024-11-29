import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { PapperComponent } from './tables/papper/papper.component';
import { ChapterComponent } from './tables/chapter/chapter.component';
import { MatSortModule } from '@angular/material/sort'; // Importar o módulo de ícones
import { MatPaginatorModule } from '@angular/material/paginator'; // Importar o módulo de ícones

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GooglePickerComponent } from '../../standAlone/google-picker/google-picker.component';
import { GroupConnectionComponent } from './tables/group-connection/group-connection.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SettingsDialogComponent } from '../../dialog/components/dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConnectionGroupInfoComponent } from "../../standAlone/info/connectionGroup-info/connectionGroup-info.component";
import { ChapterInfoComponent } from "../../standAlone/info/chapter-info/chapter-info.component";
import { StorylineInfoComponent } from "../../standAlone/info/storyline-info/storyline-info.component";
import { EventInfoComponent } from '../../standAlone/info/event-info/event-info.component';
import { PaperInfoComponent } from '../../standAlone/info/paper-info/paper-info.component';
import { TimelineInfoComponent } from '../../standAlone/info/timeline-info/timeline-info.component';
import { LoadingComponent } from '../../standAlone/loading/loading.component';



const routes: Routes = [
  {
    path: '',
    component: WorldComponent
  }
];

@NgModule({
  declarations: [WorldComponent, SubwayComponent,
     PapperComponent, ChapterComponent, GroupConnectionComponent, SettingsDialogComponent,
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
    GooglePickerComponent,
    DragDropModule,
    MatTooltipModule,
    FormsModule,
    MatInputModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatListModule,
    MatSidenavModule,
    MatIconModule, // Adicione o módulo de ícones aqui
    PaperInfoComponent, ChapterInfoComponent, ConnectionGroupInfoComponent, StorylineInfoComponent, EventInfoComponent, TimelineInfoComponent,
    RouterModule.forChild(routes),

],
  providers: [SubwayService]
})
export class worldModule { }
