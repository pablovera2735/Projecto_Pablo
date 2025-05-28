import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getCsrfToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sanctum/csrf-cookie`, { withCredentials: true });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, { withCredentials: true });
  }

  register(name: string, email: string, password: string, password_confirmation: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password, password_confirmation }, { withCredentials: true });
  }

  resendVerification() {
  return this.http.post('http://localhost:8000/api/email/resend', {});
}

  logout(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${sessionStorage.getItem('token')}`);
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers, withCredentials: true });
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user && user.email === 'admin@mail.com';
  }  

  storeUserData(token: string, user: any) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const userData = sessionStorage.getItem('user');
    if (!userData || userData === '{}') {
      return null;
    }
    return JSON.parse(userData);
  }

  updateUser(data: any) {
    sessionStorage.setItem('user', JSON.stringify(data));
  }

  recoverPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-reset-password`, { email });
  }  

  resetPasswordWithCode(data: {
    email: string;
    code: string;
    new_password: string;
    new_password_confirmation: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }
  
}