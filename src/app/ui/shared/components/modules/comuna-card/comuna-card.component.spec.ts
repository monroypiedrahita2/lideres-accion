import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComunaCardComponent } from './comuna-card.component';

describe('ComunaCardComponent', () => {
  let component: ComunaCardComponent;
  let fixture: ComponentFixture<ComunaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComunaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComunaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
