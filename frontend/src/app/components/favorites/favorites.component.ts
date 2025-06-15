import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  userFavorites: Movie[] = [];
  customLists: { name: string, movies: Movie[] }[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadFavorites();
    this.loadCustomLists();
  }

  loadFavorites(): void {
    const userId = this.authService.getUser()?.id;
    this.http.get<any>(`http://filmania.ddns.net:8000/api/users/${userId}/favorites`)
      .subscribe(res => {
        this.userFavorites = res.favorites;
      });
  }

  loadCustomLists(): void {
    const userId = this.authService.getUser()?.id;
    this.http.get<any>(`http://filmania.ddns.net:8000/api/users/${userId}/lists`)
      .subscribe(res => {
        this.customLists = res.lists;
      });
  }
}
