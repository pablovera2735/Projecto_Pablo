import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-movie-forum',
  templateUrl: './movie-forum.component.html',
  styleUrls: ['./movie-forum.component.css']
})
export class MovieForumComponent implements OnInit {

  userName: string = '';
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';
  searchTerm: string = '';
  suggestions: any[] = [];
  notifications: any[] = [];

  currentSlide: number = 0;
  slideInterval: any;
  showDropdown: boolean = false;
  mobileMenuOpen: boolean = false;
  
  movieId!: string;
  movie: any;
  thread: any;
  newComment: string = '';
  loading: boolean = false;

  constructor( private http: HttpClient,
      private authService: AuthService,
      private router: Router,
      private route: ActivatedRoute,
      private notificationService: NotificationService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieId = id;
      this.loadMovieDetails(id);
      this.loadThread(id);
    }

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
        ? 'http://localhost:8000/' + user.profile_photo
        : 'assets/img/Perfil_Inicial.jpg';
    } else {
      this.userName = 'Invitado';
    }
  }

  loadMovieDetails(id: string) {
    this.http.get(`http://localhost:8000/api/movies/${id}`).subscribe((res: any) => {
      this.movie = res.movie_details;
    });
  }

  loadThread(movieId: string) {
    this.http.get(`http://localhost:8000/api/threads/${movieId}`).subscribe((res: any) => {
      // Agregamos propiedad para controlar visibilidad de formulario de respuesta
      res.comments = res.comments.map((comment: any) => ({
        ...comment,
        showReply: false,
        replyText: ''
      }));
      this.thread = res;
    });
  }

  postComment() {
    if (!this.newComment.trim()) return;
    this.loading = true;

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(
      'http://localhost:8000/api/comments',
      {
        thread_id: this.thread.id,
        content: this.newComment,
        parent_id: null
      },
      { headers }
    ).subscribe(() => {
      this.newComment = '';
      this.loading = false;
      this.loadThread(this.movieId);
    }, err => {
      this.loading = false;
      console.error(err);
    });
  }

  toggleReply(comment: any) {
    comment.showReply = !comment.showReply;
    if (!comment.showReply) {
      comment.replyText = '';
    }
  }

  cancelReply(comment: any) {
    comment.showReply = false;
    comment.replyText = '';
  }

  replyTo(parentId: number, text: string) {
    if (!text.trim()) return;

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(
      'http://localhost:8000/api/comments',
      {
        thread_id: this.thread.id,
        content: text,
        parent_id: parentId
      },
      { headers }
    ).subscribe(() => {
      this.loadThread(this.movieId);
    }, err => {
      console.error(err);
    });
  }


  onSearchChange(): void {
    if (this.searchTerm.length < 2) {
      this.suggestions = [];
      return;
    }

    this.http.get<any>(`http://localhost:8000/api/movies/search?q=${this.searchTerm}`)
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