import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadosApi {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtiene todos los estados disponibles
  getEstados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estados`);
  }

  // Obtiene todos los municipios que pertenecen a un estado especifico
  getMunicipiosByEstado(estadoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/municipio/estado/${estadoId}`);
  }
}