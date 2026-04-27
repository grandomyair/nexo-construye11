import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoliticaDeReservacionPage } from './politica-de-reservacion.page';

describe('PoliticaDeReservacionPage', () => {
  let component: PoliticaDeReservacionPage;
  let fixture: ComponentFixture<PoliticaDeReservacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PoliticaDeReservacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
