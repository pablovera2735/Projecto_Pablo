import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit {
  userName: string = '';
  movieId!: string;
  movie: any;
  trailerUrl: SafeResourceUrl = ''; // Cambiar a SafeResourceUrl
  cast: any[] = [];
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';
  reviews: any[] = [];
  newReview = { rating: 5, comment: '' };
  searchTerm: string = '';
  suggestions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private router: Router // Asegurarse de importar Router
  ) {}

  ngOnInit(): void {
    this.movieId = this.route.snapshot.paramMap.get('id')!;
    this.loadMovie();
    this.loadCast();
    this.loadReviews();
    this.setUserName(); // Asegurarse de establecer el nombre de usuario en ngOnInit
  }

  loadMovie() {
    this.http.get<any>(`http://localhost:8000/api/movies/${this.movieId}`).subscribe(res => {
      this.movie = res.movie_details;
  
      // Verificar si el campo trailer existe
      if (this.movie.trailer) {
        const trailerUrl = this.movie.trailer; // Usamos el campo trailer directamente
        // Sanitizar la URL antes de asignarla
        this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(trailerUrl); // Sanitizar la URL
      } else {
        console.log('No trailer found');
      }
    });
  }

  loadReviews() {
    this.http.get<any>(`http://localhost:8000/api/movies/${this.movieId}/reviews`)
      .subscribe(res => {
        this.reviews = res.reviews;
      });
  }

  loadCast() {
    this.http.get<any>(`http://localhost:8000/api/movies/${this.movieId}/cast`)
      .subscribe(res => {
        this.cast = res.cast;
      });
  }

  submitReview() {
    if (!this.newReview.comment.trim()) return alert('Por favor, escribe un comentario.');
  
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const data = {
      movie_id: this.movie.id,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    };
    
    this.http.post('http://localhost:8000/api/reviews', data, { headers }).subscribe(response => {
      this.newReview = { rating: 5, comment: '' };
      this.loadReviews(); // refresca las reseñas
    });
  }

  addToFavorites() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const data = {
      movie_id: this.movie.id,
      title: this.movie.title,
      poster_path: this.movie.poster_path
    };

    this.http.post('http://localhost:8000/api/favorites', data, { headers })
      .subscribe(() => alert('Película agregada a favoritos'));
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
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
  
    this.http.get<any>(`http://localhost:8000/api/movies/search?q=${this.searchTerm}`)
      .subscribe(response => {
        this.suggestions = response.results.slice(0, 8); // solo los primeros 8
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

  logout(): void {
    this.authService.logout().subscribe(() => {
      localStorage.clear();
      alert('Has cerrado sesión');
      window.location.reload();
    });
  }
}
