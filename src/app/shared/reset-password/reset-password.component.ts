import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private auth  = inject(AuthService);
  private route = inject(ActivatedRoute);

  private token: string | null = null;

  form = new FormGroup({
    password:        new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: this.passwordsMatch });

  loading = false;
  done = false;
  invalidToken = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) this.invalidToken = true;
  }

  private passwordsMatch(g: any): { mismatch: true } | null {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  submit(): void {
    if (this.form.invalid || !this.token) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = null;

    this.auth.resetPassword(this.token, this.form.value.password!).subscribe({
      next: () => { this.loading = false; this.done = true; },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.error ?? err.error?.message ?? 'Something went wrong. Please try again.';
      }
    });
  }

  get pw()  { return this.form.get('password')!; }
  get cpw() { return this.form.get('confirmPassword')!; }
}
