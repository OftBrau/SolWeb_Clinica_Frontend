import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientePage } from './paciente-page';

describe('PacientePage', () => {
  let component: PacientePage;
  let fixture: ComponentFixture<PacientePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacientePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
