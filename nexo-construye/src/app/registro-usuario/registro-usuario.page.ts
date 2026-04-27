import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Api } from '../service/api';

@Component({
  selector: 'app-registro-usuario',
  templateUrl: './registro-usuario.page.html',
  styleUrls: ['./registro-usuario.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RegistroUsuarioPage {

  correo = '';
  nombre = '';
  password = '';
  confirmPassword = '';

  constructor(
    private router: Router,
    private api: Api,
    private toastController: ToastController
  ) {}

  // Navega a la ruta indicada
  irA(ruta: string) {
    this.router.navigate(['/' + ruta]);
  }

  // Valida los campos y registra al usuario en la base de datos
  async register() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Valida que el correo tenga un formato valido
    if (!emailPattern.test(this.correo)) {
      await this.showToast('Debe ingresar un correo valido', 'danger'); return;
    }

    // Valida que las contrasenas coincidan
    if (this.password !== this.confirmPassword) {
      await this.showToast('Las contrasenas no coinciden', 'danger'); return;
    }

    // Valida que la contrasena tenga al menos 6 caracteres
    if (this.password.length < 6) {
      await this.showToast('La contrasena debe tener al menos 6 caracteres', 'danger'); return;
    }

    const usuario = {
      tipo: '', nombre: this.nombre.trim(), edad: 0, fotoPerfil: '',
      municipio: '', correo: this.correo.toLowerCase().trim(), contraseña: this.password
    };

    this.api.registerUser(usuario).subscribe({
      next: async () => {
        await this.showToast('Registro exitoso', 'success');
        this.router.navigate(['/login']);
      },
      error: async () => {
        await this.showToast('Error en el registro. Intenta nuevamente.', 'danger');
      }
    });
  }

  // Muestra un mensaje temporal en la parte superior de la pantalla
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, duration: 3000, position: 'top', color });
    toast.present();
  }

  // Redirige al backend para iniciar el flujo de registro con Google
  registrarConGoogle() {
    window.location.href = 'http://localhost:3000/auth/google';
  }
}