import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConversacionesPage } from './conversaciones.page';

describe('ConversacionesPage', () => {
  let component: ConversacionesPage;
  let fixture: ComponentFixture<ConversacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
