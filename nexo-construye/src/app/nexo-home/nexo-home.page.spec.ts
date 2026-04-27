import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NexoHomePage } from './nexo-home.page';

describe('NexoHomePage', () => {
  let component: NexoHomePage;
  let fixture: ComponentFixture<NexoHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NexoHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
