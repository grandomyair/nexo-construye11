import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-politica-de-cancelacion',
  templateUrl: './politica-de-cancelacion.page.html',
  styleUrls: ['./politica-de-cancelacion.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PoliticaDeCancelacionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
