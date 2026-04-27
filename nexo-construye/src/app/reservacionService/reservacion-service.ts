import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservacionService {

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

  // Crea una nueva solicitud de reservacion entre un cliente y un profesional
  crearReservacion(data: {
    cliente: string;
    profesional: string;
    nombreCliente: string;
    nombreProfesional: string;
    servicio?: string;
    fecha: string;
    hora: string;
    descripcion?: string;
    presupuesto?: number;
    notas?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservaciones/crear`, data, {
      headers: this.getHeaders()
    });
  }

  // Confirma una reservacion pendiente
  confirmarReservacion(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reservaciones/${id}/confirmar`, {}, {
      headers: this.getHeaders()
    });
  }

  // Rechaza una reservacion pendiente
  rechazarReservacion(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reservaciones/${id}/rechazar`, {}, {
      headers: this.getHeaders()
    });
  }

  // Envia una solicitud de cancelacion indicando si la solicita el cliente o el profesional
  solicitarCancelacion(id: string, solicitadoPor: 'cliente' | 'profesional'): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/reservaciones/${id}/solicitar-cancelacion`,
      { solicitadoPor },
      { headers: this.getHeaders() }
    );
  }

  // Confirma la cancelacion de una reservacion
  confirmarCancelacion(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reservaciones/${id}/confirmar-cancelacion`, {}, {
      headers: this.getHeaders()
    });
  }

  // Marca una reservacion confirmada como completada
  completarReservacion(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reservaciones/${id}/completar`, {}, {
      headers: this.getHeaders()
    });
  }

  // Obtiene todas las reservaciones de un cliente
  getReservacionesByCliente(clienteId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservaciones/cliente/${clienteId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtiene todas las reservaciones de un profesional
  getReservacionesByProfesional(profesionalId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservaciones/profesional/${profesionalId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtiene una reservacion por su ID
  getReservacionById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservaciones/${id}`, {
      headers: this.getHeaders()
    });
  }
}