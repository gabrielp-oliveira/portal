import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit {

  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  signUpForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(5)]),
  });

  errorMessage: string | null = null;
  loading = false;

  ngOnInit(): void {
    // Captura ?error= redirecionado pelo guard após falha de OAuth
    const oauthError = this.route.snapshot.queryParamMap.get('error');
    if (oauthError) {
      this.errorMessage = `Sign-in failed: ${oauthError}`;
    }
  }

  googleLogin() {
    this.authService.googleLogin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  microsoftLogin() {
    this.authService.microsoftLogin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.errorMessage = null;
      this.loading = true;
      this.authService.login(this.signUpForm.value)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => { this.loading = false; },
          error: err => {
            this.loading = false;
            if (err.status === 401) {
              const msg: string = err.error?.error ?? err.error?.message ?? '';
              if (msg.toLowerCase().includes('validate your email')) {
                this.errorMessage = 'Please verify your email before signing in.';
              } else {
                this.errorMessage = 'Invalid email or password.';
              }
            } else {
              this.errorMessage = 'Something went wrong. Please try again.';
            }
          }
        });
    }
  }
}
