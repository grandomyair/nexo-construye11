import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcercaDeNosotrosPage } from './acerca-de-nosotros.page';

describe('AcercaDeNosotrosPage', () => {
  let component: AcercaDeNosotrosPage;
  let fixture: ComponentFixture<AcercaDeNosotrosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AcercaDeNosotrosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
