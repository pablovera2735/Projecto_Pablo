import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  recoverPassword() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;
  
    this.authService.recoverPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message || 'Correo de recuperación enviado';
        
        // Redirige tras 2 segundos con el email
        setTimeout(() => {
          this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
        }, 2000);
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
