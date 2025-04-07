import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieForumComponent } from './movie-forum.component';

describe('MovieForumComponent', () => {
  let component: MovieForumComponent;
  let fixture: ComponentFixture<MovieForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MovieForumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MovieForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
