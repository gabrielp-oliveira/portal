import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Componentes do projeto
import { LibraryComponent } from './library/library.component';
import { FooterComponent } from '../read-world/footer/footer.component';
import { HeaderComponent } from '../../standAlone/header/header.component';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // opcional
import { MatIconModule } from '@angular/material/icon'; // opcional se for usar ícones

// Forms
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaperCardComponent } from '../read-world/paper-card/paper-card.component';
import { UniverseCardComponent } from '../store/universe-card/universe-card.component';
import { TruncatePipe } from '../../truncate.pipe';

const routes: Routes = [
  {
    path: '',
    component: LibraryComponent
  }
];

@NgModule({
  declarations: [LibraryComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    FooterComponent,
    TruncatePipe,
    HeaderComponent,
    PaperCardComponent,
    // Angular Material
    MatButtonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    UniverseCardComponent,
    MatPaginatorModule,
    TruncatePipe
]
})
export class LibraryModule { }
