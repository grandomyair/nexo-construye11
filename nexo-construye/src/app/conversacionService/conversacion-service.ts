import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ConversacionService {

  private apiUrl = environment.apiUrl;
  private socket: Socket;

  constructor(private http: HttpClient) {
    // Crea la conexion de Socket.io sin conectarse automaticamente
    this.socket = io(this.apiUrl, {
      transports: ['websocket'],
      autoConnect: false
    });
  }

  // Genera los headers con el token de autenticacion para cada peticion
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Conecta el socket y une al usuario a su sala personal para recibir notificaciones
  conectar(usuarioId?: string) {
    if (!this.socket.connected) {
      this.socket.connect();
    }
    if (usuarioId) {
      this.socket.emit('unirse_usuario', usuarioId);
    }
  }

  // Desconecta el socket cuando ya no se necesita
  desconectar() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // se Une al socket a la sala de una conversacion para recibir sus mensajes en tiempo real
  unirseAConversacion(conversacionId: string) {
    this.socket.emit('unirse', conversacionId);
  }

  //los mensajes nuevos que llegan por Socket.io en tiempo real
  escucharMensajes(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('mensaje', (mensaje) => {
        observer.next(mensaje);
      });
    });
  }

  // se Crea o recupera una conversacion entre un cliente y un profesional
  iniciarConversacion(data: {
    clienteId: string;
    profesionalId: string;
    nombreCliente: string;
    nombreProfesional: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversaciones/iniciar`, data, {
      headers: this.getHeaders()
    });
  }

  // Envia un mensaje a una conversacion existente
  enviarMensaje(conversacionId: string, data: {
    autorId: string;
    nombreAutor: string;
    texto: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/conversaciones/${conversacionId}/mensaje`, data, {
        headers: this.getHeaders()
      }
    );
  }

  // Obtiene todos los mensajes de una conversacion
  getMensajes(conversacionId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/conversaciones/${conversacionId}/mensajes`, {
        headers: this.getHeaders()
      }
    );
  }

  // Obtiene todas las conversaciones en las que participa un usuario
  getConversacionesByUsuario(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/conversaciones/usuario/${usuarioId}`, {
        headers: this.getHeaders()
      }
    );
  }

  // Marca como leidos todos los mensajes de una conversacion que no son del usuario actual
  marcarComoLeidos(conversacionId: string, usuarioId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/conversaciones/${conversacionId}/leidos`,
      { usuarioId },
      { headers: this.getHeaders() }
    );
  }

  //las notificaciones nuevas que llegan por Socket.io en tiempo real
  escucharNotificaciones(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('notificacion', (notificacion) => {
        observer.next(notificacion);
      });
    });
  }
}