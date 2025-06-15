import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userName: string = '';
  profilePhoto: string = 'assets/img/Perfil_Inicial.jpg';
  comments: any[] = [];
  commentContent: string = '';
  watchedMovies: any[] = [];
  favoriteMovies: any[] = [];
  friends: any[] = [];
  pendingRequests: any[] = [];
  selectedTab: string = 'comments';
  showPhotoMenu: boolean = false;

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id');

      if (userId) {
        this.loadUserProfileById(+userId);
      } else {
        this.loadUserProfile();
      }
    });

    this.loadComments();
    this.loadFavoriteMovies();
    this.loadWatchedMovies();
    this.loadFriends();
  }

  loadUserProfile(): void {
    const user = this.authService.getUser();
    const token = sessionStorage.getItem('token');

    if (user && token) {
      this.userName = user.name;
      this.profilePhoto = user.profile_photo
        ? 'http://filmania.ddns.net:8000/' + user.profile_photo
        : 'http://filmania.ddns.net:8000/Perfil_Inicial.jpg';

      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      this.http.get<any>(`http://filmania.ddns.net:8000/api/user/${user.id}/profile`, { headers })
        .subscribe(response => {
          this.comments = response.comments;
        });
    }
  }

  loadUserProfileById(id: number): void {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://filmania.ddns.net:8000/api/user/${id}/profile`, { headers })
      .subscribe(response => {
        this.userName = response.name;
        this.profilePhoto = response.profile_photo
          ? 'http://filmania.ddns.net:8000/' + response.profile_photo
          : 'http://filmania.ddns.net:8000/Perfil_Inicial.jpg';
        this.comments = response.comments;
        // Puedes cargar otras cosas específicas del usuario aquí
      });
  }

  loadComments(): void {
    const user = this.authService.getUser();
    const token = sessionStorage.getItem('token');
  
    if (!user || !token) return;
  
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  
    this.http.get<any[]>(`http://filmania.ddns.net:8000/api/profile-comments/${user.id}`, { headers })
      .subscribe(response => {
        this.comments = response;
      });
  }

  submitComment(): void {
    const user = this.authService.getUser();
    const token = sessionStorage.getItem('token');
  
    if (!user || !token) return;
  
    if (!this.commentContent.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const body = {
      profile_user_id: user.id,
      content: this.commentContent
    };
  
    this.http.post('http://filmania.ddns.net:8000/api/profile-comments', body, { headers })
      .subscribe({
        next: (res: any) => {
          this.comments.unshift({
            content: this.commentContent,
            created_at: new Date().toISOString()
          });
          this.commentContent = '';
        },
        error: err => {
          console.error('Error al enviar comentario:', err);
          alert('Error al enviar el comentario');
        }
      });
  }

  loadWatchedMovies(): void {
    const user = this.authService.getUser();
    const token = sessionStorage.getItem('token');

    if (!user || !token) {
      console.error('Usuario no autenticado o token faltante');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://filmania.ddns.net:8000/api/watched/${user.id}`, { headers })
      .subscribe({
        next: (response) => {
          this.watchedMovies = response.watchedMovies || [];
        },
        error: (err) => {
          console.error('Error al cargar películas vistas:', err);
          this.watchedMovies = [];
        }
      });
  }

  loadFriends(): void {
    const token = sessionStorage.getItem('token');
    const user = this.authService.getUser();

    if (user && token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      this.http.get<any>('http://filmania.ddns.net:8000/api/friends', { headers })
        .subscribe(response => {
          this.friends = response;
        });
    }
  }

  loadFavoriteMovies(): void {
    const user = this.authService.getUser();
    const token = sessionStorage.getItem('token');

    if (!user || !token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://filmania.ddns.net:8000/api/favorites/${user.id}`, { headers })
      .subscribe(response => {
        this.favoriteMovies = response.favorites || [];
      });
  }

  loadPendingRequests(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>('http://filmania.ddns.net:8000/api/friends/pending', { headers })
      .subscribe({
        next: (response) => {
          this.pendingRequests = response;
        },
        error: (err) => {
          console.error('Error al cargar solicitudes pendientes:', err);
        }
      });
  }

  acceptRequest(senderId: number): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post<any>('http://filmania.ddns.net:8000/api/friends/accept', { sender_id: senderId }, { headers })
      .subscribe(() => {
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== senderId);
        this.loadFriends(); // Refrescar lista de amigos
      });
  }

  rejectRequest(senderId: number): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post<any>('http://filmania.ddns.net:8000/api/friends/reject', { sender_id: senderId }, { headers })
      .subscribe(() => {
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== senderId);
      });
  }

  getFriendPhoto(friend: any): string {
    return friend.profile_photo
      ? `http://filmania.ddns.net:8000/${friend.profile_photo}`
      : 'http://filmania.ddns.net:8000/Perfil_Inicial.jpg';
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;

    if (tab === 'vistas') {
      this.loadWatchedMovies();
    } else if (tab === 'favoritas') {
      this.loadFavoriteMovies();
    } else if (tab === 'pendientes') {
      this.loadPendingRequests();
    }
  }

  togglePhotoMenu(): void {
    this.showPhotoMenu = !this.showPhotoMenu;
  }

  triggerPhotoUpload(): void {
    this.showPhotoMenu = false;
    this.photoInput.nativeElement.click();
  }

  uploadPhoto(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<any>('http://filmania.ddns.net:8000/api/profile/upload-photo', formData, { headers })
      .subscribe(response => {
        if (response.profile_photo) {
          this.profilePhoto = 'http://filmania.ddns.net:8000/' + response.profile_photo;

          const user = this.authService.getUser();
          user.profile_photo = response.profile_photo;
          sessionStorage.setItem('user', JSON.stringify(user));
        }
      });
  }

  deletePhoto(): void {
  this.showPhotoMenu = false;

  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.http.delete<any>('http://filmania.ddns.net:8000/api/profile/delete-photo', { headers })
    .subscribe(() => {
      // Forzamos la imagen predeterminada
      this.profilePhoto = 'http://filmania.ddns.net:8000/Perfil_Inicial.jpg';

      const user = this.authService.getUser();
      user.profile_photo = null;
      sessionStorage.setItem('user', JSON.stringify(user));
    });
}

goToFriendProfile(friendId: number): void {
this.router.navigate(['/user-profile', friendId]);
}

goBack(): void {
this.router.navigate(['/menu']);
}
}