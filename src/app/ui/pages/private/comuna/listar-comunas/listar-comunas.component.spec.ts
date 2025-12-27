import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarComunasComponent } from './listar-comunas.component';

describe('ListarComunasComponent', () => {
  let component: ListarComunasComponent;
  let fixture: ComponentFixture<ListarComunasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarComunasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarComunasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
