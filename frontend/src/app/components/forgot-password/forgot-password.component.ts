import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService) {}

  recoverPassword() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.authService.recoverPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && response.message) {
          this.successMessage = response.message;
        } else {
          this.successMessage = 'Correo de recuperación enviado';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al enviar el correo';
      }
    });
  }
  
  clearMessage(type: string) {
    if (type === 'success') {
      this.successMessage = '';
    } else if (type === 'error') {
      this.errorMessage = '';
    }
  }
}
