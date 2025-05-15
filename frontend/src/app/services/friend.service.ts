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
    const token = sessionStorage.getItem('token');
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

  // Obtener solicitudes pendientes
  getPendingRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friends/pending`, {
      headers: this.getAuthHeaders()
    });
  }

  // Aceptar solicitud de amistad
  acceptFriendRequest(senderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friends/accept`, { sender_id: senderId }, {
      headers: this.getAuthHeaders()
    });
  }

  // Rechazar solicitud de amistad
  rejectFriendRequest(senderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friends/reject`, { sender_id: senderId }, {
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
