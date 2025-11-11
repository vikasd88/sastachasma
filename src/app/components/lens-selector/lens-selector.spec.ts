import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LensSelector } from './lens-selector';

describe('LensSelector', () => {
  let component: LensSelector;
  let fixture: ComponentFixture<LensSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LensSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LensSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
