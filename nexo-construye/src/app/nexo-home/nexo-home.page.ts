import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {IonContent, IonButton, IonAvatar, IonIcon, IonBadge, AlertController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {personCircleOutline, logOutOutline, personOutline,closeOutline, chevronDownOutline, notificationsOutline} from 'ionicons/icons';
import { UserProfecionalService } from '../userProfecinalService/user-profecional';
import { NotificacionService } from '../NotificacionService/notificacion-service';

interface CalendarDay {
  number: number;
  currentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  date: Date;
}

interface ServiceTag {
  label: string;
  class: string;
  selected: boolean;
  value: string;
}

interface Categoria {
  nombre: string;
  color: string;
  profesionales: any[];
}

@Component({
  selector: 'app-nexo-home',
  templateUrl: './nexo-home.page.html',
  styleUrls: ['./nexo-home.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonAvatar, IonIcon, IonBadge, CommonModule, FormsModule, RouterModule],
})
export class NexoHomePage implements OnInit {

  categorias: Categoria[] = [];
  usuario: any = null;
  isLoggedIn = false;
  menuOpen = false;
  mostrarBuscar = false;
  totalNotificaciones = 0;

  readonly weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  calendarDays: CalendarDay[] = [];
  monthName = '';
  selectedDate: Date | null = null;

  private readonly today = new Date();
  private viewYear  = this.today.getFullYear();
  private viewMonth = this.today.getMonth();

  private readonly MONTHS_ES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  // Define las 3 categorias de profesionales con sus colores y profesiones que pertenecen a cada una
  // si quieren cambiar el color de aqui se le cambia porque en el scss no esta 
  private readonly GRUPOS = [
    {
      nombre: 'Profesionales del Diseño',
      color: '#5a3a6a',
      profesiones: ['Arquitecto', 'Diseñador de Interiores', 'Paisajista']
    },
    {
      nombre: 'Constructores y Contratistas',
      color: '#7a6020',
      profesiones: ['Albañil', 'Carpintero', 'Techador', 'Soldador',
                    'Herrero', 'Yesero', 'Instalador de Pisos',
                    'Contratista General', 'Pintor']
    },
    {
      nombre: 'Especialistas en Ingeniería',
      color: '#3a5a8a',
      profesiones: ['Ingeniero Civil', 'Electricista', 'Plomero', 'Topógrafo',]
    }
  ];

  serviceTags: ServiceTag[] = [
    { label: 'Arquitectos',          class: 'arquitectos',  selected: false, value: 'Arquitecto' },
    { label: 'Ingeniero Civil',      class: 'ingeniero',    selected: false, value: 'Ingeniero Civil' },
    { label: 'Carpintero',           class: 'carpintero',   selected: false, value: 'Carpintero' },
    { label: 'Albañil',              class: 'albanil',      selected: false, value: 'Albañil' },
    { label: 'Electricista',         class: 'electricista', selected: false, value: 'Electricista' },
    { label: 'Diseñador Interiores', class: 'disenador',    selected: false, value: 'Diseñador de Interiores' },
  ];

  constructor(private alertController: AlertController,public router: Router,private profesionalService: UserProfecionalService,
  private notificacionService: NotificacionService
  ) {
    addIcons({ personCircleOutline, logOutOutline, personOutline, closeOutline, chevronDownOutline, notificationsOutline });
  }

  ngOnInit()         { this.iniciar(); }
  ionViewWillEnter() { this.iniciar(); }

  // Carga el usuario del localStorage, cuenta sus notificaciones y carga los profesionales
  private iniciar(): void {
    const raw = localStorage.getItem('usuario');
    this.usuario    = raw ? JSON.parse(raw) : null;
    this.isLoggedIn = !!this.usuario;
    if (this.usuario) this.contarNotificaciones();
    if (!this.usuario) this.totalNotificaciones = 0;
    this.cargarProfesionales();
  }

  // Carga los profesionales activos con calificacion de 4.5 o superior
  // y los agrupa en las 3 categorias ordenados por calificacion
  private cargarProfesionales(): void {
    this.profesionalService.getPerfiles().subscribe({
      next: (perfiles: any[]) => {
        const profesionalesActivos = perfiles.filter((profesional: any) =>
          profesional.estadoPerfil === 'activo' && (profesional.calificacionPromedio || 0) >= 4.5
        );

        this.categorias = this.GRUPOS.map(grupo => ({
          nombre: grupo.nombre,
          color: grupo.color,
          profesionales: profesionalesActivos
            .filter((profesional: any) => grupo.profesiones.includes(profesional.profesion))
            .sort((profesionalA: any, profesionalB: any) =>
              (profesionalB.calificacionPromedio || 0) - (profesionalA.calificacionPromedio || 0)
            )
            .slice(0, 8)
        })).filter((categoria: any) => categoria.profesionales.length > 0);
      },
      error: (error: any) => console.error(error)
    });
  }

  // Obtiene el total de notificaciones no leidas del usuario logueado
  private contarNotificaciones(): void {
    const id = this.usuario?._id || this.usuario?.id;
    if (!id) return;
    this.notificacionService.contarNoLeidas(id).subscribe({
      next: (res) => this.totalNotificaciones = res.total,
      error: () => {}
    });
  }

  // Navega al perfil del usuario logueado segun su tipo
  verPerfil(): void {
    this.menuOpen = false;
    if (this.usuario?.tipo === 'profesional') {
      this.profesionalService.getPerfilByCorreo(this.usuario.correo).subscribe({
        next: ({ _id }) => this.router.navigate(['/perfil-profesional', _id]),
        error: (err) => console.error(err)
      });
    } else {
      const id = this.usuario?._id ?? this.usuario?.id;
      if (id) this.router.navigate(['/perfil-usuario', id]);
    }
  }

  // Muestra un dialogo de confirmacion y cierra la sesion eliminando el token y usuario del localStorage
  async logout(): Promise<void> {
    this.menuOpen = false;
    const alert = await this.alertController.create({
      header: 'Cerrar sesion',
      message: '¿Estas seguro que deseas cerrar sesion?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesion', role: 'confirm',
          handler: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            this.iniciar();
            this.router.navigate(['/nexo-home']);
          }
        }
      ]
    });
    await alert.present();
  }

  // Abre o cierra el menu desplegable del usuario
  toggleMenu(): void { this.menuOpen = !this.menuOpen; }

  // Abre el panel de busqueda y construye el calendario
  abrirBuscar(): void  { this.mostrarBuscar = true; this.buildCalendar(); }

  // Cierra el panel de busqueda
  cerrarBuscar(): void { this.mostrarBuscar = false; }

  // Navega a explorar servicios sin filtros
  irAExplorar(): void {
    this.mostrarBuscar = false;
    this.router.navigate(['/explorar-servicio'], { queryParams: { modo: 'explorar' } });
  }

  // Navega a buscar servicios con las profesiones y fecha seleccionadas como filtros
  irABuscar(): void {
    this.mostrarBuscar = false;
    const tagsSeleccionados = this.serviceTags.filter(tag => tag.selected).map(tag => tag.value);
    const params: any = { modo: 'buscar' };
    if (tagsSeleccionados.length > 0) params.profesiones = tagsSeleccionados.join(',');
    if (this.selectedDate) params.fecha = this.selectedDate.toISOString().split('T')[0];
    this.router.navigate(['/explorar-servicio'], { queryParams: params });
  }

  // Hace scroll hasta la seccion de profesionales destacados
  scrollToExplore(): void {
    document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Hace scroll hasta el inicio de la pantalla
  scrollToTop(): void {
    document.querySelector('.home-container')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Activa o desactiva una etiqueta de servicio en el panel de busqueda
  toggleTag(tag: ServiceTag): void { tag.selected = !tag.selected; }

  // Cambia el mes del calendario hacia adelante o hacia atras
  changeMonth(delta: number): void {
    this.viewMonth += delta;
    if (this.viewMonth > 11) { this.viewMonth = 0;  this.viewYear++; }
    if (this.viewMonth < 0)  { this.viewMonth = 11; this.viewYear--; }
    this.buildCalendar();
  }

  // Selecciona un dia del calendario si pertenece al mes actual
  selectDay(day: CalendarDay): void {
    if (!day.currentMonth) return;
    this.selectedDate = day.date;
    this.buildCalendar();
  }

  // Construye el array de dias del calendario para el mes y año actual
  private buildCalendar(): void {
    this.monthName = this.MONTHS_ES[this.viewMonth];
    const first    = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const total    = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const prev     = new Date(this.viewYear, this.viewMonth, 0).getDate();
    const trailing = (first + total) % 7;

    this.calendarDays = [
      ...Array.from({ length: first },                        (_, i) => this.makeDay(prev - first + 1 + i, this.viewMonth - 1, false)),
      ...Array.from({ length: total },                        (_, i) => this.makeDay(i + 1,                this.viewMonth,     true)),
      ...Array.from({ length: trailing ? 7 - trailing : 0 }, (_, i) => this.makeDay(i + 1,                this.viewMonth + 1, false)),
    ];
  }

  // Crea un objeto CalendarDay con sus propiedades para mostrar en el calendario
  private makeDay(day: number, month: number, currentMonth: boolean): CalendarDay {
    const date = new Date(this.viewYear, month, day);
    return {
      number: day, currentMonth,
      isToday:    this.sameDay(date, this.today),
      isSelected: !!this.selectedDate && this.sameDay(date, this.selectedDate),
      date
    };
  }

  // Verifica si dos fechas corresponden al mismo dia
  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth()    === b.getMonth()
        && a.getDate()     === b.getDate();
  }
}