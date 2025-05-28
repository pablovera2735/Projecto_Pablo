import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;
  showResend: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.errorMessage = '';
    this.successMessage = '';
    this.showResend = false;

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;

    this.authService.register(this.name, this.email, this.password, this.confirmPassword).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Cuenta creada correctamente. Revisa tu correo para verificar tu cuenta.';
        this.showResend = true;

        // Opcional: redirigir al login después de unos segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 4000);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = error.error.message || 'Error al crear la cuenta';
      }
    });
  }

  resendVerification() {
    this.errorMessage = '';
    this.successMessage = '';
    this.authService.resendVerification().subscribe({
      next: () => {
        this.successMessage = 'Correo de verificación reenviado correctamente.';
      },
      error: () => {
        this.errorMessage = 'Error al reenviar el correo de verificación.';
      }
    });
  }
}
