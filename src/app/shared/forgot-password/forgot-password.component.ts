import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);

  email = new FormControl('', [Validators.required, Validators.email]);

  loading = false;
  sent = false;
  errorMessage: string | null = null;

  submit(): void {
    if (this.email.invalid) { this.email.markAsTouched(); return; }
    this.loading = true;
    this.errorMessage = null;

    this.auth.forgotPassword(this.email.value!).subscribe({
      next: () => { this.loading = false; this.sent = true; },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.error ?? err.error?.message ?? 'Something went wrong. Please try again.';
      }
    });
  }
}
