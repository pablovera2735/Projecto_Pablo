import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActorService {
  private apiUrl = 'https://filmania.ddns.net:8000/api'; // Cambia esto si tu backend está en otra ruta

  constructor(private http: HttpClient) {}

  // Obtener actores, actrices, directores etc populares
  getPopularPeople(page: number = 1): Observable<any> {
    return this.http.get<any>(`https://filmania.ddns.net:8000/api/people/popular?page=${page}`);
  }
  

  // Obtener detalles de un actor específico
  getActorById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/actors/${id}`);
  }

   getPersonDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/people/${id}`);
  }

  // Obtener créditos (películas o series) de una persona por ID
  getPersonCredits(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/people/${id}/credits`);
  }
}
