import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ActorService } from '../../services/actor.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.css']
})


export class PersonDetailComponent implements OnInit {

  userName: string = '';
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';
  searchTerm: string = '';
  suggestions: any[] = [];
  showAllSuggestions: boolean = false;
  notifications: any[] = [];
  personId!: number;
  person: any;
  credits: any[] = [];
  isLoading = true;


  showDropdown: boolean = false;
  showBackToTop: boolean = false;
  mobileMenuOpen: boolean = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private actorService: ActorService, private notificationService: NotificationService, private authService: AuthService,) {}

  ngOnInit(): void {
    this.personId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPerson();
    this.setUserName();
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
        : 'http://filmania.ddns.net:8000/Perfil_Inicial.jpg';
    } else {
      this.userName = 'Invitado';
    }
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

  getLimitedPagesArray(currentPage: number, totalPages: number): number[] {
    const pages: number[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }

    return pages;
  }


  loadPerson(): void {
    this.actorService.getPersonDetail(this.personId).subscribe({
      next: (data) => {
        this.person = data;
        this.actorService.getPersonCredits(this.personId).subscribe((creditsRes: any) => {
          this.credits = creditsRes.cast;
          this.isLoading = false;
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getImage(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : 'assets/img/no-image.png';
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
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

  goToDetails(movieId: number): void {
    this.router.navigate(['/movies', movieId, 'detail']);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/movies']);

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

  goBack(): void {
    this.router.navigate(['/personas']);
  }

  private clearSession(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

}
