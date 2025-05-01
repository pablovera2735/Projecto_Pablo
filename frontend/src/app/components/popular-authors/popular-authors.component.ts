import { Component, OnInit } from '@angular/core';
import { ActorService } from '../../services/actor.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

interface Actor {
  id: number;
  name: string;
  profile_path: string | null;
  known_for: Array<{
    title?: string;
    name?: string;
    media_type: string;
  }>;
}

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

  popularAuthors: Actor[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private actorService: ActorService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.setUserName();
    this.loadPopularAuthors();
  }

  loadPopularAuthors(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.actorService.getPopularActors().subscribe({
      next: (data: Actor[]) => {
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

  getImageUrl(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w300${path}` : 'assets/img/no-image.png';
  }

  getKnownForTitles(knownFor: Actor['known_for']): string {
    if (!knownFor || knownFor.length === 0) return 'Actor/Actriz';
    
    const titles = knownFor.map(item => {
      return item.media_type === 'movie' ? item.title : item.name;
    }).filter(Boolean);

    return titles.slice(0, 2).join(', ') + (titles.length > 2 ? '...' : '');
  }

  onSearchChange(): void {
    if (this.searchTerm.length < 2) {
      this.suggestions = [];
      return;
    }
  
    this.http.get<any>(`http://localhost:8000/api/movies/search?q=${this.searchTerm}`).subscribe({
      next: (response) => {
        this.suggestions = response.results.slice(0, 8);
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
        ? `http://localhost:8000/${user.profile_photo}`
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