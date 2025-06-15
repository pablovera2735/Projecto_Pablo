import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
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
  isPending: boolean = false;  // Nueva variable para estado pendiente

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
        this.loadFriends(); // Carga amigos y checa estado
      }
    });
  }

  checkIfOwnProfile(): void {
    const currentUser = this.authService.getUser();
    this.isOwnProfile = currentUser && currentUser.id === this.userId;
  }

  loadUserProfile(): void {
    const token = sessionStorage.getItem('token');
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
        }
      });
  }

  sendPrivateMessage(): void {
  this.router.navigate(['/messages', this.userId]);
}

  loadComments(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>(`http://filmania.ddns.net:8000/api/profile-comments/${this.userId}`, { headers })
      .subscribe(response => {
        this.comments = response;
      });
  }

  loadFavoriteMovies(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://filmania.ddns.net:8000/api/favorites/${this.userId}`, { headers })
      .subscribe(response => {
        this.favoriteMovies = response.favorites || [];
      });
  }

  loadWatchedMovies(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://filmania.ddns.net:8000/api/watched/${this.userId}`, { headers })
      .subscribe(response => {
        this.watchedMovies = response.watchedMovies || [];
      });
  }

  loadFriends(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Carga lista de amigos confirmados
    this.http.get<any>(`http://filmania.ddns.net:8000/api/friends/${this.userId}`, { headers })
      .subscribe(response => {
        this.friends = response || [];
        this.checkIfFriend();
        this.checkIfPending();
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
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Aquí necesitas un endpoint en tu backend que verifique si hay solicitud pendiente
    this.http.get<any>(
      `http://filmania.ddns.net:8000/api/friend-requests/status?user1=${currentUser.id}&user2=${this.userId}`, 
      { headers }
    ).subscribe(response => {
      this.isPending = response.pending || false;
    }, error => {
      this.isPending = false;
    });
  }

  sendFriendRequest(): void {
    if (this.isOwnProfile || this.isPending || this.isFriend) return;

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const body = { friend_id: this.userId };

    this.http.post('http://filmania.ddns.net:8000/api/friends', body, { headers })
      .subscribe({
        next: () => {
          alert('Solicitud de amistad enviada');
          this.isPending = true;
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
      ? `http://filmania.ddns.net:8000/${friend.profile_photo}`
      : 'http://filmania.ddns.net:8000/Perfil_Inicial.jpg';
  }

  goBack(): void {
    window.history.back();
  }
}
