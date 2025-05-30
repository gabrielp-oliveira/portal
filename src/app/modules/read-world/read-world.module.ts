import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadWorldComponent } from './read-world.component';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { TopPanelComponent } from './top-panel/top-panel.component';


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
    TopPanelComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    
  ]
})
export class ReadWorldModule { }
