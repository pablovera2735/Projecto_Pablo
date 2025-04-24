import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActorService {
  private apiUrl = 'http://localhost:8000/api'; // Cambia esto si tu backend está en otra ruta

  constructor(private http: HttpClient) {}

  // Obtener actores populares
  getPopularActors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/actors/popular`);
  }

  // Obtener detalles de un actor específico
  getActorById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/actors/${id}`);
  }
}
