import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.errorMessage = '';
    this.successMessage = '';


    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }


    this.loading = true;

    
    this.authService.register(this.name, this.email, this.password, this.confirmPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Cuenta creada exitosamente';
        alert(this.successMessage);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error.message || 'Error al crear la cuenta';
      }
    });
  }
}
