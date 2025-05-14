import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-public-profile',
  templateUrl: './user-public-profile.component.html',
  styleUrls: ['./user-public-profile.component.css']
})
export class UserPublicProfileComponent implements OnInit {
  userId!: string;
  userName: string = '';
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';
  comments: any[] = [];
  favoriteMovies: any[] = [];
  watchedMovies: any[] = [];
  friends: any[] = [];
  selectedTab: string = 'comments';
  isOwnProfile: boolean = false;
  isFriend: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    if (id) {
      this.userId = id;
      this.checkIfOwnProfile();
      this.loadUserProfile(); // Aquí se usa this.userId, no el usuario autenticado
      this.loadComments();
      this.loadFavoriteMovies();
      this.loadWatchedMovies();
      this.loadFriends();
    }
  });
}


  checkIfOwnProfile(): void {
    const currentUser = this.authService.getUser();
    if (currentUser && currentUser.id == this.userId) {
      this.isOwnProfile = true;
    }
  }

 loadUserProfile(): void {
  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.get<any>(`http://localhost:8000/api/user/${this.userId}/public-profile`, { headers })
    .subscribe({
      next: (response) => {
        // ✅ Aquí usamos los datos del usuario visitado, no el autenticado
        this.userName = response.name;
        this.profilePhoto = response.profile_photo
          ? `http://localhost:8000/${response.profile_photo}`
          : 'assets/img/Perfil_Inicial.jpg';

          console.log('Profile photo:', response.profile_photo);
        this.comments = response.comments || [];
        this.favoriteMovies = response.favorites || [];
        this.friends = response.friends || [];
        this.watchedMovies = response.reviews || []; // si `reviews` son películas vistas o relacionadas
      },
      error: (err) => {
        console.error('Error al cargar perfil público:', err);
      }
    });
}





getFullImageUrl(path: string | null): string {
  return path ? `http://localhost:8000/${path}` : 'assets/img/Perfil_Inicial.jpg';
}

  loadComments(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>(`http://localhost:8000/api/profile-comments/${this.userId}`, { headers })
      .subscribe(response => {
        this.comments = response;
      });
  }

  loadFavoriteMovies(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://localhost:8000/api/favorites/${this.userId}`, { headers })
      .subscribe(response => {
        this.favoriteMovies = response.favorites || [];
      });
  }

  loadWatchedMovies(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://localhost:8000/api/watched/${this.userId}`, { headers })
      .subscribe(response => {
        this.watchedMovies = response.watchedMovies || [];
      });
  }

  loadFriends(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://localhost:8000/api/friends/${this.userId}`, { headers })
      .subscribe(response => {
        this.friends = response || [];
      });
  }

  sendFriendRequest(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const body = { friend_id: this.userId };

    this.http.post('http://localhost:8000/api/friends', body, { headers })
      .subscribe({
        next: () => {
          alert('Solicitud de amistad enviada');
        },
        error: () => {
          alert('Error al enviar solicitud de amistad');
        }
      });
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;

    if (tab === 'favoritas') this.loadFavoriteMovies();
    else if (tab === 'vistas') this.loadWatchedMovies();
    else if (tab === 'friends') this.loadFriends();
    else if (tab === 'comments') this.loadComments();
  }

  getFriendPhoto(friend: any): string {
    return friend.profile_photo
      ? `http://localhost:8000/${friend.profile_photo}`
      : 'assets/img/Perfil_Inicial.jpg';
  }

  goBack(): void {
    window.history.back();
  }
}
