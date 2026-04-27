import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-politica-de-privacidad',
  templateUrl: './politica-de-privacidad.page.html',
  styleUrls: ['./politica-de-privacidad.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PoliticaDePrivacidadPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
