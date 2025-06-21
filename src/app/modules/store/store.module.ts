import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreComponent } from './store/store.component';
import { RouterModule, Routes } from '@angular/router';
import { HeaderStoreComponent } from './store/header-store/header-store.component';
import { BodyStoreComponent } from './store/body-store/body-store.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UniverseCardComponent } from './universe-card/universe-card.component';
import { PaperCardComponent } from './paper-card/paper-card.component';

const routes: Routes = [
  {
    path: '',
    component: StoreComponent
  }
];

@NgModule({
  declarations: [StoreComponent, HeaderStoreComponent, BodyStoreComponent, UniverseCardComponent,PaperCardComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatTooltipModule
  ]
})
export class StoreModule { }
