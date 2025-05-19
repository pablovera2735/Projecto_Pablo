import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  users: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/movies']);
    } else {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>('http://localhost:8000/api/admin/users', { headers })
      .subscribe({
        next: (data) => this.users = data,
        error: (err) => console.error('Error cargando usuarios', err)
      });
  }


  promoteToAdmin(userId: number): void {
  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.put(`http://localhost:8000/api/admin/users/${userId}/make-admin`, {}, { headers })
    .subscribe({
      next: () => {
        alert('Usuario promovido a administrador');
        this.loadUsers();
      },
      error: (err) => console.error('Error promoviendo usuario', err)
    });
}

  deleteUser(userId: number): void {
    if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.delete(`http://localhost:8000/api/admin/users/${userId}`, { headers })
      .subscribe({
        next: () => {
          alert('Usuario eliminado');
          this.loadUsers(); // Recargar lista
        },
        error: (err) => console.error('Error eliminando usuario', err)
      });
  }
}
