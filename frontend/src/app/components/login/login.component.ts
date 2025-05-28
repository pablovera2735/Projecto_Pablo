import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  logoPath = 'assets/img/logo.png';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        const data = response?.data;

        if (data?.accessToken && data?.user) {
          // ✅ Verificar si el correo ha sido confirmado
          if (!data.user.email_verified_at) {
            this.errorMessage = 'Debes verificar tu correo electrónico antes de iniciar sesión.';
            this.loading = false;
            return;
          }

          // ✅ Guardar datos en sessionStorage
          sessionStorage.setItem('token', data.accessToken);
          sessionStorage.setItem('user', JSON.stringify(data.user));
          this.router.navigate(['/movies']);
        } else {
          this.errorMessage = 'Error al obtener los datos del usuario.';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en la respuesta:', error);
        this.errorMessage = error?.error?.message || 'Credenciales incorrectas';
        this.loading = false;
      }
    });
  }
}
