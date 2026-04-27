import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,IonBackButton, IonChip, IonIcon, IonLabel, IonList, IonItem,
IonButton, ToastController, LoadingController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {calendarOutline, calendarClearOutline, timeOutline,closeCircle, trashOutline, saveOutline} from 'ionicons/icons';
import { FechaNoDisponibleService } from '../FechaNoDispobibleService/fecha-no-dispobible-service';

@Component({
  selector: 'app-agenda-de-disponibilidad',
  templateUrl: './agenda-de-disponibilidad.page.html',
  styleUrls: ['./agenda-de-disponibilidad.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,IonChip, IonIcon, IonLabel, IonList, IonItem, IonButton,
  CommonModule, FormsModule, DatePipe
  ]
})
export class AgendaDeDisponibilidadPage implements OnInit {

  userId = '';
  hoy = new Date().toISOString().split('T')[0];

  rangoInicio = '';
  rangoFin = '';

  fechaSeleccionada = '';
  fechasBloqueadas: any[] = [];
  horasBloqueoActual: string[] = [];
  guardando = false;

  readonly horasDisponibles = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ];

  constructor(private route: ActivatedRoute,private fechaService: FechaNoDisponibleService,
  private toastCtrl: ToastController,private loadingCtrl: LoadingController
  ) {
    addIcons({
      calendarOutline, calendarClearOutline, timeOutline,
      closeCircle, trashOutline, saveOutline
    });
  }

  async ngOnInit() {
    // Obtiene el ID del profesional desde la URL y carga sus fechas bloqueadas
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) this.cargarFechas();
  }

  // Carga todas las fechas bloqueadas del profesional desde la base de datos
  cargarFechas() {
    this.fechaService.getFechasByProfesional(this.userId).subscribe({
      next: (data) => this.fechasBloqueadas = data,
      error: (err) => console.error(err)
    });
  }

  // Bloquea todos los dias dentro de un rango de fechas sin especificar horas
  async bloquearRango() {
    if (!this.rangoInicio || !this.rangoFin) return;

    // Valida que la fecha de fin no sea anterior a la de inicio
    if (new Date(this.rangoFin) < new Date(this.rangoInicio)) {
      const toast = await this.toastCtrl.create({
        message: 'La fecha fin no puede ser antes que la de inicio',
        duration: 2000, color: 'warning'
      });
      toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Bloqueando...' });
    await loading.present();

    // Genera todos los dias del rango y los bloquea uno por uno con horas vacias
    const fechas = this.generarFechasRango(this.rangoInicio, this.rangoFin);
    let completados = 0;

    for (const fecha of fechas) {
      await this.fechaService.guardarFechaHoras({
        profesionalId: this.userId,
        fecha,
        horas: [] // array vacio significa dia completo bloqueado
      }).toPromise();
      completados++;
    }

    this.rangoInicio = '';
    this.rangoFin = '';
    this.cargarFechas();
    await loading.dismiss();

    const toast = await this.toastCtrl.create({
      message: `${completados} dias bloqueados`,
      duration: 2000, color: 'success'
    });
    toast.present();
  }

  // Genera un array con todas las fechas entre una fecha de inicio y una de fin
  private generarFechasRango(inicio: string, fin: string): string[] {
    const fechas: string[] = [];
    const fechaActual = new Date(inicio);
    const fechaFin = new Date(fin);

    while (fechaActual <= fechaFin) {
      fechas.push(fechaActual.toISOString().split('T')[0]);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return fechas;
  }

  // Cuando cambia la fecha seleccionada carga las horas bloqueadas de ese dia
  onFechaChange() {
    if (!this.fechaSeleccionada) return;
    if (this.fechaSeleccionada.includes('T')) {
      this.fechaSeleccionada = this.fechaSeleccionada.split('T')[0];
    }
    this.horasBloqueoActual = [];
    this.fechaService.getFechaByDia(this.userId, this.fechaSeleccionada).subscribe({
      next: (data) => this.horasBloqueoActual = data?.horas || [],
      error: () => this.horasBloqueoActual = []
    });
  }

  // Verifica si una hora ya esta en la lista de horas bloqueadas del dia seleccionado
  estaSeleccionada(hora: string): boolean {
    return this.horasBloqueoActual.includes(hora);
  }

  // Agrega o quita una hora de la lista de horas bloqueadas del dia seleccionado
  toggleHora(hora: string) {
    const indice = this.horasBloqueoActual.indexOf(hora);
    if (indice >= 0) {
      this.horasBloqueoActual.splice(indice, 1);
    } else {
      this.horasBloqueoActual.push(hora);
      this.horasBloqueoActual.sort();
    }
  }

  // Guarda las horas bloqueadas del dia seleccionado, si no hay horas desbloquea el dia completo
  async guardarDisponibilidad() {
    if (!this.fechaSeleccionada) {
      const toast = await this.toastCtrl.create({
        message: 'Selecciona una fecha primero',
        duration: 2000, color: 'warning'
      });
      return toast.present();
    }

    this.guardando = true;
    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    // Si no hay horas seleccionadas elimina el bloqueo del dia si existe
    if (this.horasBloqueoActual.length === 0) {
      const bloqueo = this.fechasBloqueadas.find(bloqueo => bloqueo.fecha === this.fechaSeleccionada);
      if (bloqueo) {
        this.fechaService.eliminarFecha(bloqueo._id).subscribe({
          next: async () => {
            this.cargarFechas();
            await loading.dismiss();
            this.guardando = false;
            const toast = await this.toastCtrl.create({
              message: 'Dia desbloqueado', duration: 2000, color: 'success'
            });
            toast.present();
          }
        });
        return;
      }
      await loading.dismiss();
      this.guardando = false;
      return;
    }

    // Guarda las horas bloqueadas del dia seleccionado
    this.fechaService.guardarFechaHoras({
      profesionalId: this.userId,
      fecha: this.fechaSeleccionada,
      horas: this.horasBloqueoActual
    }).subscribe({
      next: async () => {
        this.cargarFechas();
        await loading.dismiss();
        this.guardando = false;
        const toast = await this.toastCtrl.create({
          message: 'Horas guardadas', duration: 2000, color: 'success'
        });
        toast.present();
      },
      error: async () => {
        await loading.dismiss();
        this.guardando = false;
        const toast = await this.toastCtrl.create({
          message: 'Error al guardar', duration: 2000, color: 'danger'
        });
        toast.present();
      }
    });
  }

  // Elimina un bloqueo de fecha por su ID y limpia las horas si era el dia seleccionado
  async eliminarFecha(id: string) {
    this.fechaService.eliminarFecha(id).subscribe({
      next: () => {
        if (this.fechasBloqueadas.find(bloqueo => bloqueo._id === id)?.fecha === this.fechaSeleccionada) {
          this.horasBloqueoActual = [];
        }
        this.cargarFechas();
      },
      error: (err) => console.error(err)
    });
  }
}