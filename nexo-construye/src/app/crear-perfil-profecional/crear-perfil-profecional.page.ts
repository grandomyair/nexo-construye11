import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar, IonItem,IonLabel, IonInput, IonTextarea, IonButton, IonButtons,IonBackButton, IonList, IonChip, IonIcon, IonText,
IonSelect, IonSelectOption,ToastController, LoadingController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {addCircleOutline, closeCircle, addOutline, trashOutline,checkmarkCircleOutline, linkOutline, imagesOutline
} from 'ionicons/icons';
import { UserProfecionalService } from '../userProfecinalService/user-profecional';
import { PortafolioService } from '../PortafolioService/portafolio-service';

@Component({
  selector: 'app-crear-perfil-profecional',
  templateUrl: './crear-perfil-profecional.page.html',
  styleUrls: ['./crear-perfil-profecional.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem,IonLabel, IonInput, IonTextarea, IonButton, IonButtons,
  IonBackButton, IonList, IonChip, IonIcon, IonText,IonSelect, IonSelectOption,CommonModule, FormsModule
  ]
})
export class CrearPerfilProfecionalPage implements OnInit {

  usuarioId = '';
  usuarioBase = { nombre: '', correo: '', fotoPerfil: '', municipio: '', edad: 0, estado: '' };
  form = { profesion: '', especialidad: '', cedulaProfesional: '', anosExperiencia: 0, biografia: '' };

  areaServicioInput = '';  areaServicio: string[] = [];
  etiquetasInput = '';     etiquetas: string[] = [];

  imagenesSeleccionadas: File[] = [];
  previewImagenes: string[] = [];
  portafolioTitulo = '';
  portafolioDescripcion = '';

  cargando = false;

  readonly profesiones = [
    'Arquitecto', 'Ingeniero Civil', 'Diseñador de Interiores',
    'Albañil', 'Electricista', 'Plomero', 'Carpintero', 'Soldador',
    'Pintor', 'Herrero', 'Yesero', 'Instalador de Pisos',
    'Techador', 'Paisajista', 'Topógrafo', 'Contratista General', 'Otro',
  ];

  constructor(private route: ActivatedRoute,private router: Router,private profService: UserProfecionalService,
  private portafolioService: PortafolioService,private toastCtrl: ToastController,private loadingCtrl: LoadingController
  ) {
    addIcons({
      addCircleOutline, closeCircle, addOutline, trashOutline,
      checkmarkCircleOutline, linkOutline, imagesOutline
    });
  }

  ngOnInit() {
    // Obtiene el ID del usuario desde la URL y sus datos base del localStorage
    this.usuarioId = this.route.snapshot.paramMap.get('id') || '';
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.usuarioBase = {
      nombre:     usuario.nombre     || '',
      correo:     usuario.correo     || '',
      fotoPerfil: usuario.fotoPerfil || '',
      estado:     usuario.estado     || '',
      municipio:  usuario.municipio  || '',
      edad:       usuario.edad       || 0,
    };
  }

  // Agrega un item al array de areas de servicio o etiquetas segun el tipo
  agregarItem(tipo: 'area' | 'etiqueta') {
    const esArea = tipo === 'area';
    const valor = (esArea ? this.areaServicioInput : this.etiquetasInput).trim();
    const lista = esArea ? this.areaServicio : this.etiquetas;
    if (valor && !lista.includes(valor)) lista.push(valor);
    esArea ? (this.areaServicioInput = '') : (this.etiquetasInput = '');
  }

  // Elimina un item del array de areas de servicio o etiquetas por su indice
  eliminarItem(tipo: 'area' | 'etiqueta', indice: number) {
    (tipo === 'area' ? this.areaServicio : this.etiquetas).splice(indice, 1);
  }

  // Agrega las imagenes seleccionadas y genera su preview en base64
  onImagenesSeleccionadas(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    this.imagenesSeleccionadas.push(...files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evento) => this.previewImagenes.push(evento.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  // Elimina una imagen seleccionada y su preview por su indice
  eliminarImagen(indice: number) {
    this.imagenesSeleccionadas.splice(indice, 1);
    this.previewImagenes.splice(indice, 1);
  }

  // Crea el perfil profesional y sube las imagenes del portafolio si se seleccionaron
 async crearPerfil() {
    // Verifica que se haya seleccionado una profesion
    if (!this.form.profesion) {
      const toast = await this.toastCtrl.create({
        message: 'La profesion es obligatoria',
        duration: 2000, color: 'warning'
      });
      return toast.present();
    }

    // Valida que los anos de experiencia sean correctos
    if (this.form.anosExperiencia < 0 || this.form.anosExperiencia > 60) {
      const toast = await this.toastCtrl.create({
        message: 'Escribe una cantidad de anos de experiencia correcta entre 0 y 60',
        duration: 2000, color: 'warning'
      });
      return toast.present();
    }

    const loading = await this.loadingCtrl.create({ message: 'Creando perfil...' });
    await loading.present();

    // Construye el objeto con todos los datos del perfil profesional
    const payload = {
      tipo: 'profesional',
      ...this.usuarioBase,
      ...this.form,
      añosExperiencia:      this.form.anosExperiencia,
      areaServicio:         this.areaServicio,
      etiquetas:            this.etiquetas,
      usuarioId:            this.usuarioId,
      servicios:            [],
      estadoPerfil:         'activo',
      popularidad:          0,
      calificacionPromedio: 0,
      proyectosCompletados: 0,
      totalReseñas:         0,
      reseñasRecibidas:     [],
      fechasNoDisponibles:  [],
      fechaRegistro:        new Date(),
      rol:                  this.form.profesion
    };

    this.profService.crearPerfilProfesional(payload).subscribe({
      next: async (res: any) => {
        // Actualiza el tipo del usuario a profesional en el localStorage
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        localStorage.setItem('usuario', JSON.stringify({
          ...usuario,
          fotoPerfil: this.usuarioBase.fotoPerfil,
          tipo: 'profesional'
        }));

        // Si se seleccionaron imagenes las sube al portafolio del profesional
        if (this.imagenesSeleccionadas.length > 0) {
          const formData = new FormData();
          this.imagenesSeleccionadas.forEach(imagen => formData.append('imagenes', imagen));
          formData.append('titulo',        this.portafolioTitulo);
          formData.append('descripcion',   this.portafolioDescripcion);
          formData.append('profesionalId', res.id || this.usuarioId);
          this.portafolioService.subirImagenes(formData).subscribe({
            error: (error) => console.error('Error subiendo imagenes', error)
          });
        }

        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: 'Perfil profesional creado',
          duration: 2000, color: 'success'
        });
        await toast.present();
        this.router.navigate(['/nexo-home']);
      },
      error: async (err: any) => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: err?.error?.error || 'Error al crear perfil',
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