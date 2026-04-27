import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonBackButton, IonButtons, IonSpinner, IonIcon} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, starOutline, personCircleOutline } from 'ionicons/icons';
import { BusquedaService } from '../BusquedaService/busqueda-service';

@Component({
  selector: 'app-explorar-servicio',
  templateUrl: './explorar-servicio.page.html',
  styleUrls: ['./explorar-servicio.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonBackButton, IonButtons, IonSpinner, IonIcon,
  CommonModule, FormsModule
  ]
})
export class ExplorarServicioPage implements OnInit {

  profesionales: any[] = [];
  cargando = true;
  modo: 'explorar' | 'buscar' = 'explorar';
  profesionFiltro = '';
  profesiones: string[] = [];
  fechaFiltro = '';

  constructor(private busquedaService: BusquedaService,private route: ActivatedRoute,public router: Router
  ) {
    addIcons({ locationOutline, starOutline, personCircleOutline });
  }

  ngOnInit() {
    // Escucha los parametros de la URL para saber el modo y los filtros de busqueda
    this.route.queryParams.subscribe(params => {
      this.modo = params['modo'] || 'explorar';
      this.profesionFiltro = params['profesiones'] || '';
      // Convierte el string de profesiones separadas por coma en un array
      this.profesiones = this.profesionFiltro ? this.profesionFiltro.split(',') : [];
      this.fechaFiltro = params['fecha'] || '';
      this.cargar();
    });
  }

  cargar() {
    this.cargando = true;
    this.profesionales = [];

    if (this.modo === 'explorar') {
      // Modo explorar: trae todos los profesionales sin filtro
      this.busquedaService.explorar().subscribe({
        next: (data) => { this.profesionales = data; this.cargando = false; },
        error: (err) => { console.error(err); this.cargando = false; }
      });
    } else if (this.profesiones.length > 1) {
      // Si se seleccionaron varias profesiones hace una busqueda por cada una y combina los resultados
      const resultados: any[] = [];
      let completadas = 0;
      this.profesiones.forEach(profesion => {
        this.busquedaService.buscar(profesion, this.fechaFiltro).subscribe({
          next: (data) => {
            resultados.push(...data);
            completadas++;
            // Cuando terminan todas las busquedas elimina duplicados y ordena por calificacion
            if (completadas === this.profesiones.length) {
              const unicos = resultados.filter((profesional, indice, lista) =>
                indice === lista.findIndex(otro => otro._id === profesional._id)
              );
              this.profesionales = unicos.sort((profesionalA, profesionalB) =>
                (profesionalB.calificacionPromedio || 0) - (profesionalA.calificacionPromedio || 0)
              );
              this.cargando = false;
            }
          },
          error: () => {
            completadas++;
            if (completadas === this.profesiones.length) this.cargando = false;
          }
        });
      });
    } else {
      // Si solo hay una profesion hace una busqueda simple con el filtro y la fecha
      this.busquedaService.buscar(this.profesionFiltro, this.fechaFiltro).subscribe({
        next: (data) => { this.profesionales = data; this.cargando = false; },
        error: (err) => { console.error(err); this.cargando = false; }
      });
    }
  }

  Rutas(ruta: string) {
    this.router.navigate([ruta]);
  }
}