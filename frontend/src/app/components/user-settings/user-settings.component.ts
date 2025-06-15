import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent {
  currentEmail: string = '';
  newEmail: string = '';
  verificationCode: string = '';
  codeRequested: boolean = false;

  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadCurrentEmail();
  }

  showAlert(message: string, type: 'success' | 'error' = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 4000);
  }

  loadCurrentEmail() {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<{ email: string }>('http://filmania.ddns.net:8000/api/profile', { headers })
      .subscribe({
        next: (data) => this.currentEmail = data.email,
        error: () => this.showAlert('Error cargando el correo actual', 'error')
      });
  }

  requestEmailChangeCode() {
    if (!this.newEmail) {
      alert('Introduce un nuevo correo válido');
      return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post('http://filmania.ddns.net:8000/api/profile/update-email', { email: this.newEmail }, { headers })
      .subscribe({
        next: () => {
          this.showAlert('Se ha enviado un código de verificación a tu nuevo correo.', 'success');
          this.codeRequested = true;
        },
        error: () => this.showAlert('Error al enviar el código de verificación', 'error')
      });
  }

  confirmEmailChange() {
    if (!this.verificationCode) {
      alert('Introduce el código de verificación');
      return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post('http://filmania.ddns.net:8000/api/profile/confirm-email-change', { email: this.newEmail, code: this.verificationCode }, { headers })
      .subscribe({
        next: () => {
          this.showAlert('Correo actualizado correctamente', 'success');
          this.currentEmail = this.newEmail;
          this.newEmail = '';
          this.verificationCode = '';
          this.codeRequested = false;
        },
        error: () => this.showAlert('Código inválido o error actualizando el correo', 'error')
      });
  }

  updatePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.showAlert('La nueva contraseña y su confirmación no coinciden.', 'error');
      return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const passwordData = {
      current_password: this.currentPassword,
      password: this.newPassword,
      password_confirmation: this.confirmPassword
    };

    this.http.put('http://filmania.ddns.net:8000/api/profile/update-password', passwordData, { headers })
      .subscribe({
        next: () => {
          this.showAlert('Contraseña actualizada correctamente', 'success');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },
        error: () => this.showAlert('Error al actualizar la contraseña. Verifica la contraseña actual.', 'error')
      });
  }

  goBack(): void {
    this.router.navigate(['/menu']);
  }
}
