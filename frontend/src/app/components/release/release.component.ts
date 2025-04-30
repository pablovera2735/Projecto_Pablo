import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-release',
  templateUrl: './release.component.html',
  styleUrls: ['./release.component.css']
})
export class ReleaseComponent implements OnInit {
  userName: string = '';
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';
  searchTerm: string = '';
  suggestions: any[] = [];
  notifications: any[] = [];

  recommendedReleases: any[] = [];
  loading: boolean = true;
  selectedYear: string = '2025';
  selectedMonth: number = 0;
  years: string[] = ['2025', '2026', '2027'];

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getRecommendedReleases();
    this.setUserName();
  }

  setUserName(): void {
    const user = this.authService.getUser();
    if (user && user.name) {
      this.userName = user.name;
      this.profilePhoto = user.profile_photo
        ? 'http://localhost:8000/' + user.profile_photo
        : 'assets/img/Perfil_Inicial.jpg';
    } else {
      this.userName = 'Invitado';
    }
  }

  onSearchChange(): void {
    if (this.searchTerm.length < 2) {
      this.suggestions = [];
      return;
    }

    this.http
      .get<any>(`http://localhost:8000/api/movies/search?q=${this.searchTerm}`)
      .subscribe(response => {
        this.suggestions = response.results.slice(0, 8);
      });
  }

  getItemImage(item: any): string {
    if (item.poster_path || item.profile_path) {
      const path = item.poster_path || item.profile_path;
      return `https://image.tmdb.org/t/p/w92${path}`;
    }
    return 'assets/img/no-image.png';
  }

  goToSearchResults(): void {
    this.router.navigate(['/busqueda'], {
      queryParams: { q: this.searchTerm }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.clearLocalSession();
    this.router.navigate(['/movies']);

    const token = localStorage.getItem('token');
    if (token) {
      this.authService.logout().subscribe({
        next: () => {
          console.log('Logout exitoso en servidor');
        },
        error: err => {
          console.warn('Error en logout del servidor, pero no pasa nada:', err);
        }
      });
    }
  }

  private clearLocalSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getRecommendedReleases(): void {
    this.http.get<any>('http://localhost:8000/api/movies/popular')
      .subscribe(response => {
        this.recommendedReleases = response.movies
        .filter((movie: any) => {
          if (!movie.release_date) return false;
      
          const releaseDate = new Date(movie.release_date);
          const movieYear = releaseDate.getFullYear();
          const movieMonth = releaseDate.getMonth() + 1;
      
          console.log(`${movie.title} - ${movie.release_date} (Año: ${movieYear}, Mes: ${movieMonth})`);
      
          const matchYear = movieYear === parseInt(this.selectedYear);
          const matchMonth = this.selectedMonth === 0 || movieMonth === this.selectedMonth;
      
          return matchYear && matchMonth;
        })
        .slice(0, 12);
      
  
        this.loading = false;
      });
  }
  
  getImage(path: string): string {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : 'assets/img/no-image.png';
  }

  goToDetails(id: number): void {
    this.router.navigate(['/movies', id, 'detail']);
  }

  onFiltersChange(): void {
    this.loading = true;
    this.getRecommendedReleases();
  }
}
