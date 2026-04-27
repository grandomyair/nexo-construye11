import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendaDeDisponibilidadPage } from './agenda-de-disponibilidad.page';

describe('AgendaDeDisponibilidadPage', () => {
  let component: AgendaDeDisponibilidadPage;
  let fixture: ComponentFixture<AgendaDeDisponibilidadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendaDeDisponibilidadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
