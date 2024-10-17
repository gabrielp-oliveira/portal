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

import { MatIconModule } from '@angular/material/icon'; // Importar o módulo de ícones


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
    MatIconModule, // Adicione o módulo de ícones aqui
    RouterModule.forChild(routes)
  ],
  providers: [SubwayService, LoadingService]
})
export class worldModule { }
