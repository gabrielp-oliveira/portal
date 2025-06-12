import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadWorldComponent } from './read-world.component';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { TopPanelComponent } from './top-panel/top-panel.component';
import { BottomSheetService } from './bottom-sheet.service';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { ChapterDetailsComponent } from './dialog/chapter-details/chapter-details.component';
import { PaperCardComponent } from './paper-card/paper-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import { FooterComponent } from './footer/footer.component';




const routes: Routes = [
  {
    path: '',
    component: ReadWorldComponent
  }
];
@NgModule({
  declarations: [
    ReadWorldComponent,
    HeaderComponent,
    TopPanelComponent,
    BottomSheetComponent,
    ChapterDetailsComponent,
    PaperCardComponent,
    FooterComponent
  ],
    providers: [BottomSheetService],
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatMenuModule,
    FormsModule,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatBadgeModule,
    MatTableModule,
    MatCardModule,
    MatDividerModule,
    RouterModule.forChild(routes),

  ]
})
export class ReadWorldModule { }
