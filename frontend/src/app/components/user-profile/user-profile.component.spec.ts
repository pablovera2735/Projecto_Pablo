import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserProfileComponent } from './user-profile.component';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ElementRef } from '@angular/core';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: any;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = {
      paramMap: of({
        get: (key: string) => {
          if (key === 'id') return '123';
          return null;
        }
      })
    };

    await TestBed.configureTestingModule({
      declarations: [UserProfileComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;

    // Simular ElementRef para photoInput
    component.photoInput = {
      nativeElement: document.createElement('input')
    } as ElementRef<HTMLInputElement>;

    authServiceSpy.getUser.and.returnValue({
      id: 1,
      name: 'Test User',
      profile_photo: null
    });

    // Simular token en sessionStorage
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'token') return 'fake-token';
      if (key === 'user') return JSON.stringify({ id: 1, name: 'Test User', profile_photo: null });
      return null;
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user profile by id on init', () => {
    const mockProfileResponse = {
      name: 'User 123',
      profile_photo: 'photo.jpg',
      comments: []
    };
    httpClientSpy.get.and.returnValue(of(mockProfileResponse));

    component.ngOnInit();

    expect(httpClientSpy.get).toHaveBeenCalledWith(
      'http://filmania.ddns.net:8000/api/user/123/profile',
      jasmine.any(Object)
    );
  });

  it('should submit comment and clear input on success', () => {
    component.commentContent = 'Hello comment';
    httpClientSpy.post.and.returnValue(of({}));

    component.submitComment();

    expect(httpClientSpy.post).toHaveBeenCalled();
    expect(component.comments.length).toBeGreaterThanOrEqual(1);
    expect(component.commentContent).toBe('');
  });

  it('should alert when submitting empty comment', () => {
    spyOn(window, 'alert');
    component.commentContent = '   ';
    component.submitComment();
    expect(window.alert).toHaveBeenCalledWith('El comentario no puede estar vacío');
  });

  it('should toggle photo menu', () => {
    component.showPhotoMenu = false;
    component.togglePhotoMenu();
    expect(component.showPhotoMenu).toBeTrue();
  });

  it('should navigate to friend profile', () => {
    component.goToFriendProfile(42);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-profile', 42]);
  });

  it('should navigate back to menu', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/menu']);
  });

  it('should trigger photo upload input click', () => {
    spyOn(component.photoInput.nativeElement, 'click');
    component.showPhotoMenu = true;
    component.triggerPhotoUpload();
    expect(component.showPhotoMenu).toBeFalse();
    expect(component.photoInput.nativeElement.click).toHaveBeenCalled();
  });
});
