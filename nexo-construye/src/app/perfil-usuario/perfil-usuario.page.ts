import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonAvatar, IonIcon, IonButton, IonBackButton,IonButtons, IonBadge} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {personCircleOutline, mailOutline, calendarOutline,locationOutline, mapOutline, notificationsOutline,
timeOutline, starOutline} from 'ionicons/icons';
import { Api } from '../service/api';
import { NotificacionService } from '../NotificacionService/notificacion-service';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonAvatar, IonIcon, IonButton, IonBackButton,IonButtons, IonBadge, CommonModule,
  FormsModule, RouterLink
  ]
})
export class PerfilUsuarioPage implements OnInit {

  usuario: any = null;
  userId = '';
  totalNoLeidas = 0;

  constructor(private route: ActivatedRoute,public router: Router,private api: Api,private notificacionService: NotificacionService
  ) {
    addIcons({
      personCircleOutline, mailOutline, calendarOutline,
      locationOutline, mapOutline, notificationsOutline,
      timeOutline, starOutline
    });
  }

  ngOnInit() {
    // Obtiene el ID del usuario desde la URL o desde el localStorage
    this.userId = this.route.snapshot.paramMap.get('id') ||
      JSON.parse(localStorage.getItem('usuario') || '{}')?.id || '';
    this.cargarUsuario();
    this.contarNoLeidas();
  }

  // Recuenta las notificaciones no leidas cada vez que se entra a la pantalla
  ionViewWillEnter() {
    this.contarNoLeidas();
  }

  // Carga los datos del usuario desde la base de datos
  cargarUsuario() {
    if (!this.userId) return;
    this.api.getUsuarioById(this.userId).subscribe({
      next: (data: any) => { this.usuario = data; },
      error: (err) => console.error('Error al cargar usuario:', err)
    });
  }

  // Obtiene el total de notificaciones no leidas para mostrar el badge en la campana
  contarNoLeidas() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const id = usuario._id || usuario.id;
    if (!id) return;
    this.notificacionService.contarNoLeidas(id).subscribe({
      next: (res) => this.totalNoLeidas = res.total,
      error: () => {}
    });
  }

  // Navega a la pantalla de notificaciones
  irANotificaciones() {
    this.router.navigate(['/notificaciones']);
  }

    Rutas(ruta: string) {
    this.router.navigate([ruta]);
  }
}