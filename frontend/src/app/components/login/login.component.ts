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
        /*console.log(response);  // Verifica la respuesta */
        if (response && response.data && response.data.accessToken) {
          localStorage.setItem('token', response.data.accessToken);
          alert('Inicio de sesión exitoso');
          this.router.navigate(['/movies']);
        } else {
          console.error('Token no recibido');
          this.errorMessage = 'Error al obtener el token';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en la respuesta:', error);
        this.errorMessage = 'Credenciales incorrectas';
        this.loading = false;
      }
    });
  }
  
}
