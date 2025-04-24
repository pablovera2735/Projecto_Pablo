import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularAuthorsComponent } from './popular-authors.component';

describe('PopularAuthorsComponent', () => {
  let component: PopularAuthorsComponent;
  let fixture: ComponentFixture<PopularAuthorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopularAuthorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PopularAuthorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
