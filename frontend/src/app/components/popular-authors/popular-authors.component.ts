import { Component, OnInit } from '@angular/core';
import { ActorService } from '../../services/actor.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';  // Ensure HttpClient is imported

@Component({
  selector: 'app-popular-authors',
  templateUrl: './popular-authors.component.html',
  styleUrls: ['./popular-authors.component.css']
})
export class PopularAuthorsComponent implements OnInit {
  userName: string = '';
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';
  searchTerm: string = '';
  suggestions: any[] = [];

  popularAuthors: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private actorService: ActorService,
    private authService: AuthService,  // Injecting AuthService
    private router: Router,           // Injecting Router
    private http: HttpClient          // Injecting HttpClient for search
  ) {}

  ngOnInit(): void {
    this.setUserName();          // Set the user name and profile photo on component initialization
    this.loadPopularAuthors();   // Load the popular authors
  }

  loadPopularAuthors(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.actorService.getPopularActors().subscribe({
      next: (data) => {
        this.popularAuthors = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar actores populares:', err);
        this.errorMessage = 'No se pudieron cargar los actores. Por favor, inténtalo más tarde.';
        this.isLoading = false;
      }
    });
  }

  getImageUrl(path: string): string {
    return path ? `https://image.tmdb.org/t/p/w300${path}` : 'assets/img/no-image.png';
  }

  onSearchChange(): void {
    if (this.searchTerm.length < 2) {
      this.suggestions = [];
      return;
    }
  
    this.http.get<any>(`http://localhost:8000/api/movies/search?q=${this.searchTerm}`).subscribe({
      next: (response) => {
        this.suggestions = response.results.slice(0, 8); // Limit to the first 8 results
      },
      error: (err) => {
        console.error('Error al buscar sugerencias:', err);
        this.suggestions = [];
      }
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
    this.router.navigate(['/busqueda'], { queryParams: { q: this.searchTerm } });
  }

  setUserName(): void {
    const user = this.authService.getUser();
    if (user && user.name) {
      this.userName = user.name;
      this.profilePhoto = user.profile_photo
        ? `http://localhost:8000/${user.profile_photo}`  // Ensure the base URL is correct
        : 'assets/img/Perfil_Inicial.jpg';
    } else {
      this.userName = 'Invitado';
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      localStorage.clear();
      alert('Has cerrado sesión');
      window.location.reload();
    });
  }
}
