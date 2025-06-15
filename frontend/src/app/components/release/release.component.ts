import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

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
  showDropdown: boolean = false;
  mobileMenuOpen: boolean = false;

  recommendedReleases: any[] = [];
  upcomingReleases: any[] = [];
  loading: boolean = true;
  selectedYear: string = '2025';
  selectedMonth: number = 0;
  years: string[] = ['2025', '2026', '2027'];

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
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
        ? 'http://filmania.ddns.net:8000/' + user.profile_photo
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

    this.http.get<any>(`http://filmania.ddns.net:8000/api/movies/search?q=${this.searchTerm}`)
      .subscribe(response => {
        this.suggestions = response.results.slice(0, 8);
      });

      this.closeMobileMenu();
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

    const token = sessionStorage.getItem('token');
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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  getRecommendedReleases(): void {
  const currentYear = parseInt(this.selectedYear);
  const currentMonth = this.selectedMonth;

  this.loading = true;

  // Obtener películas populares (ya estrenadas)
  this.http.get<any>('http://filmania.ddns.net:8000/api/movies/popular', {
    params: {
      year: this.selectedYear,
      month: this.selectedMonth.toString()
    }
  }).subscribe({
    next: (response) => {
      this.recommendedReleases = (response.movies || []).filter((movie: any) => {
        if (!movie.release_date) return false;

        const releaseDate = new Date(movie.release_date);
        const movieYear = releaseDate.getFullYear();
        const movieMonth = releaseDate.getMonth() + 1;

        const matchYear = movieYear === currentYear;
        const matchMonth = currentMonth === 0 || movieMonth === currentMonth;

        return matchYear && matchMonth;
      }).slice(0, 12);

      this.loading = false;
    },
    error: (err) => {
      console.error('Error al obtener películas recomendadas:', err);
      this.loading = false;
    }
  });

  // Obtener películas próximas a estrenarse
  this.http.get<any>('http://filmania.ddns.net:8000/api/movies/upcoming', {
    params: {
      year: this.selectedYear,
      month: this.selectedMonth.toString()
    }
  }).subscribe({
    next: (response) => {
      this.upcomingReleases = (response.movies || []).slice(0, 12);
    },
    error: (err) => {
      console.error('Error al obtener próximos estrenos:', err);
    }
  });
}
  
  getImage(path: string): string {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : 'assets/img/no-image.png';
  }

  goToDetails(id: number): void {
    this.router.navigate(['/movies', id, 'detail']);
  }

  onFiltersChange(): void {
  this.selectedMonth = Number(this.selectedMonth);
  this.loading = true;
  this.getRecommendedReleases();
}
}
