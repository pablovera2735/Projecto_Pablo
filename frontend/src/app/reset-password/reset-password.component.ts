import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  code = '';
  newPassword = '';
  newPasswordConfirmation = '';
  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  resetPassword(): void {
    this.clearMessages();
    this.loading = true;

    const data = {
      email: this.email,
      code: this.code,
      new_password: this.newPassword,
      new_password_confirmation: this.newPasswordConfirmation
    };

    this.authService.resetPasswordWithCode(data).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Contraseña actualizada correctamente';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al actualizar la contraseña';
      }
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  clearMessage(type: 'success' | 'error'): void {
    if (type === 'success') this.successMessage = '';
    if (type === 'error') this.errorMessage = '';
  }
}
