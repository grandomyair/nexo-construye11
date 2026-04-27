import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplorarServicioPage } from './explorar-servicio.page';

describe('ExplorarServicioPage', () => {
  let component: ExplorarServicioPage;
  let fixture: ComponentFixture<ExplorarServicioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorarServicioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
