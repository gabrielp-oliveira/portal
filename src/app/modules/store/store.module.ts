import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreComponent } from './store/store.component';
import { RouterModule, Routes } from '@angular/router';
import {  TopPanelComponent  } from './store/topPanel/topPanel.component';
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
import { PaperPageComponent } from './paper-page/paper-page.component';
import { UniversePageComponent } from './universe-page/universe-page.component';
import { HeaderComponent } from '../../standAlone/header/header.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BookInfoComponent } from './book-info/book-info.component';
import { BookMetadataComponent } from './book-metadata/book-metadata.component';
import { BookTagsComponent } from './book-tags/book-tags.component';
import { BooksByAuthorComponent } from './books-by-author/books-by-author.component';
import { RecommendedBooksComponent } from './recommended-books/recommended-books.component';
import { AdsComponent } from '../../standAlone/ads/ads.component';
import { FooterComponent } from '../../standAlone/footer/footer.component';
import { StoreWrapperComponent } from './store-wrapper/store-wrapper.component';


const routes: Routes = [
  {
    path: '',
    component: StoreWrapperComponent,
    children: [
      { path: '', component: StoreComponent },
      { path: 'book/:paperId', component: PaperPageComponent },
      { path: 'universe/:id', component: UniversePageComponent },
    ]
  }
];


@NgModule({
  declarations: [
    StoreComponent,
    TopPanelComponent,
    BodyStoreComponent,
    UniverseCardComponent,
    PaperCardComponent,
    BookDetailComponent,
    StoreWrapperComponent,
    BookInfoComponent,
    BookTagsComponent,
    BookMetadataComponent,
    BooksByAuthorComponent,
    RecommendedBooksComponent,
    PaperPageComponent, // ✅ também precisa ser declarado se não for standalone
    UniversePageComponent
  ],
  imports: [
    FooterComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    RouterModule.forChild(routes),

    // Angular Material
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatTooltipModule,
    AdsComponent,
    HeaderComponent // ✅ aqui está correto!
  ]
})
export class StoreModule { }
