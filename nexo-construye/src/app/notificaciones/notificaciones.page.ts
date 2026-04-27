import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonIcon, IonButtons, IonBackButton, IonSpinner,IonButton, IonBadge, ToastController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {notificationsOutline, checkmarkCircleOutline, closeCircleOutline,calendarOutline, trashOutline, timeOutline, starOutline, constructOutline} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { ConversacionService } from '../conversacionService/conversacion-service';
import { NotificacionService } from '../NotificacionService/notificacion-service';
import { ReservacionService } from '../reservacionService/reservacion-service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonIcon, IonButtons, IonBackButton, IonSpinner,
  IonButton, IonBadge, CommonModule
  ]
})
export class NotificacionesPage implements OnInit, OnDestroy {

  notificaciones: any[] = [];
  cargando = true;
  usuario: any = null;
  private notiSub!: Subscription;

  constructor(private notificacionService: NotificacionService,private reservacionService: ReservacionService,
  private conversacionService: ConversacionService,private router: Router,private toastCtrl: ToastController
  ) {
    addIcons({
      notificationsOutline, checkmarkCircleOutline, closeCircleOutline,
      calendarOutline, trashOutline, timeOutline, starOutline, constructOutline
    });
  }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cargarNotificaciones();
    this.escucharSocket();
  }

  // Cancela la suscripcion al socket cuando se sale de la pantalla
  ngOnDestroy() { this.notiSub?.unsubscribe(); }

  ionViewWillEnter() { this.cargarNotificaciones(); }

  // Carga las notificaciones del usuario y las marca como leidas despues de 2 segundos
  cargarNotificaciones() {
    const id = this.usuario?._id || this.usuario?.id;
    if (!id) { this.cargando = false; return; }

    this.notificacionService.getNotificaciones(id).subscribe({
      next: (data) => {
        this.notificaciones = data;
        this.cargando = false;
        // Espera 2 segundos antes de marcarlas como leidas para que el usuario las vea primero
        setTimeout(() => {
          this.notificacionService.marcarTodasLeidas(id).subscribe();
        }, 2000);
      },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  // Conecta el socket y recarga las notificaciones cuando llega una nueva en tiempo real
  escucharSocket() {
    const id = this.usuario?._id || this.usuario?.id;
    if (!id) return;
    this.conversacionService.conectar(id);
    this.notiSub = this.conversacionService.escucharNotificaciones().subscribe(() => {
      this.cargarNotificaciones();
    });
  }

  // Devuelve el titulo de la notificacion segun su tipo
  getTitulo(tipo: string): string {
    switch (tipo) {
      case 'reserva_nueva':           return 'Nueva solicitud de reserva';
      case 'reserva_aceptada':        return 'Reserva aceptada';
      case 'reserva_rechazada':       return 'Reserva rechazada';
      case 'cancelacion_solicitada':  return 'Solicitud de cancelacion';
      case 'trabajo_completado':      return 'Trabajo completado';
      default:                        return 'Notificacion';
    }
  }

  // Devuelve el icono segun el tipo de notificacion
  getIcono(tipo: string): string {
    switch (tipo) {
      case 'reserva_nueva':           return 'calendar-outline';
      case 'reserva_aceptada':        return 'checkmark-circle-outline';
      case 'reserva_rechazada':       return 'close-circle-outline';
      case 'cancelacion_solicitada':  return 'time-outline';
      case 'trabajo_completado':      return 'construct-outline';
      default:                        return 'notifications-outline';
    }
  }

  // Devuelve el color del icono segun el tipo de notificacion
  getColor(tipo: string): string {
    switch (tipo) {
      case 'reserva_nueva':           return '#a78bfa';
      case 'reserva_aceptada':        return '#2dd36f';
      case 'reserva_rechazada':       return '#eb445a';
      case 'cancelacion_solicitada':  return '#ffa534';
      case 'trabajo_completado':      return '#2dd36f';
      default:                        return 'rgba(255,255,255,0.5)';
    }
  }

  // Devuelve el color de fondo de la tarjeta segun el tipo de notificacion
  getBgColor(tipo: string): string {
    switch (tipo) {
      case 'reserva_nueva':           return 'rgba(167,139,250,0.08)';
      case 'reserva_aceptada':        return 'rgba(45,211,111,0.08)';
      case 'reserva_rechazada':       return 'rgba(235,68,90,0.08)';
      case 'cancelacion_solicitada':  return 'rgba(255,165,52,0.08)';
      case 'trabajo_completado':      return 'rgba(45,211,111,0.08)';
      default:                        return 'transparent';
    }
  }

  // Devuelve el total de notificaciones que aun no han sido leidas
  get noLeidas(): number {
    return this.notificaciones.filter(notificacion => !notificacion.leida).length;
  }

  // Acepta una reserva y elimina la notificacion despues de confirmar
  async aceptarReserva(noti: any) {
    if (!noti.reservacionId) return;
    this.reservacionService.confirmarReservacion(noti.reservacionId).subscribe({
      next: async () => {
        await this.mostrarToast('Reserva aceptada', 'success');
        this.notificacionService.eliminarNotificacion(noti._id).subscribe({
          next: () => this.cargarNotificaciones()
        });
      },
      error: async () => await this.mostrarToast('Error al aceptar', 'danger')
    });
  }

  // Rechaza una reserva y elimina la notificacion despues de rechazar
  async rechazarReserva(noti: any) {
    if (!noti.reservacionId) return;
    this.reservacionService.rechazarReservacion(noti.reservacionId).subscribe({
      next: async () => {
        await this.mostrarToast('Reserva rechazada', 'warning');
        this.notificacionService.eliminarNotificacion(noti._id).subscribe({
          next: () => this.cargarNotificaciones()
        });
      },
      error: async () => await this.mostrarToast('Error al rechazar', 'danger')
    });
  }

  // Elimina una notificacion por su ID y recarga la lista
  async eliminarNotificacion(id: string) {
    this.notificacionService.eliminarNotificacion(id).subscribe({
      next: () => this.cargarNotificaciones(),
      error: (err) => console.error(err)
    });
  }

  // Muestra un mensaje temporal en la pantalla
  private async mostrarToast(mensaje: string, color: string) {
    (await this.toastCtrl.create({ message: mensaje, duration: 2000, color })).present();
  }
}