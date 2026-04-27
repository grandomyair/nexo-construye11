import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Api } from '../service/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage implements OnInit {

  username = '';
  password = '';

  constructor(private api: Api,private router: Router,private route: ActivatedRoute,private alertController: AlertController
  ) {}

  ngOnInit() {
    // Detecta si viene un token y usuario en la URL despues del login con Google
    // y los guarda en el localStorage para iniciar la sesion automaticamente
    this.route.queryParams.subscribe(params => {
      if (params['token'] && params['usuario']) {
        try {
          const usuario = JSON.parse(decodeURIComponent(params['usuario']));
          localStorage.setItem('token', params['token']);
          localStorage.setItem('usuario', JSON.stringify(usuario));
          this.router.navigate(['/nexo-home']);
        } catch (e) {
          console.error('Error parseando usuario de Google', e);
        }
      }
    });
  }

  // Navega a la ruta indicada
  irA(ruta: string) {
    this.router.navigate(['/' + ruta]);
  }

  // Redirige al backend para iniciar el flujo de autenticacion con Google
  loginConGoogle() {
    window.location.href = 'http://localhost:3000/auth/google';
  }

  // Inicia sesion con correo y contrasena guardando el token y usuario en el localStorage
  async login() {
    // Verifica que se hayan ingresado correo y contrasena
    if (!this.username || !this.password) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor ingresa correo y contrasena',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.api.loginUser({ correo: this.username, contraseña: this.password }).subscribe({
      next: async (res: any) => {
        // Guarda el token y los datos del usuario en el localStorage
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        const alert = await this.alertController.create({
          header: 'Exito',
          message: 'Bienvenido ' + res.usuario.nombre,
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/nexo-home']);
      },
      error: async () => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Correo o contrasena incorrectos',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  // Muestra un dialogo para ingresar el correo y enviar el enlace de recuperacion de contrasena
  async olvideMiPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar contrasena',
      message: 'Ingresa tu correo para recibir el enlace de recuperacion',
      inputs: [{ name: 'correo', type: 'email', placeholder: 'tu@correo.com' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: async (data) => {
            if (!data.correo) return false;
            try {
              // Envia el correo al backend para generar el enlace de recuperacion
              const res = await fetch('http://localhost:3000/auth/password/solicitar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: data.correo })
              });
              if (res.ok) {
                const alertOk = await this.alertController.create({
                  header: 'Correo enviado',
                  message: 'Revisa tu bandeja de entrada',
                  buttons: ['OK']
                });
                alertOk.present();
              } else {
                const alertErr = await this.alertController.create({
                  header: 'Error',
                  message: 'Correo no registrado',
                  buttons: ['OK']
                });
                alertErr.present();
              }
            } catch {
              console.error('Error al solicitar recuperacion');
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
}