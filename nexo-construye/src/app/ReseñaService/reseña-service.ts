import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReseñaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Genera los headers con el token de autenticacion para cada peticion
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Crea una nueva resena para un profesional
  crearReseña(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/resenas/crear`, data, {
      headers: this.getHeaders()
    });
  }

  // Obtiene todas las resenas de un profesional por su ID
  getReseñasByProfesional(profesionalId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/resenas/profesional/${profesionalId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtiene una resena por su ID
  getReseñaById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/resenas/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Elimina una resena por su ID
  eliminarReseña(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/resenas/${id}`, {
      headers: this.getHeaders()
    });
  }
}