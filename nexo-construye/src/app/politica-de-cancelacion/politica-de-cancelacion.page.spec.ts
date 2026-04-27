import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoliticaDeCancelacionPage } from './politica-de-cancelacion.page';

describe('PoliticaDeCancelacionPage', () => {
  let component: PoliticaDeCancelacionPage;
  let fixture: ComponentFixture<PoliticaDeCancelacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PoliticaDeCancelacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
