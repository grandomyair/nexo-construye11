import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonFooter, IonInput, IonButton, IonIcon,
IonButtons, IonBackButton, IonSpinner, ToastController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sendOutline, personCircleOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { ConversacionService } from '../conversacionService/conversacion-service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonFooter, IonInput, IonButton, IonIcon,IonButtons, IonBackButton, IonSpinner,
  CommonModule, FormsModule
  ]
})
export class ChatPage implements OnInit, OnDestroy {

  // Referencia al contenedor del chat para hacer scroll hacia abajo
  @ViewChild('contenido') contenido!: IonContent;

  conversacionId = '';
  mensajes: any[] = [];
  textoMensaje = '';
  cargando = true;
  enviando = false;
  usuario: any = null;
  nombreOtro = '';

  private mensajeSub!: Subscription;

  // Obtiene el ID del usuario logueado desde el objeto usuario
  private get usuarioId(): string {
    return this.usuario?._id || this.usuario?.id || '';
  }

  constructor(private route: ActivatedRoute,private conversacionService: ConversacionService,private toastCtrl: ToastController
  ) {
    addIcons({ sendOutline, personCircleOutline });
  }

  ngOnInit() {
    // Obtiene el usuario del localStorage y los datos de la conversacion desde la URL
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.conversacionId = this.route.snapshot.paramMap.get('conversacionId') || '';
    this.nombreOtro = this.route.snapshot.queryParamMap.get('nombreOtro') || 'Usuario';
    if (this.conversacionId) {
      this.cargarMensajes();
      this.conectarSocket();
    }
  }

  ngOnDestroy() {
    // Cancela la suscripcion al socket y desconecta cuando se sale del chat
    this.mensajeSub?.unsubscribe();
    this.conversacionService.desconectar();
  }

  // Carga los mensajes de la conversacion y los marca como leidos
  cargarMensajes() {
    this.conversacionService.getMensajes(this.conversacionId).subscribe({
      next: (data) => {
        this.mensajes = data;
        this.cargando = false;
        setTimeout(() => this.scrollAbajo(), 100);
        if (this.usuarioId) {
          this.conversacionService.marcarComoLeidos(this.conversacionId, this.usuarioId).subscribe();
        }
      },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  // Conecta el socket y escucha los mensajes nuevos de la conversacion en tiempo real
  conectarSocket() {
    this.conversacionService.conectar();
    this.conversacionService.unirseAConversacion(this.conversacionId);
    this.mensajeSub = this.conversacionService.escucharMensajes().subscribe(mensaje => {
      const esMio = mensaje.autorId?.toString() === this.usuarioId;
      // Solo agrega el mensaje si no fue enviado por el usuario actual
      if (!esMio) {
        this.mensajes.push(mensaje);
        setTimeout(() => this.scrollAbajo(), 100);
      }
    });
  }

  // Envia un mensaje agregandolo primero localmente y luego enviandolo al backend
  async enviarMensaje() {
    if (!this.textoMensaje.trim() || this.enviando) return;
    const texto = this.textoMensaje.trim();
    this.textoMensaje = '';
    this.enviando = true;

    // Agrega el mensaje localmente para mostrarlo de inmediato sin esperar la respuesta del servidor
    this.mensajes.push({
      autorId: this.usuarioId,
      nombreAutor: this.usuario.nombre,
      texto,
      fecha: new Date()
    });
    setTimeout(() => this.scrollAbajo(), 100);

    this.conversacionService.enviarMensaje(this.conversacionId, {
      autorId: this.usuarioId,
      nombreAutor: this.usuario.nombre,
      texto
    }).subscribe({
      next: () => { this.enviando = false; },
      error: (err) => { console.error(err); this.enviando = false; }
    });
  }

  // Verifica si un mensaje fue enviado por el usuario actual
  esMio(mensaje: any): boolean {
    return mensaje.autorId?.toString() === this.usuarioId;
  }

  // Hace scroll hasta el ultimo mensaje del chat
  scrollAbajo() { this.contenido?.scrollToBottom(300); }

  // Muestra un mensaje temporal en la pantalla
  private async mostrarToast(message: string, color: string) {
    (await this.toastCtrl.create({ message, duration: 2000, color })).present();
  }
}