import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent {
  newEmail: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private http: HttpClient) {}

  updateEmail(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put('http://localhost:8000/api/profile/update-email', { email: this.newEmail }, { headers })
      .subscribe({
        next: () => alert('Correo actualizado correctamente'),
        error: () => alert('Error al actualizar el correo')
      });
  }

  updatePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      alert('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const passwordData = {
      current_password: this.currentPassword,
      password: this.newPassword,
      password_confirmation: this.confirmPassword
    };

    this.http.put('http://localhost:8000/api/profile/update-password', passwordData, { headers })
      .subscribe({
        next: () => {
          alert('Contraseña actualizada correctamente');
          // Limpiar campos
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },
        error: () => alert('Error al actualizar la contraseña. Verifica la contraseña actual.')
      });
  }
}
