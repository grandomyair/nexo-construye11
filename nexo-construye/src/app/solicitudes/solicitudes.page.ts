import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonIcon, IonBadge,IonButtons, IonBackButton, IonSpinner, IonButton,
ToastController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {calendarOutline, closeCircleOutline,checkmarkCircleOutline, timeOutline} from 'ionicons/icons';
import { ReservacionService } from '../reservacionService/reservacion-service';
import { UserProfecionalService } from '../userProfecinalService/user-profecional';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonIcon, IonBadge,IonButtons, IonBackButton, IonSpinner, IonButton,
  CommonModule
  ]
})
export class SolicitudesPage implements OnInit {

  solicitudes: any[] = [];
  reservacionesActivas: any[] = [];
  cargando = true;
  usuario: any = null;
  esProfesional = false;
  procesando = '';

  constructor(private reservacionService: ReservacionService,private profesionalService: UserProfecionalService,private router: Router,
  private toastCtrl: ToastController
  ) {
    addIcons({ calendarOutline, closeCircleOutline, checkmarkCircleOutline, timeOutline });
  }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.esProfesional = this.usuario?.tipo === 'profesional';
    this.cargar();
  }

  // Recarga los datos cada vez que se entra a la pantalla
  ionViewWillEnter() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.esProfesional = this.usuario?.tipo === 'profesional';
    this.cargar();
  }

  // Carga las reservaciones activas y las solicitudes de cancelacion segun el tipo de usuario
  // Si es profesional busca primero su perfil para obtener el ID correcto
  cargar() {
    this.cargando = true;
    const id = this.usuario?._id || this.usuario?.id;
    if (!id) { this.cargando = false; return; }

    if (this.esProfesional) {
      this.profesionalService.getPerfilByCorreo(this.usuario.correo).subscribe({
        next: (perfil) => {
          this.reservacionService.getReservacionesByProfesional(perfil._id).subscribe({
            next: (data) => {
              // Filtra las reservaciones con solicitudes de cancelacion pendientes
              this.solicitudes = data.filter(reservacion =>
                reservacion.estado === 'solicitud_cancelacion_cliente' ||
                reservacion.estado === 'solicitud_cancelacion_profesional'
              );
              // Filtra las reservaciones que estan confirmadas y activas
              this.reservacionesActivas = data.filter(reservacion => reservacion.estado === 'confirmada');
              this.cargando = false;
            },
            error: () => { this.cargando = false; }
          });
        },
        error: () => { this.cargando = false; }
      });
    } else {
      this.reservacionService.getReservacionesByCliente(id).subscribe({
        next: (data) => {
          this.solicitudes = data.filter(reservacion =>
            reservacion.estado === 'solicitud_cancelacion_cliente' ||
            reservacion.estado === 'solicitud_cancelacion_profesional'
          );
          this.reservacionesActivas = data.filter(reservacion => reservacion.estado === 'confirmada');
          this.cargando = false;
        },
        error: () => { this.cargando = false; }
      });
    }
  }

  // Envia una solicitud de cancelacion al otro participante de la reservacion
  async solicitarCancelacion(id: string) {
    this.procesando = id;
    const solicitadoPor = this.esProfesional ? 'profesional' : 'cliente';
    this.reservacionService.solicitarCancelacion(id, solicitadoPor).subscribe({
      next: async () => {
        this.procesando = '';
        (await this.toastCtrl.create({
          message: 'Solicitud de cancelacion enviada',
          duration: 2000, color: 'warning'
        })).present();
        this.cargar();
      },
      error: async () => {
        this.procesando = '';
        (await this.toastCtrl.create({
          message: 'Error al enviar la solicitud',
          duration: 2000, color: 'danger'
        })).present();
      }
    });
  }

  // Verifica si el usuario actual puede confirmar la cancelacion de una solicitud recibida
  puedeCancelar(solicitud: any): boolean {
    if (this.esProfesional && solicitud.estado === 'solicitud_cancelacion_cliente') return true;
    if (!this.esProfesional && solicitud.estado === 'solicitud_cancelacion_profesional') return true;
    return false;
  }

  // Verifica si la solicitud de cancelacion fue enviada por el usuario actual
  esMiaSolicitud(solicitud: any): boolean {
    if (this.esProfesional && solicitud.estado === 'solicitud_cancelacion_profesional') return true;
    if (!this.esProfesional && solicitud.estado === 'solicitud_cancelacion_cliente') return true;
    return false;
  }

  // Confirma la cancelacion de una reservacion recibida del otro participante
  async confirmarCancelacion(id: string) {
    this.procesando = id;
    this.reservacionService.confirmarCancelacion(id).subscribe({
      next: async () => {
        this.procesando = '';
        (await this.toastCtrl.create({
          message: 'Reservacion cancelada', duration: 2000, color: 'success'
        })).present();
        this.cargar();
      },
      error: async () => {
        this.procesando = '';
        (await this.toastCtrl.create({
          message: 'Error al cancelar', duration: 2000, color: 'danger'
        })).present();
      }
    });
  }

   Rutas(ruta: string) {
    this.router.navigate([ruta]);
  }
}