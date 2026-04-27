import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel,IonInput, IonButton, IonAvatar, IonIcon, IonButtons, IonBackButton,
IonSelect, IonSelectOption, IonTextarea, IonToggle, ToastController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, cameraOutline } from 'ionicons/icons';
import { UserProfecionalService } from '../userProfecinalService/user-profecional';
import { EstadosApi } from '../estadosApi/estados-api';

@Component({
  selector: 'app-actualizar-perfil-profesional',
  templateUrl: './actualizar-perfil-profesional.page.html',
  styleUrls: ['./actualizar-perfil-profesional.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel,IonInput, IonButton, IonAvatar, IonIcon, IonButtons, IonBackButton,
  IonSelect, IonSelectOption, IonTextarea, IonToggle,CommonModule, FormsModule
  ]
})
export class ActualizarPerfilProfesionalPage implements OnInit {

  // Referencia al input de archivo oculto para abrir el selector de imagenes
  @ViewChild('fileInput') fileInput!: ElementRef;

  form = {
    nombre: '', edad: 0, fotoPerfil: '', municipio: '',
    estadoId: null as number | null, estado: '',
    profesion: '', especialidad: '', anosExperiencia: 0,
    cedulaProfesional: '', biografia: '',
    estadoPerfil: 'activo'
  };

  previewFoto = '';
  cargando = false;
  userId = '';
  estados: any[] = [];
  municipios: any[] = [];

  constructor(private profecionalService: UserProfecionalService,private estadosApi: EstadosApi,private router: Router,
  private route: ActivatedRoute,private toastController: ToastController
  ) {
    addIcons({ personCircleOutline, cameraOutline });
  }

  ngOnInit() {
    // Obtiene el ID del perfil desde la URL
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.userId) { this.router.navigate(['/nexo-home']); return; }

    // Primero carga los estados y dentro carga el perfil
    // para poder vincular el estadoId correctamente en el select
    this.estadosApi.getEstados().subscribe({
      next: (res: any) => {
        this.estados = res.data;

        this.profecionalService.getPerfilById(this.userId).subscribe({
          next: (data: any) => {
            // Busca el estado por nombre para obtener su ID y mostrarlo en el select
            const estadoEncontrado = this.estados.find(estado => estado.nombre === data.estado);

            this.form = {
              nombre:            data.nombre            || '',
              edad:              data.edad              || 0,
              fotoPerfil:        data.fotoPerfil        || '',
              municipio:         data.municipio         || '',
              estadoId:          estadoEncontrado?._id ?? null,
              estado:            data.estado            || '',
              profesion:         data.profesion         || '',
              especialidad:      data.especialidad      || '',
              anosExperiencia:   data['añosExperiencia'] || 0,
              cedulaProfesional: data.cedulaProfesional  || '',
              biografia:         data.biografia          || '',
              estadoPerfil:      data.estadoPerfil       || 'activo'
            };
            this.previewFoto = data.fotoPerfil || '';

            // Si el perfil ya tiene un estado guardado carga sus municipios
            if (this.form.estadoId) {
              this.estadosApi.getMunicipiosByEstado(this.form.estadoId).subscribe({
                next: (res: any) => this.municipios = res.data,
                error: (err) => console.error(err)
              });
            }
          },
          error: (err) => console.error(err)
        });
      },
      error: (err) => console.error(err)
    });
  }

  // Cambia el estadoPerfil a activo o inactivo segun el toggle
  onToggleEstado(event: any) {
    this.form.estadoPerfil = event.detail.checked ? 'activo' : 'inactivo';
  }

  // Cuando cambia el estado seleccionado limpia el municipio y carga los municipios del nuevo estado
  onEstadoChange() {
    this.form.municipio = '';
    this.municipios = [];
    if (!this.form.estadoId) return;
    this.estadosApi.getMunicipiosByEstado(this.form.estadoId).subscribe({
      next: (res: any) => this.municipios = res.data,
      error: (err) => console.error(err)
    });
  }

  // Abre el selector de archivos del dispositivo para elegir una foto
  seleccionarFoto() { this.fileInput.nativeElement.click(); }

  // Valida y convierte la imagen seleccionada a base64 para previsualizarla y guardarla
  onFotoSeleccionada(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.showToast('Solo se permiten imagenes', 'danger'); return; }
    if (file.size > 2 * 1024 * 1024) { this.showToast('La imagen no puede superar 2MB', 'danger'); return; }
    const reader = new FileReader();
    reader.onload = (evento: any) => { this.previewFoto = this.form.fotoPerfil = evento.target.result; };
    reader.readAsDataURL(file);
  }

  // Envia los datos actualizados del perfil al backend y redirige al perfil profesional
  async actualizarPerfil() {
    if (!this.userId) { await this.showToast('No se encontro el perfil', 'danger'); return; }
    this.cargando = true;

    // Busca el nombre del estado seleccionado para guardarlo en texto
    const estadoSeleccionado = this.estados.find(estado => estado._id === this.form.estadoId);

    const datos: any = {
      nombre:            this.form.nombre.trim(),
      edad:              Number(this.form.edad),
      fotoPerfil:        this.form.fotoPerfil,
      municipio:         this.form.municipio.trim(),
      estado:            estadoSeleccionado ? estadoSeleccionado.nombre : this.form.estado,
      profesion:         this.form.profesion.trim(),
      especialidad:      this.form.especialidad.trim(),
      cedulaProfesional: this.form.cedulaProfesional.trim(),
      biografia:         this.form.biografia.trim(),
      estadoPerfil:      this.form.estadoPerfil
    };
    datos['añosExperiencia'] = Number(this.form.anosExperiencia);

    this.profecionalService.actualizarPerfil(this.userId, datos).subscribe({
      next: async () => {
        // Actualiza la foto de perfil en el localStorage para que se refleje en el header
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        localStorage.setItem('usuario', JSON.stringify({ ...usuario, fotoPerfil: this.form.fotoPerfil }));
        await this.showToast('Perfil actualizado correctamente', 'success');
        this.router.navigate(['/perfil-profesional', this.userId]);
        this.cargando = false;
      },
      error: async (err) => {
        console.error(err);
        await this.showToast('Error al actualizar el perfil', 'danger');
        this.cargando = false;
      }
    });
  }

  // Muestra un mensaje temporal en la parte superior de la pantalla
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, duration: 3000, position: 'top', color });
    toast.present();
  }
}