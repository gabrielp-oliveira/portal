import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreComponent } from './store/store.component';
import { RouterModule, Routes } from '@angular/router';
import { TopPanelComponent } from './store/topPanel/topPanel.component';
import { BodyStoreComponent } from './store/body-store/body-store.component';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio'; // ✅ Adicionado

// Componentes
import { UniverseCardComponent } from './universe-card/universe-card.component';
import { PaperCardComponent } from './paper-card/paper-card.component';
import { PaperPageComponent } from './paper-page/paper-page.component';
import { UniversePageComponent } from './universe-page/universe-page.component';
import { HeaderComponent } from '../../standAlone/header/header.component';
import { AdsComponent } from '../../standAlone/ads/ads.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BookInfoComponent } from './book-info/book-info.component';
import { BookMetadataComponent } from './book-metadata/book-metadata.component';
import { BookTagsComponent } from './book-tags/book-tags.component';
import { BooksByAuthorComponent } from './books-by-author/books-by-author.component';
import { RecommendedBooksComponent } from './recommended-books/recommended-books.component';
import { StoreWrapperComponent } from './store-wrapper/store-wrapper.component';
import { UniverseCheckoutComponent } from './universe-checkout/universe-checkout.component';
import { BookCheckoutComponent } from './book-checkout/book-checkout.component';

import { AuthGuard } from '../../guards/auth.guard';
import { FooterComponent } from '../read-world/footer/footer.component';
import { TruncatePipe } from "../../truncate.pipe";

const routes: Routes = [
  {
    path: '',
    component: StoreWrapperComponent,
    children: [
      { path: '', component: StoreComponent },
      { path: 'book/:paperId', component: PaperPageComponent },
      { path: 'book/:paperId/checkout', component: BookCheckoutComponent, canActivate: [AuthGuard] },
      { path: 'universe/:id', component: UniversePageComponent },
      { path: 'universe/:id/checkout', component: UniverseCheckoutComponent, canActivate: [AuthGuard] },
    ]
  }
];

@NgModule({
  declarations: [
    StoreComponent,
    UniverseCheckoutComponent,
    BookCheckoutComponent,
    TopPanelComponent,
    BodyStoreComponent,
    PaperCardComponent,
    BookDetailComponent,
    StoreWrapperComponent,
    BookInfoComponent,
    BookTagsComponent,
    BookMetadataComponent,
    BooksByAuthorComponent,
    RecommendedBooksComponent,
    PaperPageComponent,
    UniversePageComponent,
  ],
  imports: [
    FooterComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    UniverseCardComponent,
    MatTooltipModule,
    MatRadioModule, // ✅ Adicionado aqui
    AdsComponent,
    HeaderComponent,
    TruncatePipe
]
})
export class StoreModule {}
