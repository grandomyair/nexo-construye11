import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RecuperarPasswordPage implements OnInit {

  token = '';
  nuevaPassword = '';
  confirmarPassword = '';
  cargando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  async restablecer() {
    if (!this.nuevaPassword || !this.confirmarPassword) {
      return this.mostrarAlerta('Error', 'Completa todos los campos');
    }
    if (this.nuevaPassword !== this.confirmarPassword) {
      return this.mostrarAlerta('Error', 'Las contraseñas no coinciden');
    }

    this.cargando = true;
    try {
      const res = await fetch('http://localhost:3000/auth/password/restablecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token, nuevaPassword: this.nuevaPassword })
      });

      if (res.ok) {
        await this.mostrarAlerta('Éxito', 'Contraseña actualizada correctamente');
        this.router.navigate(['/login']);
      } else {
        await this.mostrarAlerta('Error', 'El enlace expiró o es inválido');
      }
    } catch {
      await this.mostrarAlerta('Error', 'Error de conexión');
    }
    this.cargando = false;
  }

  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}