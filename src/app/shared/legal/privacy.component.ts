import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LegalLayoutComponent } from './legal-layout.component';

@Component({
  standalone: true,
  selector: 'app-privacy',
  imports: [CommonModule, RouterModule, LegalLayoutComponent],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
  isPt = navigator.language.startsWith('pt');
  updated = 'March 2025';
  updatedPt = 'Março de 2025';
}
