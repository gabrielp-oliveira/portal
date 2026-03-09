import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LegalLayoutComponent } from './legal-layout.component';

@Component({
  standalone: true,
  selector: 'app-refunds',
  imports: [CommonModule, RouterModule, LegalLayoutComponent],
  templateUrl: './refunds.component.html',
  styleUrl: './refunds.component.scss'
})
export class RefundsComponent {
  isPt = navigator.language.startsWith('pt');
  updated = 'March 2025';
  updatedPt = 'Março de 2025';
}
