import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LegalLayoutComponent } from './legal-layout.component';

@Component({
  standalone: true,
  selector: 'app-terms',
  imports: [CommonModule, RouterModule, LegalLayoutComponent],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {
  isPt = navigator.language.startsWith('pt');
  updated = 'March 2025';
  updatedPt = 'Março de 2025';
}
