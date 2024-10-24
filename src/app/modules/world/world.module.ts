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
import {MatTableModule} from '@angular/material/table';

import { MatIconModule } from '@angular/material/icon'; // Importar o módulo de ícones
import { PapperComponent } from './tables/papper/papper.component';
import { ChapterComponent } from './tables/chapter/chapter.component';
import { MatSortModule } from '@angular/material/sort'; // Importar o módulo de ícones
import { MatPaginatorModule } from '@angular/material/paginator'; // Importar o módulo de ícones

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';



const routes: Routes = [
  {
    path: '',
    component: WorldComponent
  }
];

@NgModule({
  declarations: [WorldComponent, SubwayComponent, PapperComponent, ChapterComponent],
  imports: [
    CommonModule,
    dialogModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,

    DragDropModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,

    MatIconModule, // Adicione o módulo de ícones aqui
    RouterModule.forChild(routes)
  ],
  providers: [SubwayService, LoadingService]
})
export class worldModule { }
