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

  loadUsers(): void {
    this.http.get<User[]>('http://localhost:8000/api/admin/users', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => this.users = data,
      error: (err) => {
        alert('Error cargando usuarios');
        console.error(err);
      }
    });
  }


  revokeAdmin(userId: number): void {
  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.put(`http://localhost:8000/api/admin/users/${userId}/revoke-admin`, {}, { headers })
    .subscribe({
      next: () => {
        alert('Rol de admin revocado');
        this.loadUsers();
      },
      error: (err) => {
        alert(err.error.message || 'Error revocando rol de admin');
        console.error('Error revocando admin', err);
      }
    });
}

  blockUserForum(userId: number): void {
    const duration = 60; // minutos
    this.http.put(
      `http://localhost:8000/api/admin/users/${userId}/block-forum`,
      { duration },
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        alert('Usuario bloqueado del foro');
        this.loadUsers();
      },
      error: (err) => {
        alert('Error bloqueando usuario');
        console.error(err);
      }
    });
  }

  unblockUserForum(userId: number): void {
    this.http.put(
      `http://localhost:8000/api/admin/users/${userId}/unblock-forum`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        alert('Usuario desbloqueado del foro');
        this.loadUsers();
      },
      error: (err) => {
        alert('Error desbloqueando usuario');
        console.error(err);
      }
    });
  }


  blockUserReview(userId: number): void {
    const duration = 60; // minutos
    this.http.put(
      `http://localhost:8000/api/admin/users/${userId}/block-reviews`,
      { duration },
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        alert('Usuario bloqueado para reseñas');
        this.loadUsers();
      },
      error: (err) => {
        alert('Error bloqueando usuario');
        console.error(err);
      }
    });
  }

  unblockUserReview(userId: number): void {
    this.http.put(
      `http://localhost:8000/api/admin/users/${userId}/unblock-reviews`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        alert('Usuario desbloqueado para reseñas');
        this.loadUsers();
      },
      error: (err) => {
        alert('Error desbloqueando usuario');
        console.error(err);
      }
    });
  }

  promoteToAdmin(userId: number): void {
    this.http.put(
      `http://localhost:8000/api/admin/users/${userId}/make-admin`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        alert('Usuario promovido a administrador');
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
      `http://localhost:8000/api/admin/users/${userId}`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        alert('Usuario eliminado');
        this.loadUsers();
      },
      error: (err) => {
        alert('Error eliminando usuario');
        console.error(err);
      }
    });
  }
}
