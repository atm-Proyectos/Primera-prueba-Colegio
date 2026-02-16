import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboarProfesorComponent } from './dashboar-profesor.component';

describe('DashboarProfesorComponent', () => {
  let component: DashboarProfesorComponent;
  let fixture: ComponentFixture<DashboarProfesorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboarProfesorComponent]
    });
    fixture = TestBed.createComponent(DashboarProfesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
