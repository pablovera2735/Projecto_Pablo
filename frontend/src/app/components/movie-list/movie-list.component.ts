import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}

interface Genre {
  id: number;
  name: string;
}

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {
  userName: string = '';
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';
  searchTerm: string = '';
  suggestions: any[] = [];
  notifications: any[] = [];
  genres: Genre[] = [];
 forumSearchTerm: string = '';
isSearching: boolean = false;
searchResults: any[] = [];
  moviesByGenre: { [key: number]: Movie[] } = {};

  showDropdown: boolean = false;
  mobileMenuOpen: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    this.setUserName();
    this.loadNotifications();
  }


  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
      },
      error: (err) => {
        console.error('Error al cargar notificaciones:', err);
      }
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleMobileMenu(): void {
  this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
  this.mobileMenuOpen = false;
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.read = true);
    });
  }

  setUserName(): void {
    const user = this.authService.getUser();
    if (user && user.name) {
      this.userName = user.name;
      this.profilePhoto = user.profile_photo
        ? 'http://filmania.ddns.net:8000/' + user.profile_photo
        : 'assets/img/Perfil_Inicial.jpg';
    } else {
      this.userName = 'Invitado';
    }
  }

  goToDetails(movieId: number): void {
    this.router.navigate(['/movies', movieId, 'detail']);
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  loadGenres(): void {
    this.http.get<any>('http://filmania.ddns.net:8000/api/movies/genres')
      .subscribe(res => {
        this.genres = res.genres;
        this.genres.forEach(genre => {
          this.loadMoviesByGenre(genre.id);
        });
      });
  }

  loadMoviesByGenre(genreId: number): void {
    this.http.get<any>(`http://filmania.ddns.net:8000/api/movies/genre/${genreId}?page=1`)
      .subscribe(res => {
        this.moviesByGenre[genreId] = res.movies;
      });
  }


  onSearchChange(): void {
    if (this.searchTerm.length < 2) {
      this.suggestions = [];
      return;
    }

    this.http.get<any>(`http://filmania.ddns.net:8000/api/movies/search?q=${this.searchTerm}`)
      .subscribe(response => {
        this.suggestions = response.results.slice(0, 8);
      });

      this.closeMobileMenu();
  }


onForumSearchChange() {
  const term = this.forumSearchTerm.trim().toLowerCase();
  if (!term) {
    this.isSearching = false;
    this.searchResults = [];
    return;
  }

  const uniqueMoviesMap: { [id: number]: Movie } = {};

  // Busca localmente en foro (catalogo cargado en moviesByGenre)
  for (const genreId in this.moviesByGenre) {
    const movies = this.moviesByGenre[genreId];
    movies.forEach(movie => {
      if (movie.title.toLowerCase().includes(term)) {
        uniqueMoviesMap[movie.id] = movie; // esto evita duplicados porque usa id como key
      }
    });
  }

  this.searchResults = Object.values(uniqueMoviesMap);

  if (this.searchResults.length > 0) {
    this.isSearching = true;
  } else {
    // Si no hay resultados en foro, buscar en backend (API)
    this.http.get<any>(`http://filmania.ddns.net:8000/api/movies/search?q=${term}`)
      .subscribe(response => {
        this.searchResults = response.results;
        this.isSearching = this.searchResults.length > 0;
      }, error => {
        console.error('Error buscando en API:', error);
        this.isSearching = false;
      });
  }
}


goToForumSearchResults(): void {
  this.router.navigate(['/foro'], { queryParams: { q: this.forumSearchTerm } });
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

  goToForum(movieId: number): void {
    this.router.navigate(['/movies', movieId, 'forum']);
  }

  logout(): void {
    this.clearLocalSession();
    this.router.navigate(['/foro']);


    const token = sessionStorage.getItem('token');
    if (token) {
      this.authService.logout().subscribe({
        next: () => {
          console.log('Logout exitoso en servidor');
        },
        error: (err) => {
          console.warn('Error en logout del servidor, pero no pasa nada:', err);
        }
      });
    }
  }
  
  private clearLocalSession(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  } 
}
