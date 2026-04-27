import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PortafolioService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Sube las imagenes del portafolio al servidor
  subirImagenes(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/portafolio/imagenes`, formData);
  }

  // Crea un nuevo proyecto en el portafolio
  crearPortafolio(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/portafolio`, data);
  }

  // Obtiene todos los proyectos del portafolio
  getPortafolios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/portafolio`);
  }

  // Obtiene un proyecto del portafolio por su ID
  getPortafolioById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/portafolio/${id}`);
  }

  // Actualiza un proyecto del portafolio por su ID
  actualizarPortafolio(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/portafolio/${id}`, data);
  }

  // Elimina un proyecto del portafolio por su ID
  eliminarPortafolio(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/portafolio/${id}`);
  }

  // Obtiene todos los proyectos del portafolio de un profesional especifico
  getPortafoliosByProfesional(profesionalId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/portafolio/profesional/${profesionalId}`);
  }
}