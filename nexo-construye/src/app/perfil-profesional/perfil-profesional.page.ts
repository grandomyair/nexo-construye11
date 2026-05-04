import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonAvatar, IonIcon, IonButton, IonBackButton,IonButtons, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent,
IonBadge, ToastController} from '@ionic/angular/standalone';
import { UserProfecionalService } from '../userProfecinalService/user-profecional';
import { PortafolioService } from '../PortafolioService/portafolio-service';
import { ConversacionService } from '../conversacionService/conversacion-service';
import { FechaNoDisponibleService } from '../FechaNoDispobibleService/fecha-no-dispobible-service';
import { ReservacionService } from '../reservacionService/reservacion-service';
import { NotificacionService } from '../NotificacionService/notificacion-service';
import { addIcons } from 'ionicons';
import {personCircleOutline, mailOutline, calendarOutline, locationOutline,briefcaseOutline, starOutline, imagesOutline, createOutline,
idCardOutline, mapOutline, imageOutline, closeOutline,chevronBackOutline, chevronForwardOutline, chatbubbleOutline,
notificationsOutline, chatbubblesOutline, timeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-perfil-profesional',
  templateUrl: './perfil-profesional.page.html',
  styleUrls: ['./perfil-profesional.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonAvatar, IonIcon, IonButton, IonBackButton,
  IonButtons, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent,IonBadge, CommonModule, FormsModule, RouterModule
  ]
})
export class PerfilProfesionalPage implements OnInit {

  profesional: any = null;
  userId = '';
  esPropietario = false;
  isLoggedIn = false;
  totalSolicitudes = 0;
  chatHabilitado = false;
  puedeCalificar = false;

  todosLosProyectos: any[] = [];
  proyectosVisibles: any[] = [];
  cargandoProyectos = true;
  private pagina = 0;
  private readonly POR_PAGINA = 5;

  visorAbierto = false;
  imagenesVisor: string[] = [];
  imagenActual = 0;

  fechaSeleccionada = '';
  horaSeleccionada = '';
  horasBloqueadas: string[] = [];
  horaReservada = '';
  cargandoHoras = false;
  reservacionId = '';
  hoy = new Date().toISOString().split('T')[0];

