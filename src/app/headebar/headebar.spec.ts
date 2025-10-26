import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Headebar } from './headebar';

describe('Headebar', () => {
  let component: Headebar;
  let fixture: ComponentFixture<Headebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Headebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Headebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
