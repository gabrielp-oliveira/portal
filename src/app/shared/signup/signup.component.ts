import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  signUpForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, this.nameValidator]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  nameValidator(control: FormGroup): { [key: string]: boolean } | null {
    const name = control.value;
    const hasInvalidChars = /[^a-zA-Z\s]/.test(name);
    return hasInvalidChars ? { 'nameInvalid': true } : null;
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.errorMessage = null;
      this.successMessage = null;
      this.loading = true;
      const { confirmPassword, ...body } = this.signUpForm.value;
      this.auth.signUp(body).subscribe({
        next: (res) => {
          this.loading = false;
          this.successMessage = res.message;
          this.signUpForm.reset();
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 401) {
            this.errorMessage = 'This email is already registered. Try signing in.';
          } else if (err.status === 400) {
            this.errorMessage = err.error?.error ?? 'Invalid data. Please check your inputs.';
          } else {
            this.errorMessage = 'Something went wrong. Please try again.';
          }
        }
      });
    }
  }
}
