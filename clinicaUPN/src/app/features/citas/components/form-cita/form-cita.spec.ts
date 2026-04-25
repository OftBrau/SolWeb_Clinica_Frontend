import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCita } from './form-cita';

describe('FormCita', () => {
  let component: FormCita;
  let fixture: ComponentFixture<FormCita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCita]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCita);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
