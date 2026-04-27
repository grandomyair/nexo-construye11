import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisReservacionesPage } from './mis-reservaciones.page';

describe('MisReservacionesPage', () => {
  let component: MisReservacionesPage;
  let fixture: ComponentFixture<MisReservacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisReservacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
