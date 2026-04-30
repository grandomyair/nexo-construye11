import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonButtons, IonBackButton, IonButton, IonIcon,
ToastController, LoadingController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline, star } from 'ionicons/icons';
import { ReseñaService } from '../ReseñaService/reseña-service';
import { ReservacionService } from '../reservacionService/reservacion-service';

@Component({
  selector: 'app-calificar',
  templateUrl: './calificar.page.html',
  styleUrls: ['./calificar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonButtons, IonBackButton, IonButton, IonIcon,
  CommonModule, FormsModule
  ]
})
export class CalificarPage implements OnInit {

  reservacionId = '';
  profesionalId = '';
  nombreProfesional = '';
  calificacion = 0;
  comentario = '';
  enviando = false;
  usuario: any = null;

  readonly estrellas = [1, 2, 3, 4, 5];

  constructor(private route: ActivatedRoute,private router: Router,private reseñaService: ReseñaService,private reservacionService: ReservacionService,
  private toastCtrl: ToastController,private loadingCtrl: LoadingController
  ) {
    addIcons({ starOutline, star });
  }

  ngOnInit() {
    // Obtiene el usuario del localStorage y los datos del profesional desde la URL
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.reservacionId = this.route.snapshot.paramMap.get('id') || '';
    this.profesionalId = this.route.snapshot.queryParamMap.get('profesionalId') || '';
    this.nombreProfesional = this.route.snapshot.queryParamMap.get('nombreProfesional') || '';
  }

  // Asigna la calificacion seleccionada por el usuario
  seleccionarEstrella(numero: number) {
    this.calificacion = numero;
  }

  // Envia la resena con la calificacion y comentario al backend
  async enviarCalificacion() {
    // Verifica que el usuario haya seleccionado al menos una estrella
    if (this.calificacion === 0) {
      const toast = await this.toastCtrl.create({
        message: 'Selecciona al menos una estrella',
        duration: 2000, color: 'warning'
      });
      toast.present();
      return;
    }

    const id = this.usuario?._id || this.usuario?.id;
    if (!id) return;

    this.enviando = true;
    const loading = await this.loadingCtrl.create({ message: 'Enviando calificacion...' });
    await loading.present();

    this.reseñaService.crearReseña({
      perfilReseñado: this.profesionalId,
      autorReseña: id,
      nombreAutor: this.usuario.nombre,
      calificacion: this.calificacion,
      comentario: this.comentario,
      servicioContratado: ''
    }).subscribe({
      next: async () => {
        await loading.dismiss();
        this.enviando = false;
        const toast = await this.toastCtrl.create({
          message: 'Calificacion enviada',
          duration: 2000, color: 'success'
        });
        await toast.present();
        // Redirige a mis reservaciones despues de enviar la calificacion
        this.router.navigate(['/mis-reservaciones']);
      },
      error: async () => {
        await loading.dismiss();
        this.enviando = false;
        const toast = await this.toastCtrl.create({
          message: 'Error al enviar calificacion',
          duration: 2000, color: 'danger'
        });
        toast.present();
      }
    });
  }

  Rutas(ruta: string) {
    this.router.navigate([ruta]);
  }
}