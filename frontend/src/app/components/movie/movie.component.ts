import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Movie {
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
}

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {
  movies: Movie[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getMovies();
  }

  getMovies(): void {
    this.http.get<any>('http://127.0.0.1:8000/api/movies/popular')
      .subscribe(response => {
        console.log(response);
        if (response && Array.isArray(response)) {
          this.movies = response;
        } else if (response && response.movies) {
          this.movies = response.movies;
        }
      });
  }
}