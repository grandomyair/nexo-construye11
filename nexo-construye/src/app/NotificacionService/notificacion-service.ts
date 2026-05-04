import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

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

  // Obtiene todas las notificaciones de un usuario
  getNotificaciones(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/notificaciones/usuario/${usuarioId}`,
      { headers: this.getHeaders() }
    );
  }

  // Obtiene el total de notificaciones no leidas de un usuario
  contarNoLeidas(usuarioId: string): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(
      `${this.apiUrl}/notificaciones/usuario/${usuarioId}/count`,
      { headers: this.getHeaders() }
    );
  }

  // Marca todas las notificaciones de un usuario como leidas
  marcarTodasLeidas(usuarioId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/notificaciones/usuario/${usuarioId}/leer`, {},
      { headers: this.getHeaders() }
    );
  }

  // Elimina una notificacion por su ID
  eliminarNotificacion(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/notificaciones/${id}`,
      { headers: this.getHeaders() }
    );
  }
  // elimina todas las notificaciones con un solo click 
  eliminarTodasNotificaciones(usuarioId: string) {
  return this.http.delete(`${this.apiUrl}/notificaciones/todas/${usuarioId}`, { headers: this.getHeaders() });
}
}