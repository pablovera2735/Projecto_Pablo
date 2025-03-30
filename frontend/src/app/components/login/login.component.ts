import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        alert('Inicio de sesión exitoso');
        this.router.navigate(['/home']);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Credenciales incorrectas';
        this.loading = false;
      }
    });
  }
}
