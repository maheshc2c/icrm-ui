import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Userlog } from './userlog';

describe('Userlog', () => {
  let component: Userlog;
  let fixture: ComponentFixture<Userlog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Userlog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Userlog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
