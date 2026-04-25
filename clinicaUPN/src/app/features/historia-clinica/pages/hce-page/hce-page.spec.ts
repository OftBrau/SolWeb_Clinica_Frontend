import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcePage } from './hce-page';

describe('HcePage', () => {
  let component: HcePage;
  let fixture: ComponentFixture<HcePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HcePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HcePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
