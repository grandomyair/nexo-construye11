import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FechaNoDisponibleService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  guardarFechaHoras(data: {
    profesionalId: string;
    fecha: string;
    horas: string[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/fechas-no-disponibles/guardar`, data, {
      headers: this.getHeaders()
    });
  }

  getFechasByProfesional(profesionalId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/fechas-no-disponibles/profesional/${profesionalId}`,
      { headers: this.getHeaders() }
    );
  }

  getFechaByDia(profesionalId: string, fecha: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/fechas-no-disponibles/profesional/${profesionalId}/dia/${fecha}`,
      { headers: this.getHeaders() }
    );
  }

  eliminarFecha(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fechas-no-disponibles/${id}`, {
      headers: this.getHeaders()
    });
  }

  explorar(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/busqueda/explorar`, {
      headers: this.getHeaders()
    });
  }

  buscar(profesion?: string, fecha?: string): Observable<any[]> {
    const partes: string[] = [];
    if (profesion) partes.push(`profesion=${encodeURIComponent(profesion)}`);
    if (fecha) partes.push(`fecha=${fecha}`);
    const params = partes.length > 0 ? '?' + partes.join('&') : '';
    return this.http.get<any[]>(`${this.apiUrl}/busqueda/buscar${params}`, {
      headers: this.getHeaders()
    });
  }
}