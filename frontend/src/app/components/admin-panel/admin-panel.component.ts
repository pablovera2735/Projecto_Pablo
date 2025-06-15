import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  forum_blocked: boolean;
  review_blocked: boolean;
  forum_blocked_until?: string;
  review_blocked_until?: string;
}

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  alertMessage: string | null = null;
  alertType: 'success' | 'error' = 'success';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/movies']);
    } else {
      this.loadUsers();
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }


  showAlert(message: string, type: 'success' | 'error' = 'success'): void {
  this.alertMessage = message;
  this.alertType = type;
  setTimeout(() => {
    this.alertMessage = null;
  }, 3000); // Desaparece después de 3 segundos
}

  loadUsers(): void {
    this.http.get<User[]>('http://filmania.ddns.net:8000/api/admin/users', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => this.users = data,
      error: (err) => {
        this.showAlert('Error cargando usuarios');
        console.error(err);
      }
    });
  }


  revokeAdmin(userId: number): void {
  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.put(`http://filmania.ddns.net:8000/api/admin/users/${userId}/revoke-admin`, {}, { headers })
    .subscribe({
      next: () => {
        this.showAlert('Rol de admin revocado');
        this.loadUsers();
      },
      error: (err) => {
        this.showAlert(err.error.message || 'Error revocando rol de admin');
        console.error('Error revocando admin', err);
      }
    });
}

  blockUserForum(userId: number): void {
    const duration = 60; // minutos
    this.http.put(
      `http://filmania.ddns.net:8000/api/admin/users/${userId}/block-forum`,
      { duration },
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.showAlert('Usuario bloqueado del foro');
        this.loadUsers();
      },
      error: (err) => {
        this.showAlert('Error bloqueando usuario');
        console.error(err);
      }
    });
  }

  unblockUserForum(userId: number): void {
    this.http.put(
      `http://filmania.ddns.net:8000/api/admin/users/${userId}/unblock-forum`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.showAlert('Usuario desbloqueado del foro');
        this.loadUsers();
      },
      error: (err) => {
        this.showAlert('Error desbloqueando usuario');
        console.error(err);
      }
    });
  }


  blockUserReview(userId: number): void {
    const duration = 60; // minutos
    this.http.put(
      `http://filmania.ddns.net:8000/api/admin/users/${userId}/block-reviews`,
      { duration },
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.showAlert('Usuario bloqueado para reseñas');
        this.loadUsers();
      },
      error: (err) => {
        this.showAlert('Error bloqueando usuario');
        console.error(err);
      }
    });
  }

  unblockUserReview(userId: number): void {
    this.http.put(
      `http://filmania.ddns.net:8000/api/admin/users/${userId}/unblock-reviews`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.showAlert('Usuario desbloqueado para reseñas');
        this.loadUsers();
      },
      error: (err) => {
        this.showAlert('Error desbloqueando usuario');
        console.error(err);
      }
    });
  }

  promoteToAdmin(userId: number): void {
    this.http.put(
      `http://filmania.ddns.net:8000/api/admin/users/${userId}/make-admin`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.showAlert('Usuario promovido a administrador');
        this.loadUsers();
      },
      error: (err) => {
        alert('Error promoviendo usuario');
        console.error(err);
      }
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;

    this.http.delete(
      `http://filmania.ddns.net:8000/api/admin/users/${userId}`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.showAlert('Usuario eliminado');
        this.loadUsers();
      },
      error: (err) => {
        this.showAlert('Error eliminando usuario');
        console.error(err);
      }
    });
  }

  goBackToMenu(): void {
  this.router.navigate(['/menu']);
}
}
