import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  isPending: boolean = false;

  alertMessage: string = '';
  alertType: 'alert-success' | 'alert-error' = 'alert-success';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = id;
        this.checkIfOwnProfile();
        this.loadUserProfile();
        this.loadComments();
        this.loadFavoriteMovies();
        this.loadWatchedMovies();
        this.loadFriends();
      }
    });
  }

  showAlert(message: string, type: 'success' | 'error' = 'success'): void {
    this.alertMessage = message;
    this.alertType = type === 'success' ? 'alert-success' : 'alert-error';

    setTimeout(() => {
      this.alertMessage = '';
    }, 4000);
  }

  checkIfOwnProfile(): void {
    const currentUser = this.authService.getUser();
    this.isOwnProfile = currentUser && currentUser.id === this.userId;
  }

  loadUserProfile(): void {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://filmania.ddns.net:8000/api/user/${this.userId}/public-profile`, { headers })
      .subscribe({
        next: (response) => {
          this.userName = response.name;
          this.profilePhoto = response.profile_photo
            ? `http://filmania.ddns.net:8000/${response.profile_photo}`
            : 'http://filmania.ddns.net:8000/Perfil_Inicial.jpg';
          this.comments = response.comments || [];
          this.favoriteMovies = response.favorites || [];
          this.friends = response.friends || [];
          this.watchedMovies = response.reviews || [];
        },
        error: (err) => {
          console.error('Error al cargar perfil público:', err);
          this.showAlert('Error al cargar perfil público', 'error');
        }
      });
  }

  sendPrivateMessage(): void {
    this.router.navigate(['/messages', this.userId]);
  }

  loadComments(): void {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>(`http://filmania.ddns.net:8000/api/profile-comments/${this.userId}`, { headers })
      .subscribe({
        next: response => {
          this.comments = response;
        },
        error: err => {
          console.error('Error al cargar comentarios:', err);
          this.showAlert('Error al cargar comentarios', 'error');
        }
      });
  }

  loadFavoriteMovies(): void {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://filmania.ddns.net:8000/api/favorites/${this.userId}`, { headers })
      .subscribe({
        next: response => {
          this.favoriteMovies = response.favorites || [];
        },
        error: err => {
          console.error('Error al cargar favoritas:', err);
          this.showAlert('Error al cargar favoritas', 'error');
        }
      });
  }

  loadWatchedMovies(): void {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://filmania.ddns.net:8000/api/watched/${this.userId}`, { headers })
      .subscribe({
        next: response => {
          this.watchedMovies = response.watchedMovies || [];
        },
        error: err => {
          console.error('Error al cargar películas vistas:', err);
          this.showAlert('Error al cargar películas vistas', 'error');
        }
      });
  }

  loadFriends(): void {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://filmania.ddns.net:8000/api/friends/${this.userId}`, { headers })
      .subscribe({
        next: response => {
          this.friends = response || [];
          this.checkIfFriend();
          this.checkIfPending();
        },
        error: err => {
          console.error('Error al cargar amigos:', err);
          this.showAlert('Error al cargar amigos', 'error');
        }
      });
  }

  checkIfFriend(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.isFriend = false;
      return;
    }
    this.isFriend = this.friends.some(friend => friend.id === currentUser.id);
  }

  checkIfPending(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.isPending = false;
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(
      `http://filmania.ddns.net:8000/api/friend-requests/status?user1=${currentUser.id}&user2=${this.userId}`,
      { headers }
    ).subscribe({
      next: response => {
        this.isPending = response.pending || false;
      },
      error: () => {
        this.isPending = false;
      }
    });
  }

  sendFriendRequest(): void {
    if (this.isOwnProfile || this.isPending || this.isFriend) return;

    const token = sessionStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const body = { friend_id: this.userId };

    this.http.post('http://filmania.ddns.net:8000/api/friends', body, { headers })
      .subscribe({
        next: () => {
          this.showAlert('Solicitud de amistad enviada', 'success');
          this.isPending = true;
        },
        error: () => {
          this.showAlert('Error al enviar solicitud de amistad', 'error');
        }
      });
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;

    switch(tab) {
      case 'favoritas':
        this.loadFavoriteMovies();
        break;
      case 'vistas':
        this.loadWatchedMovies();
        break;
      case 'friends':
        this.loadFriends();
        break;
      case 'comments':
        this.loadComments();
        break;
      default:
        break;
    }
  }

  getFriendPhoto(friend: any): string {
    return friend.profile_photo
      ? `http://filmania.ddns.net:8000/${friend.profile_photo}`
      : 'http://filmania.ddns.net:8000/Perfil_Inicial.jpg';
  }

  goBack(): void {
    window.history.back();
  }
}