  readonly todasLasHoras = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ];

  readonly estrellas = [1, 2, 3, 4, 5];

  // Devuelve los anos de experiencia del profesional
  get anosExperiencia(): number { return this.profesional?.['añosExperiencia'] || 0; }

  // Devuelve el total de resenas del profesional
  get totalResenas(): number { return this.profesional?.totalReseñas || 0; }

  private get usuarioActual() {
    return JSON.parse(localStorage.getItem('usuario') || '{}');
  }

  // Obtiene el ID del usuario logueado desde el localStorage
  private get usuarioId(): string {
    return this.usuarioActual._id || this.usuarioActual.id || '';
  }

  enviandoReserva = false;

  totalNoLeidos = 0;     
  totalChatsNoLeidos = 0;
  reservaEnviada = false;

  constructor(
  private profecionalService: UserProfecionalService,private portafolioService: PortafolioService,private conversacionService: ConversacionService,
  private fechaNoDisponibleService: FechaNoDisponibleService,private reservacionService: ReservacionService,
  private notificacionService: NotificacionService,private route: ActivatedRoute,private router: Router,
  private toastCtrl: ToastController
  ) {
    addIcons({
      personCircleOutline, mailOutline, calendarOutline, locationOutline,
      briefcaseOutline, starOutline, imagesOutline, createOutline,
      idCardOutline, mapOutline, imageOutline, closeOutline,
      chevronBackOutline, chevronForwardOutline, chatbubbleOutline,
      notificationsOutline, chatbubblesOutline, timeOutline
    });
  }

  ngOnInit() { this.inicializar(); }

  // Resetea los proyectos y reinicializa la pagina cada vez que se entra
  ionViewWillEnter() {
    this.todosLosProyectos = [];
    this.proyectosVisibles = [];
    this.pagina = 0;
    this.inicializar();
  }

  // Obtiene el ID del perfil desde la URL y carga el perfil, proyectos y notificaciones
  private inicializar() {
  this.userId = this.route.snapshot.paramMap.get('id') || '';
  this.isLoggedIn = !!this.usuarioId;
  if (this.userId) {
    this.cargarPerfil();
    this.cargarProyectos();
    this.contarNoLeidos();

    // Escucha notificaciones en tiempo real y muestra toast para que mas se den cuenta ########
    if (this.esPropietario || this.usuarioId) {
      this.conversacionService.conectar(this.usuarioId);
      this.conversacionService.escucharNotificaciones().subscribe(async () => {
        this.contarNoLeidos();
        (await this.toastCtrl.create({
          message: 'Tienes una nueva notificación de reserva',
          duration: 4000,
          color: 'primary',
          position: 'top'
        })).present();
      });
    }
  }
}

  // Carga el perfil del profesional y verifica si el usuario es el propietario
  cargarPerfil() {
    this.profecionalService.getPerfilById(this.userId).subscribe({
      next: (data) => {
        this.profesional = data;
        this.esPropietario = this.usuarioActual.correo === data.correo;
        this.verificarReservaConfirmada();
        // Si es el propietario cuenta las solicitudes de cancelacion pendientes
        if (this.esPropietario) this.contarSolicitudes();
      },
      error: (err) => console.error(err)
    });
  }

 contarNoLeidos() {
  if (!this.usuarioId) return;
  this.notificacionService.contarNoLeidas(this.usuarioId).subscribe({
    next: async (res) => {
      this.totalNoLeidos = res.total;
      if (res.total > 0 && this.esPropietario) {
        (await this.toastCtrl.create({
          message: `Tienes ${res.total} notificación${res.total > 1 ? 'es' : ''} sin leer`,
          duration: 4000,
          color: 'primary',
          position: 'top'
        })).present();
      }
    },
    error: () => {}
  });
}

  // Verifica si el usuario tiene una reserva confirmada o completada con este profesional
  // para habilitar el chat o el boton de calificar
  verificarReservaConfirmada() {
    if (!this.usuarioId || this.esPropietario) return;
    this.reservacionService.getReservacionesByCliente(this.usuarioId).subscribe({
      next: (reservaciones) => {
        const mias = reservaciones.filter(reservacion => reservacion.profesional?.toString() === this.userId);
        this.chatHabilitado = mias.some(reservacion => reservacion.estado === 'confirmada');
        this.puedeCalificar = mias.some(reservacion => reservacion.estado === 'completada');
      },
      error: () => {}
    });
  }

  // Cuenta las notificaciones no leidas del usuario para mostrar el badge en la campana
 contarChatsNoLeidos() {
  if (!this.usuarioId) return;
  this.conversacionService.getConversacionesByUsuario(this.usuarioId).subscribe({
    next: (conversaciones) => {
      this.totalChatsNoLeidos = conversaciones.reduce((total: number, conv: any) => {
        const noLeidos = conv.mensajes?.filter(
          (m: any) => m.autorId?.toString() !== this.usuarioId && !m.leido
        ).length || 0;
        return total + noLeidos;
      }, 0);
    },
    error: () => {}
  });
}

  // Cuenta las solicitudes de cancelacion pendientes para mostrar el badge en el boton solicitudes
  contarSolicitudes() {
    this.reservacionService.getReservacionesByProfesional(this.userId).subscribe({
      next: (data) => {
        this.totalSolicitudes = data.filter(reservacion =>
          reservacion.estado === 'solicitud_cancelacion_cliente' ||
          reservacion.estado === 'solicitud_cancelacion_profesional'
        ).length;
      },
      error: () => {}
    });
  }

  // Navega a la pantalla de notificaciones
  irAMensajes() { this.router.navigate(['/notificaciones']); }

  // Carga todos los proyectos del portafolio del profesional
  cargarProyectos() {
    this.cargandoProyectos = true;
    this.todosLosProyectos = [];
    this.proyectosVisibles = [];
    this.pagina = 0;
    this.portafolioService.getPortafoliosByProfesional(this.userId).subscribe({
      next: (data) => {
        this.todosLosProyectos = data;
        this.cargarMasProyectos();
        this.cargandoProyectos = false;
      },
      error: (err) => { console.error(err); this.cargandoProyectos = false; }
    });
  }

  // Carga los siguientes proyectos en el scroll infinito de 5 en 5
  cargarMasProyectos(event?: any) {
    const inicio = this.pagina * this.POR_PAGINA;
    const nuevos = this.todosLosProyectos.slice(inicio, inicio + this.POR_PAGINA);
    this.proyectosVisibles = [...this.proyectosVisibles, ...nuevos];
    this.pagina++;
    if (event) {
      event.target.complete();
      if (this.proyectosVisibles.length >= this.todosLosProyectos.length)
        event.target.disabled = true;
    }
  }

  // Cuando se selecciona una fecha carga las horas bloqueadas y la hora ya reservada por el usuario
  onFechaSeleccionada() {
    if (!this.fechaSeleccionada) return;
    this.horaSeleccionada = '';
    this.horasBloqueadas = [];
    this.horaReservada = '';
    this.cargandoHoras = true;

    if (this.usuarioId) {
      this.reservacionService.getReservacionesByCliente(this.usuarioId).subscribe({
        next: (reservaciones) => {
          // Busca si ya existe una reserva del usuario con este profesional en la fecha seleccionada
          const existente = reservaciones.find(
            reservacion => reservacion.profesional?.toString() === this.userId &&
                 reservacion.fecha === this.fechaSeleccionada &&
                 (reservacion.estado === 'pendiente' || reservacion.estado === 'confirmada')
          );
          if (existente) this.horaReservada = existente.hora;
        }
      });
    }

    this.fechaNoDisponibleService.getFechaByDia(this.userId, this.fechaSeleccionada).subscribe({
      next: (data) => {
        // Si el dia tiene horas vacias significa que todo el dia esta bloqueado
        this.horasBloqueadas = data?._id && data.horas?.length === 0
          ? [...this.todasLasHoras] : data?.horas || [];
        this.cargandoHoras = false;
      },
      error: () => { this.horasBloqueadas = []; this.cargandoHoras = false; }
    });
  }

  // Verifica si una hora esta en la lista de horas bloqueadas
  estaBloqueda(hora: string): boolean { return this.horasBloqueadas.includes(hora); }

  // Selecciona una hora si no esta bloqueada ni ya reservada
  seleccionarHora(hora: string) {
    if (this.estaBloqueda(hora) || this.horaReservada === hora) return;
    this.horaSeleccionada = hora;
  }

  // Envia una solicitud de reserva al profesional con la fecha y hora seleccionadas
 async enviarReserva() {
  if (!this.usuarioId || this.enviandoReserva) return;
  this.enviandoReserva = true;

  this.reservacionService.crearReservacion({
    cliente: this.usuarioId,
    profesional: this.userId,
    nombreCliente: this.usuarioActual.nombre,
    nombreProfesional: this.profesional.nombre,
    servicio: this.profesional.profesion || '',
    fecha: this.fechaSeleccionada,
    hora: this.horaSeleccionada
  }).subscribe({
    next: async (res) => {
      this.reservacionId = res.id;
      this.horaReservada = this.horaSeleccionada;
      this.reservaEnviada = true;
      this.enviandoReserva = false;
      if (!this.horasBloqueadas.includes(this.horaSeleccionada))
        this.horasBloqueadas.push(this.horaSeleccionada);
      (await this.toastCtrl.create({
        message: 'Solicitud enviada, espera la confirmacion',
        duration: 3000, color: 'success'
      })).present();
    },
    error: async () => {
      this.enviandoReserva = false;
      (await this.toastCtrl.create({
        message: 'Error al enviar la solicitud',
        duration: 2000, color: 'danger'
      })).present();
    }
  });
}

  // Abre o crea una conversacion con el profesional y navega al chat
  abrirChat() {
    if (!this.usuarioId) { this.router.navigate(['/login']); return; }
    this.conversacionService.iniciarConversacion({
      clienteId: this.usuarioId,
      profesionalId: this.userId,
      nombreCliente: this.usuarioActual.nombre,
      nombreProfesional: this.profesional.nombre
    }).subscribe({
      next: (conv) => this.router.navigate(['/chat', conv._id], {
        queryParams: { nombreOtro: this.profesional.nombre }
      }),
      error: (err) => console.error(err)
    });
  }

  // Abre el visor de imagenes mostrando la imagen seleccionada
  abrirVisor(imagenes: string[], index: number) {
    this.imagenesVisor = imagenes;
    this.imagenActual = index;
    this.visorAbierto = true;
  }

  // Cierra el visor de imagenes
  cerrarVisor() {
    this.visorAbierto = false;
    this.imagenesVisor = [];
    this.imagenActual = 0;
  }

  // Navega a la imagen anterior en el visor
  imagenAnterior() {
    this.imagenActual = this.imagenActual === 0
      ? this.imagenesVisor.length - 1 : this.imagenActual - 1;
  }

  // Navega a la imagen siguiente en el visor
  imagenSiguiente() {
    this.imagenActual = this.imagenActual === this.imagenesVisor.length - 1
      ? 0 : this.imagenActual + 1;
  }

    Rutas(ruta: string) {
    this.router.navigate([ruta]);
  }
}