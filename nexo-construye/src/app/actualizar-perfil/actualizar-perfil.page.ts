import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonAvatar, IonIcon, IonButtons, IonBackButton,
IonSelect, IonSelectOption, IonText, ToastController,} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, cameraOutline } from 'ionicons/icons';
import { Api } from '../service/api';
import { EstadosApi } from '../estadosApi/estados-api';

@Component({
  selector: 'app-actualizar-perfil',
  templateUrl: './actualizar-perfil.page.html',
  styleUrls: ['./actualizar-perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonAvatar, IonIcon, IonButtons, IonBackButton,
  IonSelect, IonSelectOption, IonText, CommonModule, FormsModule
  ]
})
export class ActualizarPerfilPage implements OnInit {

  // Referencia al input de archivo oculto para abrir el selector de imagenes
  @ViewChild('fileInput') fileInput!: ElementRef;

  form = { nombre: '', edad: 0, estadoId: null as number | null, estado: '', municipio: '', fotoPerfil: '' };
  previewFoto = '';
  cargando = false;
  userId = '';
  estados: any[] = [];
  municipios: any[] = [];

  constructor(
    private api: Api,
    private estadosApi: EstadosApi,
    public router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) { addIcons({ personCircleOutline, cameraOutline }); }

  ngOnInit() {
    // Obtiene el ID del usuario desde la URL o desde el localStorage
    this.userId = this.route.snapshot.queryParamMap.get('id') ||
    JSON.parse(localStorage.getItem('usuario') || '{}')?.id || '';

    if (!this.userId) { this.router.navigate(['/login']); return; }

    // Carga la lista de estados disponibles para el selector
    this.estadosApi.getEstados().subscribe({
      next: (res: any) => this.estados = res.data,
      error: (err) => console.error(err)
    });

    // Carga los datos actuales del usuario para prellenar el formulario
    this.api.getUsuarioById(this.userId).subscribe({
      next: (data: any) => {
        this.form = { ...this.form, nombre: data.nombre || '', edad: data.edad || 0,
          estado: data.estado || '', municipio: data.municipio || '', fotoPerfil: data.fotoPerfil || '' };
        this.previewFoto = data.fotoPerfil || '';
      },
      error: (err) => console.error(err)
    });
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

  // Envia los datos actualizados al backend y actualiza el localStorage con los nuevos datos
  async actualizarPerfil() {
    if (!this.userId) { await this.showToast('No se encontro el usuario', 'danger'); return; }
    this.cargando = true;

    if (this.form.edad < 1 || this.form.edad > 100) {
    await this.showToast('Escribe una edad correcta entre 1 y 100 años', 'warning');
    return;
  }

    // Busca el nombre del estado seleccionado para guardarlo en texto
    const estadoSeleccionado = this.estados.find(estado => estado._id === this.form.estadoId);
    const datos = {
      nombre: this.form.nombre.trim(),
      edad: Number(this.form.edad),
      estado: estadoSeleccionado ? estadoSeleccionado.nombre : this.form.estado,
      municipio: this.form.municipio.trim(),
      fotoPerfil: this.form.fotoPerfil
    };

    this.api.updateUsuario(this.userId, datos).subscribe({
      next: async () => {
        // Actualiza los datos del usuario en el localStorage para reflejar los cambios
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (usuario?.id) localStorage.setItem('usuario', JSON.stringify({ ...usuario, ...datos }));
        await this.showToast('Perfil actualizado correctamente', 'success');
        this.router.navigate(['/perfil-usuario', this.userId]);
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

  limitarEdad() {
  if (this.form.edad > 100) this.form.edad = 100;
  if (this.form.edad < 1) this.form.edad = 1;
}
 Rutas(ruta: string) {
    this.router.navigate([ruta]);
  }
}