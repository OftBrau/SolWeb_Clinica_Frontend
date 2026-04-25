import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaPage } from './consulta-page';

describe('ConsultaPage', () => {
  let component: ConsultaPage;
  let fixture: ComponentFixture<ConsultaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
