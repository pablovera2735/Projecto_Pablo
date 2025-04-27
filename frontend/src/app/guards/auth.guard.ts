import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      // Usuario ya logueado, redirigimos a movies
      this.router.navigate(['/movies']);
      return false; 
    }
    // Usuario no logueado, dejamos entrar a login
    return true;
  }
}
