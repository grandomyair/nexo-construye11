import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilProfesionalPage } from './perfil-profesional.page';

describe('PerfilProfesionalPage', () => {
  let component: PerfilProfesionalPage;
  let fixture: ComponentFixture<PerfilProfesionalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilProfesionalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
