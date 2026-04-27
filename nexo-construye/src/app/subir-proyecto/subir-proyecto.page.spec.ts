import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubirProyectoPage } from './subir-proyecto.page';

describe('SubirProyectoPage', () => {
  let component: SubirProyectoPage;
  let fixture: ComponentFixture<SubirProyectoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubirProyectoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
