import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit {
  movieId!: string;
  movie: any;
  cast: any[] = [];

  reviews: any[] = [];
newReview = { rating: 5, comment: '' };

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.movieId = this.route.snapshot.paramMap.get('id')!;
    this.loadMovie();
    this.loadCast();
  }

  loadMovie() {
    this.http.get<any>(`http://localhost:8000/api/movies/${this.movieId}`).subscribe(res => {
      this.movie = res.movie_details;
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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    const data = {
      movie_id: this.movie.id,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    };
  
    this.http.post('http://localhost:8000/api/reviews', data, { headers }).subscribe(() => {
      this.newReview = { rating: 5, comment: '' };
      this.loadReviews();
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
}
