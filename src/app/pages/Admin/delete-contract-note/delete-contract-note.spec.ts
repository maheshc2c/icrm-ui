import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteContractNote } from './delete-contract-note';

describe('DeleteContractNote', () => {
  let component: DeleteContractNote;
  let fixture: ComponentFixture<DeleteContractNote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteContractNote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteContractNote);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
