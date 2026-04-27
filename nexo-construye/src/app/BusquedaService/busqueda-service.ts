import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BusquedaService {

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

  // Obtiene todos los profesionales activos sin ningun filtro
  explorar(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/busqueda/explorar`, {
      headers: this.getHeaders()
    });
  }

  // Busca profesionales filtrando por profesion y fecha de disponibilidad
  buscar(profesion?: string, fecha?: string): Observable<any[]> {
    let params = '';
    const partes: string[] = [];

    // Construye los parametros de la URL solo si se enviaron valores
    if (profesion) partes.push(`profesion=${encodeURIComponent(profesion)}`);
    if (fecha) partes.push(`fecha=${fecha}`);
    if (partes.length > 0) params = '?' + partes.join('&');

    return this.http.get<any[]>(`${this.apiUrl}/busqueda/buscar${params}`, {
      headers: this.getHeaders()
    });
  }
}