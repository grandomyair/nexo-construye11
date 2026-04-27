import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoliticaDePrivacidadPage } from './politica-de-privacidad.page';

describe('PoliticaDePrivacidadPage', () => {
  let component: PoliticaDePrivacidadPage;
  let fixture: ComponentFixture<PoliticaDePrivacidadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PoliticaDePrivacidadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
