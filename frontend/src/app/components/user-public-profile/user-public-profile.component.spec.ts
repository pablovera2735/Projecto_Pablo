import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPublicProfileComponent } from './user-public-profile.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

describe('UserPublicProfileComponent', () => {
  let component: UserPublicProfileComponent;
  let fixture: ComponentFixture<UserPublicProfileComponent>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: any;

  beforeEach(async () => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = {
      paramMap: of({
        get: (key: string) => '123'
      })
    };

    await TestBed.configureTestingModule({
      declarations: [UserPublicProfileComponent],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserPublicProfileComponent);
    component = fixture.componentInstance;

    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'token') return 'fake-token';
      return null;
    });

    authServiceSpy.getUser.and.returnValue({ id: '999', name: 'Current User' });
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user profile on init', () => {
    const profileResponse = {
      name: 'User 123',
      profile_photo: 'photo.jpg',
      comments: [],
      favorites: [],
      friends: [{ id: '999' }],
      reviews: []
    };
    httpClientSpy.get.and.returnValue(of(profileResponse));

    component.ngOnInit();

    expect(component.userId).toBe('123');
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      'https://filmania.ddns.net:8000/api/user/123/public-profile',
      jasmine.any(Object)
    );
  });

  it('should identify own profile correctly', () => {
    authServiceSpy.getUser.and.returnValue({ id: '123' });
    component.userId = '123';
    component.checkIfOwnProfile();
    expect(component.isOwnProfile).toBeTrue();
  });

  it('should set isFriend to true if current user is friend', () => {
    component.friends = [{ id: '999' }];
    authServiceSpy.getUser.and.returnValue({ id: '999' });
    component.checkIfFriend();
    expect(component.isFriend).toBeTrue();
  });

  it('should send friend request successfully', () => {
    component.userId = '123';
    authServiceSpy.getUser.and.returnValue({ id: '999' });
    spyOn(window, 'alert');
    httpClientSpy.post.and.returnValue(of({}));

    component.isOwnProfile = false;
    component.isFriend = false;
    component.isPending = false;

    component.sendFriendRequest();

    expect(httpClientSpy.post).toHaveBeenCalledWith(
      'https://filmania.ddns.net:8000/api/friends',
      { friend_id: '123' },
      jasmine.any(Object)
    );
    expect(window.alert).toHaveBeenCalledWith('Solicitud de amistad enviada');
    expect(component.isPending).toBeTrue();
  });

  it('should handle friend request error', () => {
    component.userId = '123';
    authServiceSpy.getUser.and.returnValue({ id: '999' });
    spyOn(window, 'alert');
    httpClientSpy.post.and.returnValue(throwError(() => new Error('Error')));

    component.isOwnProfile = false;
    component.isFriend = false;
    component.isPending = false;

    component.sendFriendRequest();

    expect(window.alert).toHaveBeenCalledWith('Error al enviar solicitud de amistad');
  });
});
