import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-movie-forum',
  templateUrl: './movie-forum.component.html',
  styleUrls: ['./movie-forum.component.css']
})
export class MovieForumComponent implements OnInit {
  movieId!: string;
  movie: any;
  thread: any;
  newComment: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieId = id;
      this.loadMovieDetails(id);
      this.loadThread(id);
    }
  }

  loadMovieDetails(id: string) {
    this.http.get(`http://localhost:8000/api/movies/${id}`).subscribe((res: any) => {
      this.movie = res.movie_details;
    });
  }

  loadThread(movieId: string) {
    this.http.get(`http://localhost:8000/api/threads/${movieId}`).subscribe((res: any) => {
      this.thread = res;
    });
  }

  postComment() {
    if (!this.newComment.trim()) return;
    this.loading = true;

    const token = localStorage.getItem('token');
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

  replyTo(parentId: number, text: string) {
    if (!text.trim()) return;

    const token = localStorage.getItem('token');
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
}
