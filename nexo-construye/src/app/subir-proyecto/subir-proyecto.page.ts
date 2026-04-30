import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonButtons, IonBackButton, IonButton, IonIcon,ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { imagesOutline, addOutline, closeCircleOutline } from 'ionicons/icons';
import { PortafolioService } from '../PortafolioService/portafolio-service';

@Component({
  selector: 'app-subir-proyecto',
  templateUrl: './subir-proyecto.page.html',
  styleUrls: ['./subir-proyecto.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonButtons, IonBackButton, IonButton, IonIcon,
  CommonModule, FormsModule
  ]
})
export class SubirProyectoPage implements OnInit {

  profesionalId = '';
  titulo = '';
  descripcion = '';
  imagenesSeleccionadas: File[] = [];
  previews: string[] = [];
  subiendo = false;

  constructor(private route: ActivatedRoute,private router: Router,private portafolioService: PortafolioService,
  private toastCtrl: ToastController,private loadingCtrl: LoadingController
  ) {
    addIcons({ imagesOutline, addOutline, closeCircleOutline });
  }

  ngOnInit() {
    // Obtiene el ID del profesional desde la URL
    this.profesionalId = this.route.snapshot.paramMap.get('id') || '';
  }

  // Agrega las imagenes seleccionadas y genera su preview en base64
  onImagenesSeleccionadas(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    this.imagenesSeleccionadas.push(...files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evento) => this.previews.push(evento.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  // Elimina una imagen seleccionada y su preview por su indice
  eliminarImagen(indice: number) {
    this.imagenesSeleccionadas.splice(indice, 1);
    this.previews.splice(indice, 1);
  }

  // Valida los campos y sube el proyecto con sus imagenes al portafolio del profesional
  async subirProyecto() {
    // Verifica que se haya ingresado un titulo
    if (!this.titulo.trim()) {
      const toast = await this.toastCtrl.create({
        message: 'El titulo es obligatorio',
        duration: 2000, color: 'warning'
      });
      toast.present();
      return;
    }

    // Verifica que se haya seleccionado al menos una imagen
    if (this.imagenesSeleccionadas.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'Agrega al menos una imagen',
        duration: 2000, color: 'warning'
      });
      toast.present();
      return;
    }

    this.subiendo = true;
    const loading = await this.loadingCtrl.create({ message: 'Subiendo proyecto...' });
    await loading.present();

    // Construye el FormData con las imagenes y datos del proyecto
    const formData = new FormData();
    this.imagenesSeleccionadas.forEach(imagen => formData.append('imagenes', imagen));
    formData.append('titulo', this.titulo);
    formData.append('descripcion', this.descripcion);
    formData.append('profesionalId', this.profesionalId);

    this.portafolioService.subirImagenes(formData).subscribe({
      next: async () => {
        await loading.dismiss();
        this.subiendo = false;
        const toast = await this.toastCtrl.create({
          message: 'Proyecto subido correctamente',
          duration: 2000, color: 'success'
        });
        await toast.present();
        // Redirige al perfil profesional despues de subir el proyecto
        this.router.navigate(['/perfil-profesional', this.profesionalId]);
      },
      error: async () => {
        await loading.dismiss();
        this.subiendo = false;
        const toast = await this.toastCtrl.create({
          message: 'Error al subir el proyecto',
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