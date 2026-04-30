import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonIcon, IonBadge,IonButtons, IonBackButton, IonSpinner, IonButton,
IonSegment, IonSegmentButton, ToastController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {calendarOutline, checkmarkCircleOutline, closeCircleOutline,timeOutline, constructOutline, starOutline} from 'ionicons/icons';
import { ReservacionService } from '../reservacionService/reservacion-service';
import { UserProfecionalService } from '../userProfecinalService/user-profecional';

@Component({
  selector: 'app-mis-reservaciones',
  templateUrl: './mis-reservaciones.page.html',
  styleUrls: ['./mis-reservaciones.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonIcon, IonBadge,IonButtons, IonBackButton, IonSpinner, IonButton,
    IonSegment, IonSegmentButton,CommonModule, FormsModule
  ]
})
export class MisReservacionesPage implements OnInit {

  reservaciones: any[] = [];
  cargando = true;
  usuario: any = null;
  segmento = 'cliente';
  esProfesional = false;

  constructor(private reservacionService: ReservacionService,private profesionalService: UserProfecionalService,private router: Router,
  private toastCtrl: ToastController
  ) {
    addIcons({
      calendarOutline, checkmarkCircleOutline, closeCircleOutline,
      timeOutline, constructOutline, starOutline
    });
  }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.esProfesional = this.usuario?.tipo === 'profesional';
    this.cargarReservaciones();
  }

  // Recarga las reservaciones cada vez que se entra a la pantalla
  ionViewWillEnter() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.esProfesional = this.usuario?.tipo === 'profesional';
    this.cargarReservaciones();
  }

  // Recarga las reservaciones cuando el usuario cambia entre el segmento cliente y profesional
  cambiarSegmento() {
    this.cargarReservaciones();
  }

  // Carga las reservaciones segun el segmento activo
  // Si es cliente carga por ID de usuario, si es profesional busca primero su perfil para obtener su ID correcto
  cargarReservaciones() {
    this.cargando = true;
    const id = this.usuario?._id || this.usuario?.id;
    if (!id) { this.cargando = false; return; }

    if (this.segmento === 'cliente') {
      this.reservacionService.getReservacionesByCliente(id).subscribe({
        next: (data) => { this.reservaciones = data; this.cargando = false; },
        error: (err) => { console.error(err); this.cargando = false; }
      });
    } else {
      // Busca el perfil profesional por correo para obtener el ID correcto del perfil
      this.profesionalService.getPerfilByCorreo(this.usuario.correo).subscribe({
        next: (perfil) => {
          this.reservacionService.getReservacionesByProfesional(perfil._id).subscribe({
            next: (data) => { this.reservaciones = data; this.cargando = false; },
            error: (err) => { console.error(err); this.cargando = false; }
          });
        },
        error: () => { this.cargando = false; }
      });
    }
  }

  // Devuelve el color del badge segun el estado de la reservacion
  getEstadoColor(estado: string): string {
    const colores: any = {
      pendiente: 'warning', confirmada: 'success',
      cancelada: 'danger', completada: 'primary', rechazada: 'danger'
    };
    return colores[estado] || 'medium';
  }

  // Devuelve el icono segun el estado de la reservacion
  getEstadoIcono(estado: string): string {
    const iconos: any = {
      pendiente: 'time-outline', confirmada: 'checkmark-circle-outline',
      cancelada: 'close-circle-outline', completada: 'construct-outline',
      rechazada: 'close-circle-outline'
    };
    return iconos[estado] || 'calendar-outline';
  }

  // Marca una reservacion como completada y notifica al cliente para que califique
  async completarReservacion(id: string) {
    this.reservacionService.completarReservacion(id).subscribe({
      next: async () => {
        (await this.toastCtrl.create({
          message: 'Trabajo marcado como completado',
          duration: 2000, color: 'success'
        })).present();
        this.cargarReservaciones();
      },
      error: async () => {
        (await this.toastCtrl.create({
          message: 'Error al completar',
          duration: 2000, color: 'danger'
        })).present();
      }
    });
  }

  // Navega a la pantalla de calificacion pasando el ID y nombre del profesional
  irACalificar(reservacion: any) {
    this.router.navigate(['/calificar', reservacion.profesional], {
      queryParams: {
        profesionalId: reservacion.profesional,
        nombreProfesional: reservacion.nombreProfesional
      }
    });
  }

    Rutas(ruta: string) {
    this.router.navigate([ruta]);
  }
}