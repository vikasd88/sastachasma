import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameList } from './frame-list';

describe('FrameList', () => {
  let component: FrameList;
  let fixture: ComponentFixture<FrameList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrameList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrameList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
