import { Component, OnInit } from '@angular/core';
import { ActorService } from '../../services/actor.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../services/notification.service';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';

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
  notifications: any[] = [];
  searchTermActor: string = '';
  filteredActors: Actor[] = [];
  showDropdown: boolean = false;
  mobileMenuOpen: boolean = false;
  popularAuthors: Actor[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  currentPage: number = 1;
  totalPages: number = 1;
  showBackToTop: boolean = false;

  private searchActorSubject = new Subject<string>();

  constructor(
    private actorService: ActorService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.setUserName();
    this.loadPopularAuthors();
    window.addEventListener('scroll', this.onScroll);

    this.searchActorSubject.pipe(
  debounceTime(500), // Espera más tiempo antes de lanzar la petición
  distinctUntilChanged(),
  switchMap(term => {
    const cleanTerm = term.trim();
    if (cleanTerm.length < 3) return of([]); // No buscar si hay menos de 3 letras
    return this.searchActors(cleanTerm);
  })
).subscribe({
  next: (actors) => {
    this.filteredActors = this.removeDuplicateActors(actors);
  },
  error: () => {
    this.filteredActors = [];
  }
});
  }

  // Emitir búsqueda al escribir
  filterActorsByName(): void {
    this.searchActorSubject.next(this.searchTermActor.trim());
  }

  // Método con petición HTTP
  private searchActors(term: string) {
    if (term.length < 2) {
      return of([]);
    }

    return this.http.get<any>(`https://filmania.ddns.net:8000/api/people/search?q=${encodeURIComponent(term)}`).pipe(
      map(response => response.results || []),
      catchError(() => of([]))
    );
  }

  removeDuplicateActors(actors: Actor[]): Actor[] {
    const seen = new Set();
    return actors.filter(actor => {
      if (seen.has(actor.id)) return false;
      seen.add(actor.id);
      return true;
    });
  }

  loadPopularAuthors(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.currentPage = page;

    this.actorService.getPopularPeople(page).subscribe({
      next: (response) => {
        this.popularAuthors = response.people;
        this.totalPages = response.total_pages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar actores populares:', err);
        this.errorMessage = 'No se pudieron cargar los actores. Por favor, inténtalo más tarde.';
        this.isLoading = false;
      }
    });
  }

  onScroll = (): void => {
    this.showBackToTop = window.scrollY > 300;
  };

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  getImageUrl(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w300${path}` : 'assets/img/no-image.png';
  }

  getKnownDepartment(person: any): string {
    const dept = person.known_for_department?.toLowerCase();
    switch (dept) {
      case 'acting': return 'Actor/Actriz';
      case 'directing': return 'Director/a';
      case 'writing': return 'Guionista';
      case 'production': return 'Productor/a';
      case 'camera': return 'Camarógrafo/a';
      case 'editing': return 'Editor/a';
      case 'art': return 'Director/a de arte';
      case 'sound': return 'Diseñador/a de sonido';
      default: return 'Desconocido';
    }
  }

  onSearchChange(): void {
    if (this.searchTerm.length < 2) {
      this.suggestions = [];
      return;
    }

    this.http.get<any>(`https://filmania.ddns.net:8000/api/movies/search?q=${this.searchTerm}`)
      .subscribe(response => {
        this.suggestions = response.results.slice(0, 8);
      });

    this.closeMobileMenu();
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
        ? `https://filmania.ddns.net:8000/${user.profile_photo}`
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

  logout(): void {
    this.authService.logout().subscribe(() => {
      sessionStorage.clear();
      window.location.reload();
    });
  }

  goToPage(page: number, event: Event): void {
    event.preventDefault();
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.loadPopularAuthors(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getLimitedPagesArray(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(this.currentPage - half, 1);
    let end = start + maxVisible - 1;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}

