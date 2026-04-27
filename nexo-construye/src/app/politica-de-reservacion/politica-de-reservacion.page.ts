import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-politica-de-reservacion',
  templateUrl: './politica-de-reservacion.page.html',
  styleUrls: ['./politica-de-reservacion.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PoliticaDeReservacionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
