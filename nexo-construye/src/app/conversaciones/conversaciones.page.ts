import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonAvatar,
IonIcon, IonBadge, IonButtons, IonBackButton, IonSpinner,} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubblesOutline, personCircleOutline, personOutline } from 'ionicons/icons';
import { ConversacionService } from '../conversacionService/conversacion-service';
import { UserProfecionalService } from '../userProfecinalService/user-profecional';

@Component({
  selector: 'app-conversaciones',
  templateUrl: './conversaciones.page.html',
  styleUrls: ['./conversaciones.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonAvatar,IonIcon, IonBadge, IonButtons, IonBackButton,
  IonSpinner, CommonModule
  ]
})
export class ConversacionesPage implements OnInit {

  conversaciones: any[] = [];
  cargando = true;
  usuario: any = null;
  esProfesional = false;

  constructor(private conversacionService: ConversacionService,private profesionalService: UserProfecionalService,
  private router: Router
  ) {
    addIcons({ chatbubblesOutline, personCircleOutline, personOutline });
  }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.esProfesional = this.usuario?.tipo === 'profesional';
    this.cargarConversaciones();
  }

  // Recarga las conversaciones cada vez que se entra a la pantalla
  ionViewWillEnter() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.esProfesional = this.usuario?.tipo === 'profesional';
    this.cargarConversaciones();
  }

  // Carga todas las conversaciones del usuario logueado
  cargarConversaciones() {
    this.cargando = true;
    const id = this.usuario?._id || this.usuario?.id;
    if (!id) { this.cargando = false; return; }

    this.conversacionService.getConversacionesByUsuario(id).subscribe({
      next: (data) => { this.conversaciones = data; this.cargando = false; },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  // Devuelve el nombre del otro participante de la conversacion
  getNombreOtro(conv: any): string {
    const id = this.usuario?._id || this.usuario?.id;
    if (conv.participantes?.[0]?.toString() === id?.toString()) {
      return conv.nombreProfesional || 'Profesional';
    }
    return conv.nombreCliente || 'Cliente';
  }

  // Verifica si la conversacion tiene mensajes no leidos
  tieneNoLeidos(conv: any): boolean {
    return this.getMensajesNoLeidos(conv) > 0;
  }

  // Cuenta los mensajes no leidos que no fueron enviados por el usuario actual
  getMensajesNoLeidos(conv: any): number {
    const id = this.usuario?._id || this.usuario?.id;
    if (!conv.mensajes || !id) return 0;
    return conv.mensajes.filter(
      (mensaje: any) => mensaje.autorId?.toString() !== id?.toString() && !mensaje.leido
    ).length;
  }

  // Navega al chat de la conversacion seleccionada
  abrirConversacion(conv: any) {
    const nombreOtro = this.getNombreOtro(conv);
    this.router.navigate(['/chat', conv._id], { queryParams: { nombreOtro } });
  }

  // Al tocar el avatar navega al perfil del otro participante
  // Si el usuario es cliente va al perfil del profesional, si es profesional va a calificar al cliente
  verPerfilOtro(conv: any, event: Event) {
    event.stopPropagation();
    const id = this.usuario?._id || this.usuario?.id;
    const esCliente = conv.participantes?.[0]?.toString() === id?.toString();

    if (esCliente) {
      this.profesionalService.getPerfilByCorreo(conv.correoParticipante || '').subscribe({
        next: (perfil) => this.router.navigate(['/perfil-profesional', perfil._id]),
        error: () => {}
      });
    } else {
      this.router.navigate(['/calificar', conv._id], {
        queryParams: {
          profesionalId: conv.participantes?.[0],
          nombreProfesional: conv.nombreCliente
        }
      });
    }
  }

    Rutas(ruta: string) {
    this.router.navigate([ruta]);
  }
}