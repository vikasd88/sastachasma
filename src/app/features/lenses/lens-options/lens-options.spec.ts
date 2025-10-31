import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LensOptions } from './lens-options';

describe('LensOptions', () => {
  let component: LensOptions;
  let fixture: ComponentFixture<LensOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LensOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LensOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
