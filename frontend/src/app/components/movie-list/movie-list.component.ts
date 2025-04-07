import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  genres: Genre[] = [];
  moviesByGenre: { [key: number]: Movie[] } = {};

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    this.http.get<any>('http://127.0.0.1:8000/api/movies/genres')
      .subscribe(res => {
        this.genres = res.genres;
        this.genres.forEach(genre => {
          this.loadMoviesByGenre(genre.id);
        });
      });
  }

  loadMoviesByGenre(genreId: number): void {
    this.http.get<any>(`http://127.0.0.1:8000/api/movies/genre/${genreId}?page=1`)
      .subscribe(res => {
        this.moviesByGenre[genreId] = res.movies;
      });
  }

  goToForum(movieId: number): void {
    this.router.navigate(['/movies', movieId, 'forum']);
  }
}
