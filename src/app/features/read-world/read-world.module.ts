import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadWorldComponent } from './read-world.component';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { PaperCardComponent } from './paper-card/paper-card.component';
import { TopPanelComponent } from './top-panel/top-panel.component';

import { BottomSheetService } from './bottom-sheet.service';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
import { ChapterDetailsComponent } from './dialog/chapter-details/chapter-details.component';

import { RwHeroComponent } from './sections/rw-hero/rw-hero.component';
import { RwBoardComponent } from './sections/rw-board/rw-board.component';
import { RwChapterMenuComponent } from './sections/rw-chapter-menu/rw-chapter-menu.component';
import { RwGroupMenuComponent } from './sections/rw-group-menu/rw-group-menu.component';
import { RwFavoritesComponent } from './sections/rw-favorites/rw-favorites.component';
import { RwBooksComponent } from './sections/rw-books/rw-books.component';
import { RwNotesComponent } from './sections/rw-notes/rw-notes.component';

const routes: Routes = [{ path: '', component: ReadWorldComponent }];

@NgModule({
  declarations: [
    ReadWorldComponent,
    BottomSheetComponent,
    ChapterDetailsComponent,
  ],
  providers: [BottomSheetService],
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    PaperCardComponent,
    TopPanelComponent,
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
    RwHeroComponent,
    RwBoardComponent,
    RwChapterMenuComponent,
    RwGroupMenuComponent,
    RwFavoritesComponent,
    RwBooksComponent,
    RwNotesComponent,
    RouterModule.forChild(routes),
  ],
})
export class ReadWorldModule { }
