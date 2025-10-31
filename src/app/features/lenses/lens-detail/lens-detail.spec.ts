import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LensDetail } from './lens-detail';

describe('LensDetail', () => {
  let component: LensDetail;
  let fixture: ComponentFixture<LensDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LensDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LensDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
