import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent {
  currentEmail: string  = '';
  newEmail: string = '';
  verificationCode: string = '';
  codeRequested: boolean = false;

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadCurrentEmail();
  }

  loadCurrentEmail() {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<{ email: string }>('https://filmania.ddns.net:8000/api/profile', { headers })
      .subscribe({
        next: (data) => this.currentEmail = data.email,
        error: () => alert('Error cargando el correo actual')
      });
  }

  requestEmailChangeCode() {
    if (!this.newEmail) {
      alert('Introduce un nuevo correo válido');
      return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post('https://filmania.ddns.net:8000/api/profile/request-email-change', { email: this.newEmail }, { headers })
      .subscribe({
        next: () => {
          alert('Se ha enviado un código de verificación a tu nuevo correo.');
          this.codeRequested = true;
        },
        error: () => alert('Error al enviar el código de verificación')
      });
  }

  confirmEmailChange() {
    if (!this.verificationCode) {
      alert('Introduce el código de verificación');
      return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post('https://filmania.ddns.net:8000/api/profile/confirm-email-change', { email: this.newEmail, code: this.verificationCode }, { headers })
      .subscribe({
        next: () => {
          alert('Correo actualizado correctamente');
          this.currentEmail = this.newEmail;
          this.newEmail = '';
          this.verificationCode = '';
          this.codeRequested = false;
        },
        error: () => alert('Código inválido o error actualizando el correo')
      });
  }

  updateEmail(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put('https://filmania.ddns.net:8000/api/profile/update-email', { email: this.newEmail }, { headers })
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

    this.http.put('https://filmania.ddns.net:8000/api/profile/update-password', passwordData, { headers })
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


  goBack(): void {
    this.router.navigate(['/menu']);
  }
}
