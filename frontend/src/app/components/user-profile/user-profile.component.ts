import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

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
  friends: any[] = [];
  selectedTab: string = 'comments';
  showPhotoMenu: boolean = false;

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadComments();
    this.loadFriends();
  }

  // Cargar perfil y comentarios del usuario
  loadUserProfile(): void {
    const user = this.authService.getUser();
    const token = sessionStorage.getItem('token');

    if (user && token) {
      this.userName = user.name;
      this.profilePhoto = user.profile_photo
        ? 'http://localhost:8000/' + user.profile_photo
        : 'assets/img/Perfil_Inicial.jpg';

      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      this.http.get<any>(`http://localhost:8000/api/user/${user.id}/profile`, { headers })
        .subscribe(response => {
          this.comments = response.comments;
        });
    }
  }

  loadComments(): void {
    const user = this.authService.getUser();
    const token = sessionStorage.getItem('token');
  
    if (!user || !token) return;
  
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  
    this.http.get<any[]>(`http://localhost:8000/api/profile-comments/${user.id}`, { headers })
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
  
    this.http.post('http://localhost:8000/api/profile-comments', body, { headers })
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

  loadFriends(): void {
    const token = sessionStorage.getItem('token');
    const user = this.authService.getUser();

    if (user && token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      this.http.get<any>('http://localhost:8000/api/friends', { headers })
        .subscribe(response => {
          this.friends = response;
        });
    }
  }

  getFriendPhoto(friend: any): string {
    return friend.profile_photo
      ? `http://localhost:8000/${friend.profile_photo}`
      : 'assets/img/Perfil_Inicial.jpg';
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
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

    this.http.post<any>('http://localhost:8000/api/profile/upload-photo', formData, { headers })
      .subscribe(response => {
        if (response.profile_photo) {
          this.profilePhoto = 'http://localhost:8000/' + response.profile_photo;

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

    this.http.delete<any>('http://localhost:8000/api/profile/delete-photo', { headers })
      .subscribe(response => {
        if (response.profile_photo) {
          this.profilePhoto = 'http://localhost:8000/' + response.profile_photo;

          const user = this.authService.getUser();
          user.profile_photo = response.profile_photo;
          sessionStorage.setItem('user', JSON.stringify(user));
        }
      });
  }

  // Botón para volver atrás
  goBack(): void {
    window.history.back();
  }
}
