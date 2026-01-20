import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { AsignaturasComponent } from './asignaturas.component';
import { ApiService } from 'src/app/services/api.service';

describe('AsignaturasComponent', () => {
  let component: AsignaturasComponent;
  let fixture: ComponentFixture<AsignaturasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AsignaturasComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [ApiService]
    });
    fixture = TestBed.createComponent(AsignaturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});