import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameDetail } from './frame-detail';

describe('FrameDetail', () => {
  let component: FrameDetail;
  let fixture: ComponentFixture<FrameDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrameDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrameDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
