import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPublicProfileComponent } from './user-public-profile.component';

describe('UserPublicProfileComponent', () => {
  let component: UserPublicProfileComponent;
  let fixture: ComponentFixture<UserPublicProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserPublicProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserPublicProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
