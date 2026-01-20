import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NotasComponent } from './notas.component';
import { ApiService } from 'src/app/services/api.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('NotasComponent', () => {
  let component: NotasComponent;
  let fixture: ComponentFixture<NotasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotasComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [ApiService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    fixture = TestBed.createComponent(NotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});