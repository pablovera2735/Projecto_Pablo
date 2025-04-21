import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // Obtener lista de amigos del usuario
  getFriends(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/friends/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Agregar amigo
  addFriend(friendId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friends`, { friend_id: friendId }, {
      headers: this.getAuthHeaders()
    });
  }

  // Eliminar amigo
  removeFriend(friendId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/friends/${friendId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
