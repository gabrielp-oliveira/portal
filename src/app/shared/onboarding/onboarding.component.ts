import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReadingPreferencesWizardComponent } from '../reading-preferences-wizard/reading-preferences-wizard.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReadingPreferencesWizardComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent {
  private router = inject(Router);

  onSaved():   void { this.router.navigate(['/dashboard']); }
  onSkipped(): void { this.router.navigate(['/dashboard']); }
}
