import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<any[]> {
    const token = sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any[]>(`${this.apiUrl}/notifications`, { headers });
  }

  markAllAsRead(): Observable<any> {
    const token = sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${this.apiUrl}/notifications/mark-all-read`, {}, { headers });
  }
}