import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPerfilProfecionalPage } from './crear-perfil-profecional.page';

describe('CrearPerfilProfecionalPage', () => {
  let component: CrearPerfilProfecionalPage;
  let fixture: ComponentFixture<CrearPerfilProfecionalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPerfilProfecionalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
