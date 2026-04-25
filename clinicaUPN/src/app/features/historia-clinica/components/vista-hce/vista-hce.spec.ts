import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaHce } from './vista-hce';

describe('VistaHce', () => {
  let component: VistaHce;
  let fixture: ComponentFixture<VistaHce>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaHce]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaHce);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
