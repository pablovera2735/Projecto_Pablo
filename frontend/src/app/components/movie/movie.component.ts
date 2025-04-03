import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Movie {
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
}

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {
  movies: Movie[] = [];
  userName: string = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.getMovies();
    this.checkAuth();
  }

  getMovies(): void {
    this.http.get<any>('http://127.0.0.1:8000/api/movies/popular')
      .subscribe(response => {
        console.log(response);
        if (response && Array.isArray(response)) {
          this.movies = response;
        } else if (response && response.movies) {
          this.movies = response.movies;
        }
      });
  }


checkAuth(): void {
  if (this.authService.isLoggedIn()) {
    const user = this.authService.getUser(); // Recuperamos el nombre del usuario desde el AuthService
    this.userName = user.name || 'Usuario'; // Asignamos el nombre
  }
}

logout(): void {
  this.authService.logout().subscribe(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Has cerrado sesión');
    window.location.reload();  // Recargamos la página para reflejar los cambios
  });
}

isAuthenticated(): boolean {
  return this.authService.isLoggedIn(); // Usamos el servicio de autenticación
}
}