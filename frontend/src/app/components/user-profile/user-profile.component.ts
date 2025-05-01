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
  friends: any[] = [];
  selectedTab: string = 'comments';
  showPhotoMenu: boolean = false;

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadFriends();
  }

  // Cargar perfil y comentarios del usuario
  loadUserProfile(): void {
    const user = this.authService.getUser();
    const token = localStorage.getItem('token');

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

  // Cargar amigos
  loadFriends(): void {
    const token = localStorage.getItem('token');
    const user = this.authService.getUser();

    if (user && token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      this.http.get<any>('http://localhost:8000/api/friends', { headers })
        .subscribe(response => {
          this.friends = response;
        });
    }
  }

  // Obtener imagen del amigo
  getFriendPhoto(friend: any): string {
    return friend.profile_photo
      ? `http://localhost:8000/${friend.profile_photo}`
      : 'assets/img/Perfil_Inicial.jpg';
  }

  // Cambiar de pestaña
  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  // Mostrar/ocultar opciones de la foto
  togglePhotoMenu(): void {
    this.showPhotoMenu = !this.showPhotoMenu;
  }

  // Abrir input para subir nueva foto
  triggerPhotoUpload(): void {
    this.showPhotoMenu = false;
    this.photoInput.nativeElement.click();
  }

  // Subir nueva foto
  uploadPhoto(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<any>('http://localhost:8000/api/profile/upload-photo', formData, { headers })
      .subscribe(response => {
        if (response.profile_photo) {
          this.profilePhoto = 'http://localhost:8000/' + response.profile_photo;

          const user = this.authService.getUser();
          user.profile_photo = response.profile_photo;
          localStorage.setItem('user', JSON.stringify(user));
        }
      });
  }

  // Eliminar foto actual
  deletePhoto(): void {
    this.showPhotoMenu = false;
    /*const confirmDelete = confirm('¿Quieres quitar tu foto de perfil y volver a la predeterminada?');
    if (!confirmDelete) return;*/

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.delete<any>('http://localhost:8000/api/profile/delete-photo', { headers })
      .subscribe(response => {
        if (response.profile_photo) {
          this.profilePhoto = 'http://localhost:8000/' + response.profile_photo;

          const user = this.authService.getUser();
          user.profile_photo = response.profile_photo;
          localStorage.setItem('user', JSON.stringify(user));
        }
      });
  }
}
