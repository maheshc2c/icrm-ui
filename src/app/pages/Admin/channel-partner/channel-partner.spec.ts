import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelPartner } from './channel-partner';

describe('ChannelPartner', () => {
  let component: ChannelPartner;
  let fixture: ComponentFixture<ChannelPartner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelPartner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelPartner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
