import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticantePage } from './practicante-page';

describe('PracticantePage', () => {
  let component: PracticantePage;
  let fixture: ComponentFixture<PracticantePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticantePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PracticantePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
