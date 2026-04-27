import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserProfecionalService {

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

  // Crea un nuevo perfil profesional
  crearPerfilProfesional(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profesionales/crear`, data, {
      headers: this.getHeaders()
    });
  }

  // Obtiene todos los perfiles profesionales
  getPerfiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profesionales`, {
      headers: this.getHeaders()
    });
  }

  // Obtiene un perfil profesional por su ID
  getPerfilById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profesionales/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Actualiza los datos de un perfil profesional por su ID
  actualizarPerfil(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profesionales/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  // Elimina un perfil profesional por su ID
  eliminarPerfil(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profesionales/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Obtiene un perfil profesional buscando por correo electronico
  getPerfilByCorreo(correo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profesionales/correo/${correo}`, {
      headers: this.getHeaders()
    });
  }

  // Actualiza el estado del perfil profesional entre activo e inactivo
  actualizarEstadoPerfil(id: string, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/profesionales/${id}/estado`, { estadoPerfil: estado });
  }
}