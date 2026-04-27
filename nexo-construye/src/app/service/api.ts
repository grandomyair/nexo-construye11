import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Registra un nuevo usuario en el sistema
  registerUser(data: any) {
    return this.http.post(`${this.apiUrl}/users/register`, data);
  }

  // Inicia sesion con correo y contrasena
  loginUser(data: any) {
    return this.http.post(`${this.apiUrl}/users/login`, data);
  }

  // Genera los headers con el token de autenticacion para cada peticion
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtiene todos los usuarios registrados
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, {
      headers: this.getHeaders()
    });
  }

  // Obtiene un usuario por su ID
  getUsuarioById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Actualiza los datos de un usuario por su ID
  updateUsuario(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  // Elimina un usuario por su ID
  deleteUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Verifica si el usuario logueado tiene rol de administrador
  isAdmin(): boolean {
    const usuario = this.getUsuarioActual();
    return usuario && usuario.rol === 'admin';
  }

  // Obtiene el usuario logueado desde el localStorage
  getUsuarioActual(): any {
    const usuarioData = localStorage.getItem('usuario');
    return usuarioData ? JSON.parse(usuarioData) : null;
  }

  // Verifica si hay un token guardado para saber si el usuario esta logueado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Cierra la sesion eliminando el token y usuario del localStorage
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
}