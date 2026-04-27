import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActualizarPerfilProfesionalPage } from './actualizar-perfil-profesional.page';

describe('ActualizarPerfilProfesionalPage', () => {
  let component: ActualizarPerfilProfesionalPage;
  let fixture: ComponentFixture<ActualizarPerfilProfesionalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizarPerfilProfesionalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
