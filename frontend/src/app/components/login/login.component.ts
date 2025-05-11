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
  
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        /*console.log(response);*/
        if (response && response.data && response.data.accessToken && response.data.user) {
          sessionStorage.setItem('token', response.data.accessToken); // Cambiado a sessionStorage
          const user = response.data.user;
          sessionStorage.setItem('user', JSON.stringify(user)); // Cambiado a sessionStorage
          this.router.navigate(['/movies']);
        } else {
          console.error('Token o usuario no recibido');
          this.errorMessage = 'Error al obtener los datos';
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
