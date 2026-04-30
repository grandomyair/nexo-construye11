import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,IonButtons, IonBackButton, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline, star, personCircleOutline } from 'ionicons/icons';
import { ReseñaService } from '../ReseñaService/reseña-service';

@Component({
  selector: 'app-resenas',
  templateUrl: './resenas.page.html',
  styleUrls: ['./resenas.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
    IonButtons, IonBackButton, IonSpinner, CommonModule
  ]
})
export class ResenasPage implements OnInit {

  resenas: any[] = [];
  cargando = true;
  profesionalId = '';
  nombre = '';
  readonly estrellas = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,private reseñaService: ReseñaService,public router: Router
  ) {
    addIcons({ starOutline, star, personCircleOutline });
  }

  ngOnInit() {
    // Obtiene el ID del profesional y su nombre desde la URL
    this.profesionalId = this.route.snapshot.paramMap.get('id') || '';
    this.nombre = this.route.snapshot.queryParamMap.get('nombre') || '';
    if (this.profesionalId) this.cargar();
  }

  // Carga todas las resenas del profesional
  cargar() {
    this.reseñaService.getReseñasByProfesional(this.profesionalId).subscribe({
      next: (data) => { this.resenas = data; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  // Calcula el promedio de calificacion de todas las resenas
  promedio(): number {
    if (!this.resenas.length) return 0;
    return parseFloat((this.resenas.reduce((acumulador, resena) => acumulador + resena.calificacion, 0) / this.resenas.length).toFixed(1));
  }

    Rutas(ruta: string) {
    this.router.navigate([ruta]);
  }
}